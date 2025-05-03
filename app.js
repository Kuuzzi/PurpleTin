const apiKey = 'b139bc417606842811f1526ae92572bc'; // <-- REPLACE with your TMDb API key (v3 auth key)
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const mainContent = document.getElementById('main-content');

const categories = [
  {id: 'anime', name: 'Anime', description: 'Action-packed and heartwarming Japanese animations.'},
  {id: 'movies', name: 'Movies', description: 'Blockbuster hits and timeless classics around the world.'},
  {id: 'tagalog-movies', name: 'Tagalog Movies', description: 'Experience Filipino culture through featured Tagalog films.'},
  {id: 'tvshow', name: 'TV Show', description: 'Binge-worthy series and captivating stories.'},
  {id: 'cartoons', name: 'Cartoons', description: 'Fun, humor, and nostalgia for all ages.'},
  {id: 'manga', name: 'Manga', description: 'Top manga-inspired titles across movies and TV.'},
  {id: 'kdrama', name: 'Kdrama', description: 'Romance, suspense, and more from Korean dramas.'},
];

function renderCategories() {
  mainContent.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('categories-grid');

  categories.forEach(({id, name, description}) => {
    const card = document.createElement('article');
    card.classList.add('category-card');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${name} category`);

    card.innerHTML = `
      <h2>${name}</h2>
      <p>${description}</p>
    `;

    // Placeholder click functionality
    card.addEventListener('click', () => alert(`Clicked ${name} category!`));
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    container.appendChild(card);
  });

  mainContent.appendChild(container);
  mainContent.focus();
}

document.addEventListener('DOMContentLoaded', () => renderCategories());

const navCategories = document.getElementById('nav-categories');
const loadingDiv = document.getElementById('loading');

const categories = [
  {
    id: 'anime',
    name: 'Anime',
    // TMDb genre ID for Animation: 16,
    // We fetch popular animation movies + tv shows +
    // plus add the keyword "anime"
    description: 'Action-packed and heartwarming Japanese animations.',
    fetchFn: fetchAnime
  },
  {
    id: 'movies',
    name: 'Movies',
    description: 'Blockbuster hits and timeless classics around the world.',
    fetchFn: () => fetchDiscover('movie')
  },
  {
    id: 'tagalog-movies',
    name: 'Tagalog Movies',
    description: 'Experience Filipino culture through featured Tagalog films.',
    fetchFn: fetchTagalogMovies
  },
  {
    id: 'tvshow',
    name: 'TV Show',
    description: 'Binge-worthy series and captivating stories.',
    fetchFn: () => fetchDiscover('tv')
  },
  {
    id: 'cartoons',
    name: 'Cartoons',
    description: 'Fun, humor, and nostalgia for all ages.',
    fetchFn: fetchCartoons
  },
  {
    id: 'manga',
    name: 'Manga',
    description: 'Top manga-inspired titles across movies and TV.',
    fetchFn: fetchManga
  },
  {
    id: 'kdrama',
    name: 'Kdrama',
    description: 'Romance, suspense, and more from Korean dramas.',
    fetchFn: fetchKdrama
  }
];

// Utility for fetch with error handling 
async function tmdbFetch(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.error(err);
    alert('Failed to fetch from TMDb API. Please check your internet or API key.');
    return null;
  }
}

// Show loading
function showLoading(show = true) {
  if (show) {
    loadingDiv.style.display = 'block';
  } else {
    loadingDiv.style.display = 'none';
  }
}

// Render categories grid 
function renderCategories() {
  mainContent.innerHTML = '';

  const container = document.createElement('div');
  container.classList.add('categories-grid');

  categories.forEach(category => {
    const card = document.createElement('article');
    card.classList.add('category-card');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${category.name} category: ${category.description}`);

    card.innerHTML = `
      <h2>${category.name}</h2>
      <p>${category.description}</p>
    `;

    card.addEventListener('click', () => {
      renderCategoryItems(category);
    });

    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    container.appendChild(card);
  });

  mainContent.appendChild(container);
  mainContent.focus();
}

// Render list of items fetched from TMDb
async function renderCategoryItems(category) {
  mainContent.innerHTML = '';
  showLoading(true);

  // Back button
  const backBtn = document.createElement('a');
  backBtn.href = '#';
  backBtn.classList.add('back-button');
  backBtn.textContent = '← Back to Categories';
  backBtn.addEventListener('click', e => {
    e.preventDefault();
    renderCategories();
  });
  backBtn.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backBtn.click();
    }
  });

  mainContent.appendChild(backBtn);

  const title = document.createElement('h2');
  title.textContent = category.name;
  mainContent.appendChild(title);

  // Try fetching items using category's fetchFn
  const data = await category.fetchFn();

  showLoading(false);

  if (!data || !data.results || data.results.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No results found.';
    mainContent.appendChild(msg);
    return;
  }

  const itemsGrid = document.createElement('div');
  itemsGrid.classList.add('items-grid');

  data.results.forEach(item => {
    // TMDb returns different keys for movie and tv shows
    const title = item.title || item.name || 'Untitled';
    const poster = item.poster_path ? imageBaseUrl + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image';
    const mediaType = item.media_type || category.id === 'tvshow' ? 'tv' : 'movie';
    const itemCard = document.createElement('article');
    itemCard.classList.add('item-card');
    itemCard.setAttribute('tabindex', '0');
    itemCard.setAttribute('aria-label', `Watch ${title}`);

    itemCard.innerHTML = `
      <img src="${poster}" alt="Poster of ${title}" loading="lazy" />
      <div class="item-info">
        <h3 title="${title}">${title.length > 25 ? title.slice(0, 22) + '...' : title}</h3>
        <button type="button" aria-label="Watch ${title}">Watch Now</button>
      </div>
    `;

    // Placeholder handler for watch now
    const watchBtn = itemCard.querySelector('button');
    watchBtn.addEventListener('click', () => alert(`Streaming "${title}" is coming soon on PurpleTin!`));

    itemCard.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        watchBtn.click();
      }
    });

    itemsGrid.appendChild(itemCard);
  });

  mainContent.appendChild(itemsGrid);
  mainContent.focus();
}

// Fetch popular anime related - using genre animation(16) with keyword "anime" filtering by movie & tv
async function fetchAnime() {
  // Movies animation genre=16, keyword anime id=210024 (TMDb keyword "anime")
  // We'll get animation movies & TV with keyword anime filtered 
  // For simplicity, fetch movies first
  const movieUrl = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc&page=1`;
  const tvUrl = `${baseUrl}/discover/tv?api_key=${apiKey}&with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc&page=1`;

  const movies = await tmdbFetch(movieUrl);
  const tvs = await tmdbFetch(tvUrl);
  if (!movies || !tvs) return null;

  // Combine results and tag media_type
  const combined = [
    ...movies.results.map(x => ({...x, media_type: 'movie'})),
    ...tvs.results.map(x => ({...x, media_type: 'tv'}))
  ];

  return { results: combined.slice(0, 20) };
}

// Simple discover popular movies
async function fetchDiscover(type = 'movie') {
  const url = `${baseUrl}/discover/${type}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`;
  return tmdbFetch(url);
}

// Tagalog Movies: search keyword Tagalog (id: 185200 - Tagalog) or filter original_language=tl
// Use original_language=tl and sort popular movies
async function fetchTagalogMovies() {
  const url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&with_original_language=tl&sort_by=popularity.desc&page=1`;
  return tmdbFetch(url);
}

// Cartoons: animation genre(16), sort popular movies and tv
async function fetchCartoons() {
  const movieUrl = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16&language=en-US&sort_by=popularity.desc&page=1`;
  const tvUrl = `${baseUrl}/discover/tv?api_key=${apiKey}&with_genres=16&language=en-US&sort_by=popularity.desc&page=1`;

  const movies = await tmdbFetch(movieUrl);
  const tvs = await tmdbFetch(tvUrl);
  if (!movies || !tvs) return null;

  const combined = [
    ...movies.results.map(x => ({...x, media_type: 'movie'})),
    ...tvs.results.map(x => ({...x, media_type: 'tv'}))
  ];
  return { results: combined.slice(0, 20) };
}

// Manga inspired - search keyword "manga" or results with keyword ID=31622 (Manga)
// We'll search for popular movies or TV with keyword manga
async function fetchManga() {
  const movieUrl = `${baseUrl}/discover/movie?api_key=${apiKey}&with_keywords=31622&language=en-US&sort_by=popularity.desc&page=1`;
  const tvUrl = `${baseUrl}/discover/tv?api_key=${apiKey}&with_keywords=31622&language=en-US&sort_by=popularity.desc&page=1`;
  const movies = await tmdbFetch(movieUrl);
  const tvs = await tmdbFetch(tvUrl);

  if (!movies || !tvs) return null;

  const combined = [
    ...movies.results.map(x => ({...x, media_type: 'movie'})),
    ...tvs.results.map(x => ({...x, media_type: 'tv'})),
  ];

  return { results: combined.slice(0, 20) };
}

// Kdrama: original_language=ko and type tv popular
async function fetchKdrama() {
  const url = `${baseUrl}/discover/tv?api_key=${apiKey}&with_original_language=ko&language=en-US&sort_by=popularity.desc&page=1`;
  return tmdbFetch(url);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
});

navCategories.addEventListener('click', e => {
  e.preventDefault();
  renderCategories();
});
