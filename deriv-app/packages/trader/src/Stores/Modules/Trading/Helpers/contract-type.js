import ObjectUtils             from 'deriv-shared/utils/object';
import ServerTime              from '_common/base/server_time';
import { localize }            from 'deriv-translations';
import { WS }                  from 'Services/ws-methods';
import {
    isTimeValid,
    minDate,
    toMoment }                 from 'Utils/Date';
import { buildBarriersConfig } from './barrier';
import {
    buildDurationConfig,
    hasIntradayDurationUnit }  from './duration';
import {
    buildForwardStartingConfig,
    isSessionAvailable }       from './start-date';
import {
    getContractCategoriesConfig,
    getContractTypesConfig,
    getLocalizedBasis }        from '../Constants/contract';

const ContractType = (() => {
    let available_contract_types = {};
    let available_categories     = {};
    let contract_types;
    const trading_times          = {};
    let has_only_forward_starting_contracts = false;

    const buildContractTypesConfig = (symbol) => WS.contractsFor(symbol).then(r => {
        const has_contracts = ObjectUtils.getPropertyValue(r, ['contracts_for']);
        has_only_forward_starting_contracts = has_contracts && !r.contracts_for.available.find((contract) => contract.start_type !== 'forward');
        if (!has_contracts || has_only_forward_starting_contracts) return;
        const contract_categories = getContractCategoriesConfig();
        contract_types = getContractTypesConfig();

        available_contract_types = {};
        available_categories = ObjectUtils.cloneObject(contract_categories); // To preserve the order (will clean the extra items later in this function)

        r.contracts_for.available.forEach((contract) => {
            const type = Object.keys(contract_types).find(key => (
                contract_types[key].trade_types.indexOf(contract.contract_type) !== -1 &&
                (typeof contract_types[key].barrier_count === 'undefined' || +contract_types[key].barrier_count === contract.barriers) // To distinguish betweeen Rise/Fall & Higher/Lower
            ));

            if (!type) return; // ignore unsupported contract types

            /*
            add to this config if a value you are looking for does not exist yet
            accordingly create a function to retrieve the value
            config: {
                has_spot: 1,
                durations: {
                    min_max: {
                        spot: {
                            tick    : { min: 5,     max: 10 },    // value in ticks, as cannot convert to seconds
                            intraday: { min: 18000, max: 86400 }, // all values converted to seconds
                            daily   : { min: 86400, max: 432000 },
                        },
                        forward: {
                            intraday: { min: 18000, max: 86400 },
                        },
                    },
                    units_display: {
                        spot: [
                            { text: 'ticks',   value: 't' },
                            { text: 'seconds', value: 's' },
                            { text: 'minutes', value: 'm' },
                            { text: 'hours',   value: 'h' },
                            { text: 'days',    value: 'd' },
                        ],
                        forward: [
                            { text: 'days',    value: 'd' },
                        ],
                    },
                },
                forward_starting_dates: [
                    { text: 'Mon - 19 Mar, 2018', value: 1517356800, sessions: [{ open: obj_moment, close: obj_moment }] },
                    { text: 'Tue - 20 Mar, 2018', value: 1517443200, sessions: [{ open: obj_moment, close: obj_moment }] },
                    { text: 'Wed - 21 Mar, 2018', value: 1517529600, sessions: [{ open: obj_moment, close: obj_moment }] },
                ],
                trade_types: {
                    'CALL': 'Higher',
                    'PUT' : 'Lower',
                },
                barriers: {
                    count   : 2,
                    tick    : { high_barrier: '+1.12', low_barrier : '-1.12' },
                    intraday: { high_barrier: '+2.12', low_barrier : '-2.12' },
                    daily   : { high_barrier: 1111,    low_barrier : 1093 },
                },
            }
            */

            if (!available_contract_types[type]) {
                // extend contract_categories to include what is needed to create the contract list
                const sub_cats = available_categories[Object.keys(available_categories)
                    .find(key => available_categories[key].indexOf(type) !== -1)];

                if (!sub_cats) return;

                sub_cats[sub_cats.indexOf(type)] = { value: type, text: contract_types[type].title };

                // populate available contract types
                available_contract_types[type] = ObjectUtils.cloneObject(contract_types[type]);
            }
            const config = available_contract_types[type].config || {};

            // set config values
            config.has_spot               = config.has_spot || contract.start_type === 'spot';
            config.durations              = buildDurationConfig(contract, config.durations);
            config.trade_types            = buildTradeTypesConfig(contract, config.trade_types);
            config.barriers               = buildBarriersConfig(contract, config.barriers);
            config.forward_starting_dates = buildForwardStartingConfig(contract, config.forward_starting_dates);

            available_contract_types[type].config = config;
        });

        // cleanup categories
        Object.keys(available_categories).forEach((key) => {
            available_categories[key] = available_categories[key].filter(item => typeof item === 'object');
            if (available_categories[key].length === 0) {
                delete available_categories[key];
            }
        });
    });

    const buildTradeTypesConfig = (contract, trade_types = {}) => {
        trade_types[contract.contract_type] = contract.contract_display;
        return trade_types;
    };

    const getArrayDefaultValue = (arr_new_values, value) => (
        arr_new_values.indexOf(value) !== -1 ? value : arr_new_values[0]
    );

    const getContractValues = (store) => {
        const { contract_expiry_type, contract_type, basis, duration_unit, start_date } = store;
        const form_components   = getComponents(contract_type);
        const obj_basis         = getBasis(contract_type, basis);
        const obj_trade_types   = getTradeTypes(contract_type);
        const obj_start_dates   = getStartDates(contract_type, start_date);
        const obj_start_type    = getStartType(obj_start_dates.start_date);
        const obj_barrier       = getBarriers(contract_type, contract_expiry_type);
        const obj_duration_unit = getDurationUnit(duration_unit, contract_type, obj_start_type.contract_start_type);

        const obj_duration_units_list    = getDurationUnitsList(contract_type, obj_start_type.contract_start_type);
        const obj_duration_units_min_max = getDurationMinMax(contract_type, obj_start_type.contract_start_type);

        return {
            ...form_components,
            ...obj_basis,
            ...obj_trade_types,
            ...obj_start_dates,
            ...obj_start_type,
            ...obj_barrier,
            ...obj_duration_unit,
            ...obj_duration_units_list,
            ...obj_duration_units_min_max,
        };
    };

    const getContractType = (list, contract_type) => {
        const arr_list = Object.keys(list || {})
            .reduce((k, l) => ([...k, ...list[l].map(ct => ct.value)]), []);
        return {
            contract_type: getArrayDefaultValue(arr_list, contract_type),
        };
    };

    const getComponents = (c_type) => ({ form_components: ['duration', 'amount', ...contract_types[c_type].components] });

    const getDurationUnitsList = (contract_type, contract_start_type) => ({
        duration_units_list: ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config', 'durations', 'units_display', contract_start_type]) || [],
    });

    const getDurationUnit = (duration_unit, contract_type, contract_start_type) => {
        const duration_units = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config', 'durations', 'units_display', contract_start_type]) || [];
        const arr_units = [];
        duration_units.forEach(obj => {
            arr_units.push(obj.value);
        });

        return {
            duration_unit: getArrayDefaultValue(arr_units, duration_unit),
        };
    };

    const getDurationMinMax = (contract_type, contract_start_type, contract_expiry_type) => {
        let duration_min_max = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config', 'durations', 'min_max', contract_start_type]) || {};

        if (contract_expiry_type) {
            duration_min_max = duration_min_max[contract_expiry_type] || {};
        }

        return { duration_min_max };
    };

    const getFullContractTypes = () => available_contract_types;

    const getStartType = (start_date) => ({
        // Number(0) refers to 'now'
        contract_start_type: start_date === Number(0) ? 'spot' : 'forward',
    });

    const getStartDates = (contract_type, current_start_date) => {
        const config           = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config']);
        const start_dates_list = [];

        if (config.has_spot) {
            // Number(0) refers to 'now'
            start_dates_list.push({ text: localize('Now'), value: Number(0) });
        }
        if (config.forward_starting_dates) {
            start_dates_list.push(...config.forward_starting_dates);
        }

        const start_date = start_dates_list.find(item => item.value === current_start_date) ?
            current_start_date : start_dates_list[0].value;

        return { start_date, start_dates_list };
    };

    const getSessions = (contract_type, start_date) => {
        const config   = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config']) || {};
        const sessions =
                  ((config.forward_starting_dates || []).find(option => option.value === start_date) || {}).sessions;
        return { sessions };
    };

    const hours   = [...Array(24).keys()].map((a)=>`0${a}`.slice(-2));
    const minutes = [...Array(12).keys()].map((a)=>`0${a * 5}`.slice(-2));

    const getValidTime = (sessions, compare_moment, start_moment) => {
        if (sessions && !isSessionAvailable(sessions, compare_moment)) {
            // first see if changing the minute brings it to the right session
            compare_moment.minute(minutes.find(m => isSessionAvailable(sessions, compare_moment.minute(m))) || compare_moment.format('mm'));
            // if not, also change the hour
            if (!isSessionAvailable(sessions, compare_moment)) {
                compare_moment.minute(0);
                compare_moment.hour(hours.find(h => isSessionAvailable(sessions, compare_moment.hour(h), start_moment, true)) || compare_moment.format('HH'));
                compare_moment.minute(minutes.find(m => isSessionAvailable(sessions, compare_moment.minute(m))) || compare_moment.format('mm'));
            }
        }
        return compare_moment.format('HH:mm');
    };

    const buildMoment = (date, time) => {
        const [ hour, minute ] = isTimeValid(time) ? time.split(':') : [0, 0];
        return toMoment(date || ServerTime.get()).hour(hour).minute(minute);
    };

    const getStartTime = (sessions, start_date, start_time) => ({
        start_time: start_date ? getValidTime(sessions, buildMoment(start_date, start_time)) : null,
    });

    const getTradingTimes = async (date, underlying = null) => {
        if (!date) {
            return [];
        }

        if (!(date in trading_times)) {
            const trading_times_response = await WS.tradingTimes(date);

            if (ObjectUtils.getPropertyValue(trading_times_response, ['trading_times', 'markets'])) {
                for (let i = 0; i < trading_times_response.trading_times.markets.length; i++) {
                    const submarkets = trading_times_response.trading_times.markets[i].submarkets;
                    if (submarkets) {
                        for (let j = 0; j < submarkets.length; j++) {
                            const symbols = submarkets[j].symbols;
                            if (symbols) {
                                for (let k = 0; k < symbols.length; k++) {
                                    const symbol = symbols[k];
                                    if (!trading_times[trading_times_response.echo_req.trading_times]) {
                                        trading_times[trading_times_response.echo_req.trading_times] = {};
                                    }
                                    trading_times[trading_times_response.echo_req.trading_times][symbol.symbol] = {
                                        'open' : symbol.times.open,
                                        'close': symbol.times.close,
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }

        return underlying ? trading_times[date][underlying] : trading_times[date];
    };

    const getExpiryType = (duration_units_list, expiry_type) => {
        if (duration_units_list && duration_units_list.length === 1 && duration_units_list[0].value === 't') {
            return { expiry_type: 'duration' };
        }

        return { expiry_type };
    };

    const getExpiryDate = (duration_units_list, expiry_date, expiry_type, start_date) => {
        let proper_expiry_date = null;

        if (expiry_type === 'endtime') {
            const moment_start  = toMoment(start_date);
            const moment_expiry = toMoment(expiry_date);

            if (!hasIntradayDurationUnit(duration_units_list)) {
                const is_invalid = moment_expiry.isSameOrBefore(moment_start, 'day');
                proper_expiry_date = (is_invalid ? moment_start.clone().add(1, 'day') : moment_expiry).format('YYYY-MM-DD');
            } else {
                // forward starting contracts should only show today and tomorrow as expiry date
                const is_invalid =
                    moment_expiry.isBefore(moment_start, 'day') || (start_date && moment_expiry.isAfter(moment_start.clone().add(1, 'day')));
                proper_expiry_date = (is_invalid ? moment_start : moment_expiry).format('YYYY-MM-DD');
            }
        }

        return { expiry_date: proper_expiry_date };
    };

    // It has to follow the correct order of checks:
    // first check if end time is within available sessions
    // then confirm that end time is at least 5 minute after start time
    const getExpiryTime = (
        expiry_date,
        expiry_time,
        expiry_type,
        market_close_times,
        sessions,
        start_date,
        start_time
    ) => {
        let end_time = null;

        if (expiry_type === 'endtime') {
            let market_close_time = '23:59:59';

            if (market_close_times && market_close_times.length && market_close_times[0] !== '--') {
                // Some of underlyings (e.g. Australian Index) have two close time during a day so we always select the further one as the end time of the contract.
                market_close_time = market_close_times.slice(-1)[0];
            }

            // For contracts with a duration of more that 24 hours must set the expiry_time to the market's close time on the expiry date.
            if (!start_date && ServerTime.get().isBefore(buildMoment(expiry_date), 'day')) {
                end_time = market_close_time;
            } else {
                const start_moment = start_date ? buildMoment(start_date, start_time) : ServerTime.get();
                const end_moment   = buildMoment(expiry_date, expiry_time);

                end_time = end_moment.format('HH:mm');
                // When the contract is forwarding, and the duration is endtime, users can purchase the contract within 24 hours.
                const expiry_sessions = [{
                    open : start_moment.clone().add(5, 'minute'), // expiry time should be at least 5 minute after start_time
                    close: minDate(start_moment.clone().add(24, 'hour'), buildMoment(expiry_date, market_close_time)),
                }];

                if (!isSessionAvailable(expiry_sessions, end_moment)) {
                    end_time = getValidTime(expiry_sessions, end_moment.clone(), start_moment.clone());
                }
                if (end_moment.isSameOrBefore(start_moment) || end_moment.diff(start_moment, 'minute') < 5) {
                    const is_end_of_day     = start_moment.get('hours') === 23 && start_moment.get('minute') >= 55;
                    const is_end_of_session = sessions && !isSessionAvailable(sessions, start_moment.clone().add(5, 'minutes'));
                    end_time = start_moment.clone().add((is_end_of_day || is_end_of_session) ? 0 : 5, 'minutes');
                    // Set the end_time to be multiple of 5 to be equal as the SELECTED_TIME that shown to the client.
                    end_time = setMinuteMultipleByFive(end_time).format('HH:mm');
                }
                // Set the expiry_time to 5 minute less than start_time for forwading contracts when the expiry_time is null and the expiry_date is tomorrow.
                if (end_time === '00:00' && start_moment.isBefore(end_moment, 'day')) {
                    end_time = start_moment.clone().subtract(5, 'minute').format('HH:mm');
                }
            }
        }
        return { expiry_time: end_time };
    };

    const setMinuteMultipleByFive = (moment_obj) => (
        moment_obj.minute((Math.ceil(moment_obj.minute() / 5) * 5))
    );

    const getTradeTypes = (contract_type) => ({
        trade_types: ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config', 'trade_types']),
    });

    const getBarriers = (contract_type, expiry_type) => {
        const barriers       = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'config', 'barriers']) || {};
        const barrier_values = barriers[expiry_type] || {};
        const barrier_1      = barrier_values.barrier || barrier_values.high_barrier || '';
        const barrier_2      = barrier_values.low_barrier || '';
        return {
            barrier_count: barriers.count || 0,
            barrier_1    : barrier_1.toString(),
            barrier_2    : barrier_2.toString(),
        };
    };

    const getBasis = (contract_type, basis) => {
        const arr_basis  = ObjectUtils.getPropertyValue(available_contract_types, [contract_type, 'basis']) || {};
        const localized_basis = getLocalizedBasis();
        const basis_list = arr_basis.reduce((cur, bas) => (
            [...cur, { text: localized_basis[bas], value: bas }]
        ), []);

        return {
            basis_list,
            basis: getArrayDefaultValue(arr_basis, basis),
        };
    };

    return {
        buildContractTypesConfig,
        getBarriers,
        getContractType,
        getContractValues,
        getDurationMinMax,
        getDurationUnit,
        getDurationUnitsList,
        getFullContractTypes,
        getExpiryDate,
        getExpiryTime,
        getExpiryType,
        getSessions,
        getStartTime,
        getStartType,
        getTradingTimes,
        getContractCategories: () => ({
            contract_types_list: available_categories,
            has_only_forward_starting_contracts,
        }),
    };
})();

export default ContractType;
