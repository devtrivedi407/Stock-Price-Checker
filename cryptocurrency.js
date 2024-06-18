document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fetchButton').addEventListener('click', fetchAndRenderCryptoData);
});

async function fetchAndRenderCryptoData() {
    const cryptoSymbol = document.getElementById('cryptoSymbol').value.trim().toUpperCase();
    if (!cryptoSymbol) {
        alert('Please enter a cryptocurrency symbol');
        return;
    }

    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrlPrice = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${cryptoSymbol}&apikey=${apiKey}`;
    const apiUrlVolume = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${cryptoSymbol}&apikey=${apiKey}`;

    try {
        const [priceResponse, volumeResponse] = await Promise.all([
            fetch(apiUrlPrice),
            fetch(apiUrlVolume)
        ]);

        const priceData = await priceResponse.json();
        const volumeData = await volumeResponse.json();

        if (!priceResponse.ok || !volumeResponse.ok || priceData['Error Message'] || volumeData['Error Message']) {
            alert('Failed to fetch cryptocurrency data');
            return;
        }

        const pricePrices = Object.entries(priceData['Time Series (Daily)']).map(([date, entry]) => ({
            date,
            close: parseFloat(entry['4. close'])
        }));

        const volumeVolumes = Object.entries(volumeData['Time Series (Daily)']).map(([date, entry]) => ({
            date,
            volume: parseFloat(entry['5. volume'])
        }));

        renderCombinedChart(pricePrices, volumeVolumes);
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch cryptocurrency data. Please try again later.');
    }
}

function renderCombinedChart(priceData, volumeData) {
    const ctx = document.getElementById('cryptoChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line', // Use line type for price
        data: {
            labels: priceData.map(entry => entry.date),
            datasets: [{
                label: 'Price',
                data: priceData.map(entry => entry.close),
                backgroundColor: 'blue', // Customize bar color for price
                yAxisID: 'priceAxis'
            }, {
                label: 'Volume',
                type: 'bar', // Use bar type for volume
                data: volumeData.map(entry => entry.volume),
                backgroundColor: 'red', // Customize bar color for volume
                yAxisID: 'volumeAxis'
            }]
        },
        options: {
            scales: {
                priceAxis: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Price'
                    },
                    ticks: {
                        beginAtZero: false, // Start tick at minimum value in the dataset
                        suggestedMin: Math.min(...priceData.map(entry => entry.close)) - 5, // Adjust minimum suggested value
                        suggestedMax: Math.max(...priceData.map(entry => entry.close)) + 5, // Adjust maximum suggested value
                        stepSize: 2 // Increase the step size between ticks
                    }
                },
                volumeAxis: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volume'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}
