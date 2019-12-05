import TicksInterface                   from './TicksInterface';
import ToolsInterface                   from './ToolsInterface';
import TradeEngine                      from '../trade';
import { noop, createDetails }          from '../utils/helpers';
import { observer as globalObserver }   from '../../../utils/observer';

/**
 * Bot - Bot Module
 * @namespace Bot
 */

export default class Interface extends ToolsInterface(TicksInterface(class {})) {
    constructor($scope) {
        super();
        this.tradeEngine = new TradeEngine($scope);
        this.api = $scope.api;
        this.observer = $scope.observer;
        this.$scope = $scope;
    }

    getInterface(name = 'Global') {
        if (name === 'Bot') {
            return {
                ...this.getBotInterface(),
                ...this.getToolsInterface(),
            };
        }
        return {
            watch  : (...args) => this.tradeEngine.watch(...args),
            sleep  : (...args) => this.sleep(...args),
            alert  : (...args) => alert(...args), // eslint-disable-line no-alert
            prompt : (...args) => prompt(...args), // eslint-disable-line no-alert
            console: {
                log(...args) {
                    // eslint-disable-next-line no-console
                    console.log(new Date().toLocaleTimeString(), ...args);
                },
            },
        };
    }

    getBotInterface() {
        const getDetail = i => createDetails(this.get('contract'))[i];

        return {
            init           : (...args) => this.tradeEngine.init(...args),
            start          : (...args) => this.tradeEngine.start(...args),
            stop           : (...args) => this.tradeEngine.stop(...args),
            purchase       : contractType => this.tradeEngine.purchase(contractType),
            getAskPrice    : contractType => Number(this.getProposal(contractType).ask_price),
            getPayout      : contractType => Number(this.getProposal(contractType).payout),
            isSellAvailable: () => this.tradeEngine.isSellAtMarketAvailable(),
            sellAtMarket   : () => this.tradeEngine.sellAtMarket(),
            getSellPrice   : () => this.getSellPrice(),
            isResult       : result => getDetail(10) === result,
            isTradeAgain   : result => globalObserver.emit('bot.trade_again', result),
            readDetails    : i => getDetail(i - 1),
        };
    }

    sleep(arg = 1) {
        return new Promise(
            r =>
                setTimeout(() => {
                    r();
                    setTimeout(() => this.observer.emit('CONTINUE'), 0);
                }, arg * 1000),
            noop
        );
    }

    getProposal(contractType) {
        const proposals = this.get('proposals');

        let proposal;

        proposals.forEach(p => {
            if (p.contractType === contractType) {
                proposal = p;
            }
        });

        return proposal;
    }

    getSellPrice() {
        return this.tradeEngine.getSellPrice();
    }

    get(key) {
        return this.tradeEngine.getData().get(key);
    }
}
