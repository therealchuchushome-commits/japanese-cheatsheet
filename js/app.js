import phrases from '../data/phrases.js';
import categories from '../data/categories.js';

let currentPhrase = null;
let filteredPhrases = [...phrases];
let selectedCategory = null;

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
    let results = selectedCategory
        ? phrases.filter(p => p.category === selectedCategory)
        : [...phrases];

    if (query.trim()) {
        results = results.map(phrase => {
            const englishScore = fuzzyMatch(query, phrase.english);
            const spanishScore = fuzzyMatch(query, phrase.spanish);
            const japaneseScore = fuzzyMatch(query, phrase.japanese);
            const romajiScore = fuzzyMatch(query, phrase.romaji);
            const categoryScore = fuzzyMatch(query, phrase.category);
            const maxScore = Math.max(englishScore, spanishScore, japaneseScore, romajiScore, categoryScore);
            return { ...phrase, score: maxScore };
        }).filter(phrase => phrase.score > 0)
          .sort((a, b) => b.score - a.score);
    }

    return results;
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';

    results.forEach(phrase => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.addEventListener('click', () => selectPhrase(phrase));

        const category = categories.find(c => c.id === phrase.category);
        const categoryName = category ? category.name : phrase.category;

        item.innerHTML = `
            <div class="search-item-category">${categoryName}</div>
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
    selectedCategory = null; // Reset category filter
    document.getElementById('searchModal').style.display = 'block';
    document.getElementById('searchInput').focus();
    displaySearchResults(searchPhrases(''));
    updateSelectedCategoryDisplay();
}

function closeModal() {
    document.getElementById('searchModal').style.display = 'none';
    document.getElementById('searchInput').value = '';
    clearFilter();
}

function generateCategoryButtons() {
    const grid = document.getElementById('categoryFilterGrid');
    grid.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category.emoji;
        button.title = category.name;
        button.addEventListener('click', () => {
            selectedCategory = category.id;
            const results = searchPhrases(document.getElementById('searchInput').value);
            displaySearchResults(results);
            updateSelectedCategoryDisplay();
            document.getElementById('categoryFilterGrid').classList.remove('show');
        });
        grid.appendChild(button);
    });
}

function updateSelectedCategoryDisplay() {
    const toggleBtn = document.getElementById('toggleCategoryFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (selectedCategory) {
        const category = categories.find(c => c.id === selectedCategory);
        toggleBtn.textContent = `Category: ${category.name}`;
        clearFilterBtn.style.display = 'inline';
    } else {
        toggleBtn.textContent = 'All Categories';
        clearFilterBtn.style.display = 'none';
    }
}

function clearFilter() {
    selectedCategory = null;
    const results = searchPhrases(document.getElementById('searchInput').value);
    displaySearchResults(results);
    updateSelectedCategoryDisplay();
    document.getElementById('categoryFilterGrid').classList.remove('show');
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    const results = searchPhrases(e.target.value);
    displaySearchResults(results);
});

document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);

document.getElementById('toggleCategoryFilterBtn').addEventListener('click', () => {
    document.getElementById('categoryFilterGrid').classList.toggle('show');
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

// Generate category buttons on load
generateCategoryButtons();
