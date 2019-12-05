import CurrencyUtils from 'deriv-shared/utils/currency';
import { localize }  from 'deriv-translations';

export const buildCurrenciesList = (payout_currencies) => {
    const fiat   = [];
    const crypto = [];

    payout_currencies.forEach((cur) => {
        const isCrypto = CurrencyUtils.isCryptocurrency(cur);
        (isCrypto ? crypto : fiat).push({ text: cur, value: cur, has_tooltip: isCrypto });
    });

    return {
        [localize('Fiat')]  : fiat,
        [localize('Crypto')]: crypto,
    };
};

export const getDefaultCurrency = (currencies_list, currency = '') => {
    const supported_currencies = Object.values(currencies_list).reduce((a, b) => [...a, ...b]);
    const default_currency =
              supported_currencies.find(c => c.value === currency) ? currency : supported_currencies[0].value;

    return {
        currency: default_currency,
    };
};
