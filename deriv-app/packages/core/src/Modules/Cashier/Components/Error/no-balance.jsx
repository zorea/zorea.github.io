import PropTypes              from 'prop-types';
import React                  from 'react';
import { withRouter }         from 'react-router-dom';
import { Button }             from 'deriv-components';
import { localize, Localize } from 'deriv-translations';
import Icon                   from 'Assets/icon.jsx';
import routes                 from 'Constants/routes';
import { connect }            from 'Stores/connect';

class NoBalance extends React.Component {
    onClickDeposit = () => {
        // index of deposit tab in the cashier modal is 0
        this.props.setModalIndex(0);
        this.props.history.push(routes.cashier_deposit);
    };

    render = () => {
        return (
            <div className='cashier__wrapper cashier__no-balance cashier__center-align-wrapper'>
                <div className='cashier__center-align-content'>
                    <Icon icon='IconNoBalance' className='cashier__no-balance-icon' />
                    <h2 className='withdraw__header'><Localize i18n_default_text='You have no funds in your {{currency}} account' values={{ currency: this.props.currency.toUpperCase() }} /></h2>
                    <p className='cashier__text'><Localize i18n_default_text='Please make a deposit to use this feature.' /></p>
                    <Button
                        className='cashier__no-balance-button'
                        has_effect
                        text={localize('Deposit now')}
                        onClick={this.onClickDeposit}
                        primary
                        large
                    />
                </div>
            </div>
        );
    }
}

NoBalance.propTypes = {
    currency     : PropTypes.string,
    setModalIndex: PropTypes.func,
};

export default connect(
    ({ client, ui }) => ({
        currency     : client.currency,
        setModalIndex: ui.setModalIndex,
    })
)(withRouter(NoBalance));

