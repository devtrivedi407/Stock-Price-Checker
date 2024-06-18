document.addEventListener('DOMContentLoaded', function () {
    // Populate the dropdown menus with currency options
    populateCurrencyDropdowns();

    // Add event listener for the Convert button
    document.getElementById('convertBtn').addEventListener('click', handleConvert);

    // Function to populate currency dropdowns
    async function populateCurrencyDropdowns() {
        const apiKey = '75aa57b17a824353a2c7aa2b6c6ea84d';
        const apiUrl = `https://open.er-api.com/v6/latest?apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch currency data');
            }
            const data = await response.json();
            const currencies = Object.keys(data.rates);

            // Populate the "From" and "To" dropdown menus
            const fromDropdown = document.getElementById('fromCurrency');
            const toDropdown = document.getElementById('toCurrency');
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                fromDropdown.appendChild(option.cloneNode(true));
                toDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch currency data. Please try again later.');
        }
    }

    // Function to handle button click (Convert)
    async function handleConvert() {
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        document.getElementById('result').style.display = 'block';

        // Validate input
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            // Fetch exchange rate for conversion
            const conversionRate = await getConversionRate(fromCurrency, toCurrency);
            const result = amount * conversionRate;

            // Display the result
            document.getElementById('result').textContent = `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to perform the operation. Please try again later.');
        }
    }

    // Function to fetch conversion rate
    async function getConversionRate(fromCurrency, toCurrency) {
        const apiKey = '75aa57b17a824353a2c7aa2b6c6ea84d';
        const apiUrl = `https://open.er-api.com/v6/latest?base=${fromCurrency}&apikey=${apiKey}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch conversion rate');
        }
        const data = await response.json();
        return data.rates[toCurrency];
    }
});
