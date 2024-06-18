document.getElementById('fetchButton')?.addEventListener('click', fetchStockInfo);

async function fetchStockInfo() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    if (!stockSymbol) {
        alert('Please enter a stock ticker symbol');
        return;
    }

    try {
        await fetchCompanyOverview(stockSymbol);
        await fetchEarnings(stockSymbol);
        await fetchStockPrice(stockSymbol);
        // Redirect to results page
        window.location.href = 'results.html';
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch stock data. Please try again later.');
    }
}

async function fetchCompanyOverview(stockSymbol) {
    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Company Overview:', data); // Debug log

        localStorage.setItem('companyName', data.Name);
        localStorage.setItem('sector', data.Sector);
        localStorage.setItem('industry', data.Industry);
        localStorage.setItem('marketCap', data.MarketCapitalization);
        localStorage.setItem('peRatio', data.PERatio);
        localStorage.setItem('dividendYield', data.DividendYield);
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch company overview. Please try again later.');
    }
}

async function fetchEarnings(stockSymbol) {
    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Earnings:', data); // Debug log

        const latestEarnings = data.quarterlyEarnings[0];
        const earningsDate = latestEarnings.fiscalDateEnding;
        const earningsEPS = latestEarnings.reportedEPS;

        localStorage.setItem('latestEarnings', `${earningsDate} (EPS: ${earningsEPS})`);
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch earnings data. Please try again later.');
    }
}

async function fetchStockPrice(stockSymbol) {
    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Stock Prices:', data); // Debug log

        const timeSeries = data['Time Series (Daily)'];
        const labels = Object.keys(timeSeries).slice(0, 30).reverse(); // Last 30 days
        const prices = labels.map(date => parseFloat(timeSeries[date]['4. close']));

        localStorage.setItem('labels', JSON.stringify(labels));
        localStorage.setItem('prices', JSON.stringify(prices));
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch stock data. Please try again later.');
    }
}

// Display results on results.html
// Display results on results.html
if (window.location.pathname.includes('results.html')) {
    // Retrieve data from localStorage
    const companyName = localStorage.getItem('companyName') || 'N/A';
    const sector = localStorage.getItem('sector') || 'N/A';
    const industry = localStorage.getItem('industry') || 'N/A';
    const marketCap = localStorage.getItem('marketCap') || 'N/A';
    const peRatio = localStorage.getItem('peRatio') || 'N/A';
    const dividendYield = localStorage.getItem('dividendYield') || 'N/A';
    const latestEarnings = localStorage.getItem('latestEarnings') || 'N/A';
    const stockPrice = localStorage.getItem('stockPrice') || 'N/A';
    const priceChange = localStorage.getItem('priceChange') || 'N/A';
    const priceChangeColor = localStorage.getItem('priceChangeColor') || 'black';
    const labels = JSON.parse(localStorage.getItem('labels')) || [];
    const prices = JSON.parse(localStorage.getItem('prices')) || [];

    // Update HTML elements with retrieved data
    document.getElementById('companyName').textContent = companyName;
    document.getElementById('sector').textContent = sector;
    document.getElementById('industry').textContent = industry;
    document.getElementById('marketCap').textContent = marketCap;
    document.getElementById('peRatio').textContent = peRatio;
    document.getElementById('dividendYield').textContent = dividendYield;
    document.getElementById('latestEarnings').textContent = latestEarnings;
    document.getElementById('stockPrice').textContent = stockPrice;
    const priceChangeElement = document.getElementById('priceChange');
    priceChangeElement.textContent = priceChange;
    priceChangeElement.style.color = priceChangeColor;

    // Render chart
    const ctx = document.getElementById('stockChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Price',
                data: prices,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}