import phrases from '../data/phrases.js';

let currentPhrase = null;
let filteredPhrases = [...phrases];

const categoryColors = {
    greetings: 'category-greetings',
    help: 'category-help',
    food: 'category-food',
    shopping: 'category-shopping',
    children: 'category-children',
    numbers: 'category-numbers',
    play: 'category-play',
    comfort: 'category-comfort',
    manners: 'category-manners',
    transport: 'category-transport',
    time: 'category-time',
    diaper: 'category-diaper',
    health: 'category-health',
    lost: 'category-lost',
    upset: 'category-upset',
    publictransport: 'category-publictransport',
    accommodation: 'category-accommodation',
    cultural: 'category-cultural',
    amenities: 'category-amenities',
    optician: 'category-optician'
};

function displayPhrase(phrase) {
    currentPhrase = phrase;
    const card = document.getElementById('mainCard');

    // Update background based on category
    card.className = `card ${categoryColors[phrase.category] || 'category-greetings'}`;

    document.getElementById('cardTitle').textContent = phrase.english;
    document.getElementById('cardSubtitle').textContent = `Category: ${phrase.category.charAt(0).toUpperCase() + phrase.category.slice(1)}`;
    document.getElementById('japaneseText').textContent = phrase.japanese;
    document.getElementById('japaneseRomaji').textContent = phrase.romaji;
    document.getElementById('englishText').textContent = phrase.english;
    document.getElementById('spanishText').textContent = phrase.spanish;
}

function fuzzyMatch(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();

    // Exact match gets highest score
    if (text.includes(query)) return 100;

    // Fuzzy matching
    let queryIndex = 0;
    let score = 0;

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            score += 10;
            queryIndex++;
        }
    }

    return queryIndex === query.length ? score : 0;
}

function searchPhrases(query) {
    if (!query.trim()) {
        return phrases;
    }

    const results = phrases.map(phrase => {
        const englishScore = fuzzyMatch(query, phrase.english);
        const spanishScore = fuzzyMatch(query, phrase.spanish);
        const japaneseScore = fuzzyMatch(query, phrase.japanese);
        const romajiScore = fuzzyMatch(query, phrase.romaji);
        const categoryScore = fuzzyMatch(query, phrase.category);

        const maxScore = Math.max(englishScore, spanishScore, japaneseScore, romajiScore, categoryScore);

        return { ...phrase, score: maxScore };
    }).filter(phrase => phrase.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';

    results.forEach(phrase => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.addEventListener('click', () => selectPhrase(phrase));

        item.innerHTML = `
            <div class="search-item-category">${phrase.category}</div>
            <div class="search-item-english">${phrase.english}</div>
            <div class="search-item-japanese">${phrase.japanese} (${phrase.romaji})</div>
        `;

        container.appendChild(item);
    });
}

function selectPhrase(phrase) {
    displayPhrase(phrase);
    closeModal();
}

function openModal() {
    document.getElementById('searchModal').style.display = 'block';
    document.getElementById('searchInput').focus();
    displaySearchResults(phrases);
}

function closeModal() {
    document.getElementById('searchModal').style.display = 'none';
    document.getElementById('searchInput').value = '';
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    const results = searchPhrases(e.target.value);
    displaySearchResults(results);
});

document.getElementById('searchModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('searchModal')) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize with a default phrase
displayPhrase(phrases[0]);

// Add event listener to the main card
document.getElementById('mainCard').addEventListener('click', openModal);

// Add event listener to the close button
document.querySelector('.close-btn').addEventListener('click', closeModal);
