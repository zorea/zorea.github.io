import ObjectUtils         from 'deriv-shared/utils/object';
import { localize }        from 'deriv-translations';
import {
    epochToMoment,
    formatMiliseconds,
    getDiffDuration }      from 'Utils/Date';
import { isDigitContract } from '../../Contract/Helpers/digits';

export const getCurrentTick = (contract_info) => {
    const tick_stream = ObjectUtils.unique(contract_info.tick_stream, 'epoch');
    const current_tick = isDigitContract(contract_info.contract_type) ? tick_stream.length : tick_stream.length - 1;
    return (!current_tick || current_tick < 0) ? 0 : current_tick;
};

export const getDurationUnitValue = (obj_duration) => {
    const duration_ms = obj_duration.asMilliseconds() / 1000;
    // Check with isEndTime to find out if value of duration has decimals
    // for days we do not require precision for End Time value since users cannot select with timepicker if not in same day
    // Seconds is the smallest End Time duration displayed thus we can keep the same formatting as normal Duration

    if (duration_ms >= 86400000) {
        const duration = duration_ms / (1000 * 60 * 60 * 24);
        return Math.floor(duration);
    } else if (duration_ms >= 3600000 && duration_ms < 86400000) {
        const duration      = duration_ms / (1000 * 60 * 60);
        const is_end_time   = isEndTime(duration);
        const has_seconds   = isEndTime(duration_ms / (1000 * 60));
        const string_format = has_seconds ? 'HH[h] mm[m] ss[s]' : 'HH[h] mm[m]';

        return is_end_time ?
            formatMiliseconds(duration_ms, string_format)
            :
            Math.floor(duration_ms / (1000 * 60 * 60));
    } else if (duration_ms >= 60000 && duration_ms < 3600000) {
        const duration = duration_ms / (1000 * 60);
        const is_end_time = isEndTime(duration);
        return is_end_time ?
            formatMiliseconds(duration_ms, 'mm[m] ss[s]')
            :
            Math.floor(duration_ms / (1000 * 60));
    } else if (duration_ms >= 1000 && duration_ms < 60000) {
        return Math.floor(duration_ms / 1000);
    }
    return Math.floor(duration_ms / 1000);
};

export const isEndTime = (duration) => (duration % 1) !== 0;

export const getDurationUnitText = (obj_duration) => {
    const unit_map = {
        d: { name_plural: localize('days'),    name_singular: localize('day') },
        h: { name_plural: localize('hours'),   name_singular: localize('hour') },
        m: { name_plural: localize('minutes'), name_singular: localize('minute') },
        s: { name: localize('seconds') },
    };
    const duration_ms = obj_duration.asMilliseconds() / 1000;
    // return empty suffix string if duration is End Time set except for days and seconds, refer to L18 and L19

    if (duration_ms) {
        if (duration_ms >= 86400000) {
            const days_value = duration_ms / 86400000;
            return (days_value <= 2) ? unit_map.d.name_singular : unit_map.d.name_plural;
        } else if (duration_ms >= 3600000 && duration_ms < 86400000) {
            if (isEndTime(duration_ms / (1000 * 60 * 60))) return '';
            return (duration_ms === 3600000) ? unit_map.h.name_singular : unit_map.h.name_plural;
        } else if (duration_ms >= 60000 && duration_ms < 3600000) {
            if (isEndTime(duration_ms / (1000 * 60))) return '';
            return (duration_ms === 60000) ? unit_map.m.name_singular : unit_map.m.name_plural;
        } else if (duration_ms >= 1000 && duration_ms < 60000) {
            return unit_map.s.name;
        }
    }
    return unit_map.s.name;
};

export const getDurationPeriod = (contract_info) => (
    getDiffDuration(
        epochToMoment(contract_info.purchase_time || contract_info.date_start),
        epochToMoment(contract_info.date_expiry)
    )
);

export const getDurationTime = (contract_info) => (
    contract_info.tick_count ?
        contract_info.tick_count
        :
        getDurationUnitValue(getDurationPeriod(contract_info))
);
