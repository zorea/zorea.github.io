import { localize }                                    from 'deriv-translations';
import { proposalsReady, clearProposals }              from './state/actions';
import { tradeOptionToProposal, doUntilDone, getUUID } from '../utils/helpers';

export default Engine =>
    class Proposal extends Engine {
        makeProposals(tradeOption) {
            if (!this.isNewTradeOption(tradeOption)) {
                return;
            }
            this.tradeOption = tradeOption;
            this.proposalTemplates = tradeOptionToProposal(tradeOption);
            this.renewProposalsOnPurchase();
        }

        selectProposal(contractType) {
            let toBuy;

            if (!this.data.has('proposals')) {
                throw Error(localize('Proposals are not ready'));
            }

            this.data.get('proposals').forEach(proposal => {
                if (proposal.contractType === contractType) {
                    if (proposal.error) {
                        throw Error(proposal.error.error.error.message);
                    } else {
                        toBuy = proposal;
                    }
                }
            });

            if (!toBuy) {
                throw Error(localize('Selected proposal does not exist'));
            }

            return {
                id      : toBuy.id,
                askPrice: toBuy.ask_price,
            };
        }

        renewProposalsOnPurchase() {
            this.unsubscribeProposals().then(() => this.requestProposals());
        }

        clearProposals() {
            this.data = this.data.set('proposals', new Map());
            this.store.dispatch(clearProposals());
        }

        requestProposals() {
            this.proposalTemplates.map(proposal =>
                doUntilDone(() =>
                    this.api
                        .subscribeToPriceForContractProposal({
                            ...proposal,
                            passthrough: {
                                contractType: proposal.contract_type,
                                uuid        : getUUID(),
                            },
                        })
                        // eslint-disable-next-line consistent-return
                        .catch(e => {
                            if (e && e.name === 'RateLimit') {
                                return Promise.reject(e);
                            }

                            const errorCode = e.error && e.error.error && e.error.error.code;

                            if (errorCode === 'ContractBuyValidationError') {
                                const { uuid } = e.error.echo_req.passthrough;

                                if (!this.data.hasIn(['forgetProposals', uuid])) {
                                    this.data = this.data.setIn(['proposals', uuid], {
                                        ...proposal,
                                        contractType: proposal.contract_type,
                                        error       : e,
                                    });
                                }
                            } else {
                                this.$scope.observer.emit('Error', e);
                            }
                        })
                )
            );
        }

        observeProposals() {
            this.listen('proposal', r => {
                const { proposal, passthrough } = r;
                const id = passthrough.uuid;

                if (!this.data.hasIn(['forgetProposals', id])) {
                    this.data = this.data.setIn(['proposals', id], {
                        ...proposal,
                        ...passthrough,
                    });
                    this.checkProposalReady();
                }
            });
        }

        unsubscribeProposals() {
            const proposalObj = this.data.get('proposals');

            if (!proposalObj) {
                return Promise.resolve();
            }

            const proposals = Array.from(proposalObj.values());

            this.clearProposals();

            return Promise.all(
                proposals.map(proposal => {
                    const { uuid: id } = proposal;
                    const removeProposal = () => {
                        this.data = this.data.deleteIn(['forgetProposals', id]);
                    };

                    this.data = this.data.setIn(['forgetProposals', id], true);

                    if (proposal.error) {
                        removeProposal();
                        return Promise.resolve();
                    }

                    return doUntilDone(() => this.api.unsubscribeByID(proposal.id)).then(() => removeProposal());
                })
            );
        }

        checkProposalReady() {
            const proposals = this.data.get('proposals');

            if (proposals && proposals.size === this.proposalTemplates.length) {
                this.startPromise.then(() => this.store.dispatch(proposalsReady()));
            }
        }

        isNewTradeOption(tradeOption) {
            if (!this.tradeOption) {
                this.tradeOption = tradeOption;
                return true;
            }

            const isNotEqual = key => this.tradeOption[key] !== tradeOption[key];

            return (
                isNotEqual('duration') ||
                isNotEqual('duration_unit') ||
                isNotEqual('amount') ||
                isNotEqual('prediction') ||
                isNotEqual('barrierOffset') ||
                isNotEqual('secondBarrierOffset') ||
                isNotEqual('symbol')
            );
        }
    };
