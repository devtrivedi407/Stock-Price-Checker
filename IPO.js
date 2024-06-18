document.addEventListener('DOMContentLoaded', fetchIPOData);

async function fetchIPOData() {
    const apiKey = 'RY9HCHPWS53G0CQ7';
    const apiUrl = `https://www.alphavantage.co/query?function=IPO_CALENDAR&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const rawText = await response.text();
        console.log('Raw Response Text:', rawText);

        // Parse the CSV data
        const data = parseCSV(rawText);
        console.log('Parsed CSV Data:', data);

        if (!data || data.length === 0) {
            alert('No IPO data available or invalid response format.');
            return;
        }

        const ipoTableBody = document.getElementById('ipoTable').querySelector('tbody');
        ipoTableBody.innerHTML = ''; // Clear any existing rows

        data.forEach(ipo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ipo.symbol}</td>
                <td>${ipo.name}</td>
                <td>${ipo.ipoDate}</td>
                <td>${ipo.priceRangeLow}</td>
                <td>${ipo.priceRangeHigh}</td>
                <td>${ipo.currency}</td>
            `;
            ipoTableBody.appendChild(row);
        });

        console.log('IPO Data successfully populated in the table');
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch IPO data. Please try again later.');
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        if (values.length !== headers.length) {
            return null; // Skip malformed rows
        }
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim(); // Remove leading/trailing whitespace
            return obj;
        }, {});
    }).filter(row => row !== null); // Filter out null rows
}

function searchNavbar() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        window.location.href = `news-result.html?query=${encodeURIComponent(searchQuery)}`;
    } else {
        alert('Please enter a search query.');
    }
}
