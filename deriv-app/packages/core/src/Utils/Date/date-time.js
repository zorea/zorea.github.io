import moment       from 'moment';
import { localize } from 'deriv-translations';
import ServerTime   from '_common/base/server_time';
// Disables moment's fallback to native Date object
// moment will return `Invalid Date` if date cannot be parsed
moment.createFromInputFallback = function (config) {
    config._d = new Date(NaN); // eslint-disable-line no-underscore-dangle
};

/**
 * Convert epoch to moment object
 * @param  {Number} epoch
 * @return {moment} the moment object of provided epoch
 */
export const epochToMoment = epoch => moment.unix(epoch).utc();

/**
 * Convert date string or epoch to moment object
 * @param  {Number} value   the date in epoch format
 * @param  {String} value   the date in string format
 * @return {moment} the moment object of 'now' or the provided date epoch or string
 */
export const toMoment = value => {
    if (!value) return ServerTime.get() || moment().utc(); // returns 'now' moment object
    if (value instanceof moment && value.isValid() && value.isUTC()) return value; // returns if already a moment object
    if (typeof value === 'number') return epochToMoment(value); // returns epochToMoment() if not a date

    if (/invalid/i.test(moment(value))) {
        const today_moment = moment();
        return value > today_moment.utc().daysInMonth() ? moment.utc(today_moment.add(value, 'd'), 'DD MMM YYYY') : moment.utc(value, 'DD MMM YYYY'); // returns target date
    }
    return moment.utc(value);
};

/**
 * Set specified time on moment object
 * @param  {moment} moment_obj  the moment to set the time on
 * @param  {String} time        24 hours format, may or may not include seconds
 * @return {moment} a new moment object of result
 */
export const setTime = (moment_obj, time) => {
    const [hour, minute, second] = time ? time.split(':') : [0, 0, 0];
    moment_obj.hour(hour).minute(minute || 0).second(second || 0);
    return moment_obj;
};

/**
 * return the unix value of provided epoch and time
 * @param  {Number} epoch  the date to update with provided time
 * @param  {String} time   the time to set on the date
 * @return {Number} unix value of the result
 */
export const convertToUnix = (epoch, time) => setTime(toMoment(epoch), time).unix();

export const toGMTFormat = (time) => moment(time || undefined).utc().format('YYYY-MM-DD HH:mm:ss [GMT]');

export const formatDate = (date, date_format = 'YYYY-MM-DD') => toMoment(date).format(date_format);

/**
 * return the number of days from today to date specified
 * @param  {String} date   the date to calculate number of days from today
 * @return {Number} an integer of the number of days
 */
export const daysFromTodayTo = (date) => {
    const diff = toMoment(date).startOf('day').diff(toMoment().startOf('day'), 'days');
    return (!date || diff < 0) ? '' : diff;
};

/**
 * return the number of months between two specified dates
 */
export const diffInMonths = (now, then) => then.diff(now, 'month');
/**
 * return moment duration between two dates
 * @param  {Number} epoch start time
 * @param  {Number} epoch end time
 * @return {moment.duration} moment duration between start time and end time
 */
export const getDiffDuration = (start_time, end_time) =>
    moment.duration(moment.unix(end_time).diff(moment.unix(start_time)));

/**
 * return formatted duration `2 days 01:23:59`
 * @param  {moment.duration} moment duration object
 * @return {String} formatted display string
 */
export const formatDuration = (duration) => {
    const d = Math.floor(duration.asDays()); // duration.days() does not include months/years
    const h = duration.hours();
    const m = duration.minutes();
    const s = duration.seconds();
    let formatted_str = moment(0).hour(h).minute(m).seconds(s).format('HH:mm:ss');
    if (d > 0) {
        formatted_str = `${d} ${d > 1 ? localize('days') : localize('day')} ${formatted_str}`;
    }
    return formatted_str;
};

/**
 * return true if the time_str is in "HH:MM" format, else return false
 * @param {String} time_str time
 */
export const isTimeValid = time_str => /^([0-9]|[0-1][0-9]|2[0-3]):([0-9]|[0-5][0-9])(:([0-9]|[0-5][0-9]))?$/.test(time_str);

/**
 * return true if the time_str's hour is between 0 and 23, else return false
 * @param {String} time_str time
 */
export const isHourValid = time_str => isTimeValid(time_str) && /^([01][0-9]|2[0-3])$/.test(time_str.split(':')[0]);

/**
 * return true if the time_str's minute is between 0 and 59, else return false
 * @param {String} time_str time
 */
export const isMinuteValid = time_str => isTimeValid(time_str) && /^[0-5][0-9]$/.test(time_str.split(':')[1]);

/**
 * return true if the date is typeof string and a valid moment date, else return false
 * @param {String|moment} date date
 */
export const isDateValid = date => moment(date, 'DD MMM YYYY').isValid();

/**
 * add the specified number of days to the given date
 * @param {String} date        date
 * @param {Number} num_of_days number of days to add
 */
export const addDays = (date, num_of_days) => toMoment(date).clone().add(num_of_days, 'day');

/**
 * add the specified number of months to the given date
 * @param {String} date        date
 * @param {Number} num_of_months number of months to add
 */
export const addMonths = (date, num_of_months) => toMoment(date).clone().add(num_of_months, 'month');

/**
 * add the specified number of years to the given date
 * @param {String} date        date
 * @param {Number} num_of_years number of years to add
 */
export const addYears = (date, num_of_years) => toMoment(date).clone().add(num_of_years, 'year');

/**
 * subtract the specified number of days from the given date
 * @param {String} date        date
 * @param {Number} num_of_days number of days to subtract
 */
export const subDays = (date, num_of_days) => toMoment(date).clone().subtract(num_of_days, 'day');

/**
 * subtract the specified number of months from the given date
 * @param {String} date        date
 * @param {Number} num_of_months number of months to subtract
 */
export const subMonths = (date, num_of_months) => toMoment(date).clone().subtract(num_of_months, 'month');

/**
 * subtract the specified number of years from the given date
 * @param {String} date        date
 * @param {Number} num_of_years number of years to subtract
 */
export const subYears = (date, num_of_years) => toMoment(date).clone().subtract(num_of_years, 'year');

/**
 * returns the minimum moment between the two passing parameters
 * @param {moment|string|epoch} first datetime parameter
 * @param {moment|string|epoch} second datetime parameter
 */
export const minDate = (date_1, date_2) => moment.min(toMoment(date_1), toMoment(date_2));

/**
 * returns a new date
 * @param {moment|string|epoch} date date
 */
export const getStartOfMonth = (date) => toMoment(date).clone().startOf('month').format('YYYY-MM-DD');

/**
 * returns miliseconds into UTC formatted string
 * @param {Number} miliseconds miliseconds
 * @param {String} str_format formatting using moment e.g - YYYY-MM-DD HH:mm
 */
export const formatMiliseconds = (miliseconds, str_format) => moment.utc(miliseconds).format(str_format);
