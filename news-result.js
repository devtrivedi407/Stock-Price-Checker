document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    let currentPage = 1;

    if (searchQuery) {
        document.getElementById('search-query').textContent = searchQuery;
        fetchSearchResults(searchQuery, currentPage);

        document.getElementById('load-more-button').addEventListener('click', () => {
            currentPage++;
            fetchSearchResults(searchQuery, currentPage);
        });
    } else {
        document.getElementById('news-results').textContent = 'No search query provided.';
    }
});

async function fetchSearchResults(query, page) {
    const apiKey = 'decbe57d5cbd4ce5b40ad0abd6574930';
    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&page=${page}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.articles) {
            const newsResultsSection = document.getElementById('news-results');
            data.articles.forEach(article => {
                const articleElement = createArticleElement(article);
                newsResultsSection.appendChild(articleElement);
            });
        } else {
            document.getElementById('news-results').textContent = 'No news articles found.';
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
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

    const thumbnailElement = document.createElement('img');
    thumbnailElement.classList.add('thumbnail');
    thumbnailElement.src = article.urlToImage ? article.urlToImage : 'placeholder.jpg';
    thumbnailElement.alt = article.title;
    thumbnailElement.onerror = function() { this.style.display = 'none'; };
    articleElement.appendChild(thumbnailElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = article.description;

    const sourceElement = document.createElement('p');
    sourceElement.textContent = `Source: ${article.source.name}`;

    articleElement.appendChild(titleElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(sourceElement);

    return articleElement;
}

function searchNavbar() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        window.location.href = `news-result.html?query=${encodeURIComponent(searchQuery)}`;
    } else {
        alert('Please enter a search query.');
    }
}
