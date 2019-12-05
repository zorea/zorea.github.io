import PropTypes         from 'prop-types';
import React             from 'react';
import { withRouter }    from 'react-router-dom';
import { localize }      from 'deriv-translations';
import { FadeWrapper }   from 'App/Components/Animations';
import VerticalTab       from 'App/Components/Elements/VerticalTabs/vertical-tab.jsx';
import routes            from 'Constants/routes';
import { connect }       from 'Stores/connect';
import WalletInformation from '../../Reports/Containers/wallet-information.jsx';

class Cashier extends React.Component {
    setWrapperRef = (node) => {
        this.wrapper_ref = node;
    };

    handleClickOutside = (event) => {
        if (this.wrapper_ref && !this.wrapper_ref.contains(event.target)) {
            this.props.history.push(routes.trade);
        }
    };

    componentDidMount() {
        this.props.enableRouteMode();
        document.addEventListener('mousedown', this.handleClickOutside);
        this.props.toggleCashier();
        // we still need to populate the tabs shown on cashier
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.toggleCashier();
        this.props.disableRouteMode();
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render () {
        const menu_options = () => {
            const options = [];

            this.props.routes.forEach(route => {
                if ((route.path !== routes.cashier_pa || this.props.is_payment_agent_visible) &&
                    (route.path !== routes.cashier_pa_transfer || this.props.is_payment_agent_transfer_visible)) {
                    options.push({
                        default: route.default,
                        icon   : route.icon_component,
                        label  : route.title,
                        value  : route.component,
                        path   : route.path,
                    });
                }
            });

            return options;
        };

        const action_bar_items = [
            {
                onClick: () => {
                    this.props.history.push(routes.trade);
                },
                icon : 'ModalIconClose',
                title: localize('Close'),
            },
            {
                component: () => <WalletInformation />,
                title    : '',
            },
        ];
        return (
            <FadeWrapper
                is_visible={this.props.is_visible}
                className='cashier-page-wrapper'
                keyname='cashier-page-wrapper'
            >
                <div className='cashier' ref={this.setWrapperRef}>
                    <VerticalTab
                        header_title={localize('Cashier')}
                        action_bar={action_bar_items}
                        action_bar_classname='cashier__inset_header'
                        alignment='center'
                        id='cashier'
                        classNameHeader='cashier__tab-header'
                        current_path={this.props.location.pathname}
                        is_routed={true}
                        is_full_width={true}
                        list={menu_options()}
                    />
                </div>
            </FadeWrapper>
        );
    }
}

Cashier.propTypes = {
    disableRouteMode                 : PropTypes.func,
    enableRouteMode                  : PropTypes.func,
    history                          : PropTypes.object,
    is_payment_agent_transfer_visible: PropTypes.bool,
    is_payment_agent_visible         : PropTypes.bool,
    is_visible                       : PropTypes.bool,
    location                         : PropTypes.object,
    onMount                          : PropTypes.func,
    routes                           : PropTypes.arrayOf(PropTypes.object),
    toggleCashier                    : PropTypes.func,
};

export default connect(
    ({ modules, ui }) => ({
        disableRouteMode        : ui.disableRouteModal,
        enableRouteMode         : ui.setRouteModal,
        is_visible              : ui.is_cashier_visible,
        is_payment_agent_visible: !!(modules.cashier.config.payment_agent.filtered_list.length
            || modules.cashier.config.payment_agent.agents.length),
        is_payment_agent_transfer_visible: modules.cashier.config.payment_agent_transfer.is_payment_agent,
        onMount                          : modules.cashier.onMountCommon,
        toggleCashier                    : ui.toggleCashier,
    })
)(withRouter(Cashier));
