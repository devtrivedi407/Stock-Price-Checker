let chartInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('priceChartButton').addEventListener('click', () => fetchStockData('price'));
    document.getElementById('volumeChartButton').addEventListener('click', () => fetchStockData('volume'));
    document.getElementById('movingAvgChartButton').addEventListener('click', () => fetchStockData('movingAvg'));
    document.getElementById('earningsChartButton').addEventListener('click', fetchEarningsData);
    document.getElementById('historicalPerformanceButton').addEventListener('click', fetchHistoricalPerformanceData);
});

function searchNavbar() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        window.location.href = `news-result.html?query=${encodeURIComponent(searchQuery)}`;
    } else {
        alert('Please enter a search query.');
    }
}


async function fetchStockData(chartType = 'price') {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    if (!stockSymbol) {
        alert('Please enter a stock ticker symbol');
        return;
    }

    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data['Error Message']) {
            alert('Invalid symbol or no data available');
            return;
        }

        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            alert('Invalid symbol or no data available');
            return;
        }

        const dates = Object.keys(timeSeries);
        const prices = dates.map(date => ({
            date,
            close: parseFloat(timeSeries[date]['4. close']),
            volume: parseInt(timeSeries[date]['5. volume'], 10)
        })).reverse();

        renderChart(prices, chartType);
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch stock data. Please try again later.');
    }
}

async function fetchEarningsData() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    if (!stockSymbol) {
        alert('Please enter a stock ticker symbol');
        return;
    }

    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data['Error Message']) {
            alert('Invalid symbol or no data available');
            return;
        }

        const earnings = data.quarterlyEarnings;
        if (!earnings || earnings.length === 0) {
            alert('No earnings data available');
            return;
        }

        const earningsLabels = earnings.map(earnings => earnings.fiscalDateEnding);
        const earningsEPS = earnings.map(earnings => earnings.reportedEPS);

        renderChart({ labels: earningsLabels, earnings: earningsEPS }, 'earnings');
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch earnings data. Please try again later.');
    }
}

async function fetchHistoricalPerformanceData() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    if (!stockSymbol) {
        alert('Please enter a stock ticker symbol');
        return;
    }

    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data['Error Message']) {
            alert('Invalid symbol or no data available');
            return;
        }

        const timeSeries = data['Monthly Time Series'];
        if (!timeSeries) {
            alert('Invalid symbol or no data available');
            return;
        }

        const dates = Object.keys(timeSeries);
        const prices = dates.map(date => ({
            date,
            close: parseFloat(timeSeries[date]['4. close']),
        })).reverse();

        renderChart(prices, 'historical');
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch historical performance data. Please try again later.');
    }
}

function renderChart(data, chartType) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Destroy previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    let chartConfig;

    if (chartType === 'price') {
        const labels = data.map(d => d.date);
        const dataset = {
            label: 'Stock Price',
            data: data.map(d => d.close),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        };
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [dataset]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (USD)'
                        },
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        };
    } else if (chartType === 'volume') {
        const labels = data.map(d => d.date);
        const dataset = {
            label: 'Volume',
            data: data.map(d => d.volume),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 1
        };
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [dataset]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Volume'
                        },
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        };
    } else if (chartType === 'movingAvg') {
        const labels = data.map(d => d.date);
        const movingAvgData = calculateMovingAverage(data.map(d => d.close), 20);
        const dataset = {
            label: '20-Day Moving Average',
            data: movingAvgData,
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderWidth: 1
        };
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [dataset]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Moving Average'
                        },
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        };
    } else if (chartType === 'earnings') {
        chartConfig = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Earnings per Share (EPS)',
                    data: data.earnings,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Quarter Ending'
                        },
                        ticks: {
                            autoSkip: false // Ensure all labels are shown
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Earnings per Share (EPS)'
                        },
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'EPS'
                        }
                    }
                }
            }
        };
    } else if (chartType === 'historical') {
        const labels = data.map(d => d.date);
        const dataset = {
            label: 'Historical Performance',
            data: data.map(d => d.close),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        };
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [dataset]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        type: 'time',
                        time: {
                            unit: 'month',
                            tooltipFormat: 'MMM yyyy',
                            displayFormats: {
                                month: 'MMM yyyy'
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price'
                        },
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        };
    }

    chartInstance = new Chart(ctx, chartConfig);
}

function calculateMovingAverage(data, period) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
        } else {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j];
            }
            result.push(sum / period);
        }
    }
    return result;
}
