import { Map }                               from 'immutable';
import { createStore, applyMiddleware }      from 'redux';
import thunk                                 from 'redux-thunk';
import { localize }                          from 'deriv-translations';
import Balance                               from './Balance';
import OpenContract                          from './OpenContract';
import Proposal                              from './Proposal';
import Purchase                              from './Purchase';
import Sell                                  from './Sell';
import { start }                             from './state/actions';
import * as constants                        from './state/constants';
import rootReducer                           from './state/reducers';
import Ticks                                 from './Ticks';
import Total                                 from './Total';
import { doUntilDone }                       from '../utils/helpers';
import { expectInitArg, expectTradeOptions } from '../utils/sanitize';
import createError                           from '../../../utils/error';
import { durationToSecond }                  from '../../../utils/tools';
import { observer as globalObserver }        from '../../../utils/observer';

const watchBefore = store =>
    watchScope({
        store,
        stopScope: constants.DURING_PURCHASE,
        passScope: constants.BEFORE_PURCHASE,
        passFlag : 'proposalsReady',
    });

const watchDuring = store =>
    watchScope({
        store,
        stopScope: constants.STOP,
        passScope: constants.DURING_PURCHASE,
        passFlag : 'openContract',
    });

/* The watchScope function is called randomly and resets the prevTick
 * which leads to the same problem we try to solve. So prevTick is isolated
 */
let prevTick;
const watchScope = ({ store, stopScope, passScope, passFlag }) => {
    // in case watch is called after stop is fired
    if (store.getState().scope === stopScope) {
        return Promise.resolve(false);
    }
    return new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
            const newState = store.getState();

            if (newState.newTick === prevTick) return;
            prevTick = newState.newTick;

            if (newState.scope === passScope && newState[passFlag]) {
                unsubscribe();
                resolve(true);
            }

            if (newState.scope === stopScope) {
                unsubscribe();
                resolve(false);
            }
        });
    });
};

export default class TradeEngine extends Balance(Purchase(Sell(OpenContract(Proposal(Ticks(Total(class {}))))))) {
    constructor($scope) {
        super();
        this.api = $scope.api;
        this.observer = $scope.observer;
        this.$scope = $scope;
        this.observe();
        this.data = new Map();
        this.store = createStore(rootReducer, applyMiddleware(thunk));
    }

    init(...args) {
        const [token, options] = expectInitArg(args);

        const { symbol } = options;

        this.initArgs = args;

        this.options = options;

        this.startPromise = this.loginAndGetBalance(token);

        this.watchTicks(symbol);
    }

    start(tradeOptions) {
        if (!this.options) {
            throw createError('NotInitialized', localize('Bot.init is not called'));
        }

        globalObserver.emit('bot.running');

        this.tradeOptions = expectTradeOptions(tradeOptions);

        this.store.dispatch(start());

        this.checkLimits(tradeOptions);

        this.makeProposals({ ...this.options, ...tradeOptions });

        this.checkProposalReady();
    }

    loginAndGetBalance(token) {
        if (this.token === token) {
            return Promise.resolve();
        }

        doUntilDone(() => this.api.authorize(token)).catch(e => this.$scope.observer.emit('Error', e));

        return new Promise(resolve =>
            this.listen('authorize', ({ authorize }) => {
                this.accountInfo = authorize;
                this.token = token;

                // Only subscribe to balance in browser, not for tests.
                if (document) {
                    this.api.subscribeToBalance().then(r => {
                        this.balance = Number(r.balance.balance);
                        resolve();
                    });
                } else {
                    resolve();
                }
            })
        );
    }

    getContractDuration() {
        const { duration, duration_unit: durationUnit } = this.tradeOptions;

        return durationToSecond(`${duration}${durationUnit}`);
    }

    observe() {
        this.observeOpenContract();

        this.observeBalance();

        this.observeProposals();
    }

    watch(watchName) {
        if (watchName === 'before') {
            return watchBefore(this.store);
        }
        return watchDuring(this.store);
    }

    getData() {
        return this.data;
    }

    listen(n, f) {
        this.api.events.on(n, f);
    }
}
