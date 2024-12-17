// Constants
const ANILIST_API = 'https://graphql.anilist.co';
const BOT_USERNAME = 'https://t.me/Anilend_telegram_bot'; // Replace with your bot's username

// State
let currentTab = 'search';

// Tab Switching
function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // Load content if needed
    if (tabId === 'trending') {
        loadTrendingAnime();
    }
}

// Anime Search
async function searchAnime() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) return;

    const query = `
        query ($search: String) {
            Page(page: 1, perPage: 12) {
                media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    averageScore
                    episodes
                    status
                }
            }
        }
    `;

    try {
        const response = await fetch(ANILIST_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: { search: searchInput }
            })
        });

        const data = await response.json();
        displayResults(data.data.Page.media, 'searchResults');
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('searchResults').innerHTML = 
            '<p class="error">An error occurred while searching. Please try again.</p>';
    }
}

// Load Trending Anime
async function loadTrendingAnime() {
    const query = `
        query {
            Page(page: 1, perPage: 12) {
                media(type: ANIME, sort: TRENDING_DESC) {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    averageScore
                    episodes
                    status
                }
            }
        }
    `;

    try {
        const response = await fetch(ANILIST_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        displayResults(data.data.Page.media, 'trendingResults');
    } catch (error) {
        console.error('Trending error:', error);
        document.getElementById('trendingResults').innerHTML = 
            '<p class="error">An error occurred while loading trending anime. Please try again.</p>';
    }
}

// Display Results
function displayResults(animeList, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    animeList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
            <div class="anime-info">
                <h3>${anime.title.english || anime.title.romaji}</h3>
                <p>Episodes: ${anime.episodes || 'N/A'}</p>
                <p>Score: ${anime.averageScore ? anime.averageScore + '%' : 'N/A'}</p>
                <p>Status: ${anime.status}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {

    // Set up search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAnime();
        }
    });
});