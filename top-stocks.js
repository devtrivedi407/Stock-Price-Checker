const apiKey = "RY9HCHPWS53G0CQ7";

// Function to fetch and populate data
async function fetchStockData(endpoint, tableId, interval) {
    try {
        let url = `https://www.alphavantage.co/query?function=${endpoint}&symbol=IBM&apikey=${apiKey}`;
        if (endpoint === "TIME_SERIES_INTRADAY") {
            url += `&interval=${interval}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        // Check for API-level errors
        if (data["Error Message"] || data["Note"]) {
            throw new Error(data["Error Message"] || data["Note"]);
        }

        // Determine the correct data structure to parse
        let stocks = [];
        if (endpoint === "TIME_SERIES_INTRADAY") {
            const timeSeriesData = data[`Time Series (${interval})`];

            // Check if time series data is valid
            if (!timeSeriesData) {
                throw new Error("Time series data not available.");
            }

            // Map data to array of objects
            stocks = Object.entries(timeSeriesData).map(([date, stock]) => ({
                symbol: "IBM", // Replace with actual symbol extraction logic
                price: stock["4. close"],
                change: (stock["4. close"] - stock["1. open"]).toFixed(2) // Example change calculation
            }));
        } else if (endpoint === "TIME_SERIES_DAILY") {
            const timeSeriesData = data["Time Series (Daily)"];

            // Check if time series data is valid
            if (!timeSeriesData) {
                throw new Error("Time series data not available.");
            }

            // Map data to array of objects
            stocks = Object.entries(timeSeriesData).map(([date, stock]) => ({
                symbol: "IBM", // Replace with actual symbol extraction logic
                price: stock["4. close"],
                change: (stock["4. close"] - stock["1. open"]).toFixed(2) // Example change calculation
            }));
        } else {
            throw new Error("Unsupported endpoint.");
        }

        // Validate the table ID and update the table in the DOM
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) {
            throw new Error(`Invalid table selector: #${tableId}`);
        }
        tbody.innerHTML = '';
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.price}</td>
                <td class="change ${stock.change >= 0 ? 'positive' : 'negative'}">${stock.change}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Function to initialize the dashboard
function initDashboard() {
    fetchStockData("TIME_SERIES_INTRADAY", "top-gainers", "5min");
    fetchStockData("TIME_SERIES_INTRADAY", "top-losers", "5min");
    fetchStockData("TIME_SERIES_DAILY", "week-high-52", "daily");
    fetchStockData("TIME_SERIES_DAILY", "week-low-52", "daily");
    fetchStockData("TIME_SERIES_INTRADAY", "only-buyers", "5min");
    fetchStockData("TIME_SERIES_INTRADAY", "only-sellers", "5min");
}

// Initialize the dashboard on page load
window.onload = initDashboard;
