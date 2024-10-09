document.addEventListener("DOMContentLoaded", function () {

    const DEFAULT_CURRENCY = 'GBP'; // Default currency
    const DEFAULT_CURRENCY_SYMBOL = '£'; // Default currency symbol
    const currentCurrencyValues = ['6', '12', '20']; // Current currency values in pounds

    async function getPublicIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            throw error;
        }
    }

    async function getCountryByIP(ip) {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();
            console.log('Country Data:', data);
            return {
                country: data.country_name || 'Unknown',
                countryCode: data.country || undefined,
                city: data.city || 'Unknown',
            };
        } catch (error) {
            console.error('Error fetching country information:', error);
            return { country: 'Unknown', countryCode: undefined };
        }
    }

    async function getCurrencyByCountry(countryCode) {
     
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const currencyInfoCode = Object.keys(data[0].currencies)[0] || DEFAULT_CURRENCY;
                const currencyInfo = Object.values(data[0].currencies)[0];
                console.log('Currency Information1:', Object.keys(data[0].currencies)); 
                return {
                    
                    currencyCode: currencyInfoCode,
                    currencySymbol: currencyInfo.symbol || DEFAULT_CURRENCY_SYMBOL,
                };
            } else {
                throw new Error(`No data found for country code: ${countryCode}`);
            }
        } catch (error) {
            console.error('Error fetching currency information:', error);
            return {
                currencyName: 'Pound Sterling',
                currencyCode: 'GBP',
                currencySymbol: '£'
            };
        }
    }

    async function convertCurrency(amount, fromCurrency, toCurrency) {
        if (!toCurrency) {
            console.error('Cannot convert currency: target currency is undefined');
            return Promise.reject(new Error('Target currency is undefined'));
        }
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await response.json();
            console.log('Exchange Rate Data:', data);
            const exchangeRate = data.rates[toCurrency];
            if (exchangeRate) {
                return amount * exchangeRate;
            } else {
                throw new Error(`Exchange rate not available for ${toCurrency}`);
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw error;
        }
    }

    function displayConvertedAmounts(convertedAmounts, currencySymbol) {
        const currencySpans = document.querySelectorAll('.currency-symbol');
        currencySpans.forEach((span, index) => {
            if (index < convertedAmounts.length) {
                span.textContent = `${currencySymbol}${convertedAmounts[index].toFixed(0)}`;
            }
        });
    }

    getPublicIP()
        .then(ip => {
            console.log('Your IP address is:', ip);
            return getCountryByIP(ip);
        })
        .then(countryInfo => {
            console.log('Country Information:', countryInfo);
            return getCurrencyByCountry(countryInfo.countryCode);
        })
        .then(currencyInfo => {
            console.log('Currency Information:', currencyInfo);
            const conversionPromises = currentCurrencyValues.map(value => {
                const amount = parseFloat(value);
                console.log(`Converting ${amount} ${DEFAULT_CURRENCY} to ${currencyInfo.currencyCode}`);
                return convertCurrency(amount, DEFAULT_CURRENCY, currencyInfo.currencyCode);
            });
            return Promise.all(conversionPromises).then(convertedAmounts => {
                return { convertedAmounts, currencySymbol: currencyInfo.currencySymbol || DEFAULT_CURRENCY_SYMBOL };
            });
        })
        .then(({ convertedAmounts, currencySymbol }) => {
            console.log('Converted Amounts:', convertedAmounts);
            displayConvertedAmounts(convertedAmounts, currencySymbol);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});