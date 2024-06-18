document.addEventListener('DOMContentLoaded', () => {
    fetchNewsData(1); // Load news for the first page on page load

    document.getElementById('prevPageButton').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('pageNumber').textContent.split(' ')[1]);
        if (currentPage > 1) {
            fetchNewsData(currentPage - 1);
        }
    });

    document.getElementById('nextPageButton').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('pageNumber').textContent.split(' ')[1]);
        fetchNewsData(currentPage + 1);
    });

    document.getElementById('goToPageButton').addEventListener('click', () => {
        const pageNumberInput = document.getElementById('pageNumberInput').value;
        const pageNumber = parseInt(pageNumberInput);
        if (pageNumber >= 1 && pageNumber <= 4) {
            fetchNewsData(pageNumber);
        } else {
            alert('Please enter a valid page number between 1 and 4.');
        }
    });
});

function searchNavbar() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        window.location.href = `news-result.html?query=${encodeURIComponent(searchQuery)}`;
    } else {
        alert('Please enter a search query.');
    }
}

async function fetchNewsData(pageNumber) {
    const apiKey = 'decbe57d5cbd4ce5b40ad0abd6574930';
    const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}&page=${pageNumber}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.articles) {
            const newsSection = document.getElementById('news-section');
            newsSection.innerHTML = ''; // Clear previous news articles
            data.articles.forEach(article => {
                const articleElement = createArticleElement(article);
                newsSection.appendChild(articleElement);
            });
            document.getElementById('pageNumber').textContent = `Page ${pageNumber}`;
        } else {
            console.error('No news articles found');
        }
    } catch (error) {
        console.error('Error fetching news data:', error);
    }
}

function createArticleElement(article) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('news-article');

    const titleElement = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = article.url;
    titleLink.textContent = article.title;
    titleElement.appendChild(titleLink);

    const thumbnailElement = document.createElement('img'); // Create thumbnail image element
    thumbnailElement.classList.add('thumbnail'); // Add thumbnail class
    thumbnailElement.src = article.urlToImage ? article.urlToImage : 'placeholder.jpg'; // Set src attribute to image URL or a placeholder image
    thumbnailElement.alt = article.title; // Set alt attribute to article title
    thumbnailElement.onerror = function() { this.style.display = 'none'; }; // Hide thumbnail if image fails to load
    articleElement.appendChild(thumbnailElement); // Append thumbnail image to article element

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = article.description;

    const sourceElement = document.createElement('p');
    sourceElement.textContent = `Source: ${article.source.name}`;

    articleElement.appendChild(titleElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(sourceElement);

    return articleElement;
}
