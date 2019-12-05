import { expect }    from 'chai';
import * as DateTime from '../date-time.js';
import moment        from 'moment';

describe('toMoment', () => {
    it('return utc epoch value date based on client epoch value passed', () => {
        const epoch = 1544756041;

        expect(DateTime.toMoment(epoch)).to.deep.equal(moment.unix(epoch).utc());
    });
    it('return correct date when plain string date passed', () => {
        const date = '12 Mar 2019';
        const format = 'DD MMM YYYY';

        expect(DateTime.toMoment(date).format(format)).to.equal(date);
    });
});

describe('convertToUnix', () => {
    const setTime = (moment_obj, time) => {
        const [hour, minute, second] = time.split(':');
        moment_obj.hour(hour).minute(minute || 0).second(second || 0);

        return moment_obj;
    };

    it('return correct unix value when date and time passed', () => {
        const date_epoch = 1544745600;
        const time = '12:30';

        expect(DateTime.convertToUnix(date_epoch, time)).to.deep.equal(setTime(DateTime.toMoment(date_epoch), time).unix());
    });
});

describe('toGMTFormat', () => {
    it('return correct GMT value when no argument passed', () => {
        expect(DateTime.toGMTFormat()).to.deep.equal(moment().utc().format('YYYY-MM-DD HH:mm:ss [GMT]'));
    });

    it('return correct GMT value when argument passed', () => {
        const time_epoch = 1544757884620;
        expect(DateTime.toGMTFormat(time_epoch)).to.deep.equal(moment(time_epoch).utc().format('YYYY-MM-DD HH:mm:ss [GMT]'));
    });
});

describe('formatDate', () => {
    const date_format = 'YYYY-MM-DD'
    it('return correct response when no argument passed', () => {
        expect(DateTime.formatDate()).to.eql(moment().utc().format(date_format));
    });

    it('return correct date value when argument passed', () => {
        // get today date
        const date = moment().utc();
        expect(DateTime.formatDate(date, date_format)).to.deep.equal(moment(date).format(date_format));
    });
});

describe('daysFromTodayTo', () => {
    it('return empty string when there is no argument passed', () => {
        expect(DateTime.daysFromTodayTo()).to.be.empty;
    });

    it('return empty string if the user selected previous day', () => {
        //get previous day
        const date = moment().utc().startOf('day').subtract(1, 'days').format('YYYY-MM-DD');
        expect(DateTime.daysFromTodayTo(date)).to.be.empty;
    });

    it('return difference value between selected date and today', () => {
        //get date three days from now
        const date = moment().utc().startOf('day').add('3', 'days').format('YYYY-MM-DD');
        expect(DateTime.daysFromTodayTo(date)).to.deep.equal(3);
    });
});

describe('convertDuration', () => {
    const start_time = moment().unix();
    const end_time = moment.unix(start_time).add(3, 'minutes').unix();

    describe('getDiffDuration', () => {
        it('return correct value when argument passed', () => {
            expect(DateTime.getDiffDuration(start_time, end_time)).to.eql(moment.duration(180000));
        });
    });

    describe('formatDuration', () => {
        it('return correct value when argument passed', () => {
            const duration = moment.duration(moment.unix(end_time).diff(moment.unix(start_time)));// three minutes
            expect(DateTime.formatDuration(duration)).to.eql('00:03:00');
        });
    });
});
