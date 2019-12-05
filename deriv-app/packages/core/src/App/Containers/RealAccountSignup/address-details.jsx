import {
    Autocomplete,
    Input,
    ThemedScrollbars }        from 'deriv-components';
import { Formik, Field }      from 'formik';
import React, { Component }   from 'react';
import { connect }            from 'Stores/connect';
import { localize, Localize } from 'deriv-translations';
import FormSubmitButton       from './form-submit-button.jsx';

const InputField = (props) => {
    return (
        <Field name={props.name}>
            {
                ({
                    field,
                    form: { errors, touched },
                }) => (
                    <React.Fragment>
                        <Input
                            type='text'
                            autoComplete='off'
                            maxLength='30'
                            error={touched[field.name] && errors[field.name]}
                            {...field}
                            {...props}
                        />
                    </React.Fragment>
                )
            }
        </Field>
    );
};

class AddressDetails extends Component {
    constructor(props) {
        super(props);
        this.state = { has_fetched_states_list: false };
        this.form = React.createRef();
        // TODO: Find a better solution for handling no-op instead of using is_mounted flags
        this.is_mounted = false;
    }

    async componentDidMount() {
        this.is_mounted = true;
        await this.props.fetchStatesList();
        if (this.is_mounted) this.setState({ has_fetched_states_list: true });
        this.form.current.getFormikActions().validateForm();
    }

    componentWillUnmount() {
        this.is_mounted = false;
    }

    handleCancel = (values) => {
        this.props.onSave(this.props.index, values);
        this.props.onCancel();
    };

    render() {
        return (
            <Formik
                initialValues={{
                    address_line_1  : this.props.value.address_line_1,
                    address_line_2  : this.props.value.address_line_2,
                    address_city    : this.props.value.address_city,
                    address_state   : this.props.value.address_state,
                    address_postcode: this.props.value.address_postcode,
                }}
                validate={this.validateAddressDetails}
                onSubmit={(values, actions) => {
                    this.props.onSubmit(this.props.index, values, actions.setSubmitting);
                }}
                ref={this.form}
            >
                {
                    ({
                        handleSubmit,
                        isSubmitting,
                        errors,
                        values,
                        setFieldValue,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <div className='details-form'>
                                <p className='details-form__description'>
                                    <Localize
                                        i18n_default_text='Please ensure that this address is the same as in your proof of address'
                                    />
                                </p>
                                <div className='details-form__elements-container'>
                                    <ThemedScrollbars
                                        autoHide={!(window.innerHeight < 890)}
                                        style={{
                                            height: 'calc(100% - 16px)',
                                        }}
                                    >
                                        <div className='details-form__elements' style={{ paddingBottom: (window.innerHeight < 930) ? '10rem' : '12rem' }}>
                                            <InputField
                                                name='address_line_1'
                                                required
                                                label={localize('First line of address*')}
                                                placeholder={localize('First line of address')}
                                            />
                                            <InputField
                                                name='address_line_2'
                                                label={localize('Second line of address')}
                                                placeholder={localize('Second line of address')}
                                            />
                                            <InputField
                                                name='address_city'
                                                required
                                                label={localize('Town/City*')}
                                                placeholder={localize('Town/City')}
                                            />
                                            { this.state.has_fetched_states_list &&
                                                <React.Fragment>
                                                    { (this.props.states_list.length > 0) ?
                                                        <Field name='address_state'>
                                                            {({ field }) => (
                                                                <Autocomplete
                                                                    { ...field }
                                                                    data-lpignore='true'
                                                                    autoComplete='new-password' // prevent chrome autocomplete
                                                                    dropdown_offset='3.2rem'
                                                                    type='text'
                                                                    label={ localize('State/Province') }
                                                                    list_items={this.props.states_list}
                                                                    onItemSelection={
                                                                        ({ value, text }) => setFieldValue('address_state', value ? text : '', true)
                                                                    }
                                                                />
                                                            )}
                                                        </Field>
                                                        :
                                                        <InputField
                                                            name='address_state'
                                                            label={ localize('State/Province') }
                                                            placeholder={ localize('State/Province') }
                                                        />
                                                    }
                                                </React.Fragment>
                                            }
                                            <InputField
                                                name='address_postcode'
                                                required
                                                label={localize('Postal/ZIP Code*')}
                                                placeholder={localize('Postal/ZIP Code')}
                                            />
                                        </div>
                                    </ThemedScrollbars>
                                </div>
                            </div>
                            <FormSubmitButton
                                is_absolute
                                is_disabled={
                                    // eslint-disable-next-line no-unused-vars
                                    isSubmitting ||
                                    Object.keys(errors).length > 0
                                }
                                label={localize('Next')}
                                has_cancel
                                cancel_label={localize('Previous')}
                                onCancel={this.handleCancel.bind(this, values)}
                            />
                        </form>
                    )
                }
            </Formik>
        );
    }

    validateAddressDetails = (values) => {
        const validations = {
            address_line_1: [
                v => !!v,
                v => /^[\w\W\s\/-]{1,70}$/gu.exec(v) !== null,
            ],
            address_line_2: [
                v => !v || (/^[\w\W\s\/-]{0,70}$/gu.exec(v) !== null),
            ],
            address_city: [
                v => !!v,
                v => /^[a-zA-Z\s\W'.-]{1,35}$/gu.exec(v) !== null,
            ],
            address_state: [
                v => /^[a-zA-Z\s\W'.-]{0,35}$/gu.exec(v) !== null,
            ],
            address_postcode: [
                v => !!v,
                v => /^[^+]{0,20}$/gu.exec(v) !== null,
            ],
        };

        const mappedKey = {
            address_line_1  : localize('First line of address'),
            address_line_2  : localize('Second line of address'),
            address_city    : `${localize('Town/City')}`,
            address_state   : `${localize('State/Province')}`,
            address_postcode: `${localize('Postal/ZIP Code')}`,
        };

        const required_messages = [
            '{{field_name}} is required',
            '{{field_name}} is not in a proper format.',
        ];

        const optional_messages = [
            '{{field_name}} is not in a proper format.',
        ];

        const errors = {};

        Object.entries(validations)
            .forEach(([key, rules]) => {
                const error_index = rules.findIndex(v => !v(values[key]));
                if (error_index !== -1) {
                    switch (key) {
                        case 'address_state':
                        case 'address_line_2':
                            errors[key] = <Localize
                                i18n_default_text={optional_messages[error_index]}
                                values={{
                                    field_name: mappedKey[key],
                                }}
                                options={{ interpolation: { escapeValue: false } }}
                            />;
                            break;
                        default:
                            errors[key] = <Localize
                                i18n_default_text={required_messages[error_index]}
                                values={{
                                    field_name: mappedKey[key],
                                }}
                                options={{ interpolation: { escapeValue: false } }}
                            />;
                    }
                }
            });

        return errors;
    };
}

export default connect(({ client }) => ({
    fetchStatesList: client.fetchStatesList,
    states_list    : client.states_list,
}))(AddressDetails);
