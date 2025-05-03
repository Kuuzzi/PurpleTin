const apiKey = 'b139bc417606842811f1526ae92572bc'; // Your TMDb API key
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const mainContent = document.getElementById('main-content');
const navCategories = document.getElementById('nav-categories');
const ITEMS_PER_PAGE = 16;

const categories = [
  {
    id: 'anime',
    name: 'Anime',
    description: 'Action-packed and heartwarming Japanese animations.',
    genreId: 16,
    keywordId: 210024, // anime keyword
    items: [],
    type: ['movie', 'tv']
  },
  {
    id: 'movies',
    name: 'Movies',
    description: 'Blockbuster hits and timeless classics around the world.',
    items: [],
    type: ['movie']
  },
  {
    id: 'tagalog-movies',
    name: 'Tagalog Movies',
    description: 'Experience Filipino culture through featured Tagalog films.',
    originalLanguage: 'tl',
    items: [],
    type: ['movie']
  },
  {
    id: 'tvshow',
    name: 'TV Show',
    description: 'Binge-worthy series and captivating stories.',
    items: [],
    type: ['tv']
  },
  {
    id: 'cartoons',
    name: 'Cartoons',
    description: 'Fun, humor, and nostalgia for all ages.',
    genreId: 16,
    items: [],
    type: ['movie', 'tv']
  },
  {
    id: 'manga',
    name: 'Manga',
    description: 'Top manga-inspired titles across movies and TV.',
    keywordId: 31622, // manga keyword
    items: [],
    type: ['movie', 'tv']
  },
  {
    id: 'kdrama',
    name: 'Kdrama',
    description: 'Romance, suspense, and more from Korean dramas.',
    originalLanguage: 'ko',
    items: [],
    type: ['tv']
  }
];

let currentCategory = null;
let currentPage = 1;
let currentSearchTerm = '';

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
}

function combineResults(movieData, tvData) {
  const movies = movieData?.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
  const tvs = tvData?.results?.map(item => ({ ...item, media_type: 'tv' })) || [];
  return [...movies, ...tvs];
}

// Initial fetch of popular items per category for fallback
async function fetchAllCategoriesData() {
  for (const category of categories) {
    try {
      if(category.type.length === 2) {
        let movieUrl = `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`;
        let tvUrl = `${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`;

        if(category.genreId) {
          movieUrl += `&with_genres=${category.genreId}`;
          tvUrl += `&with_genres=${category.genreId}`;
        }
        if(category.keywordId) {
          movieUrl += `&with_keywords=${category.keywordId}`;
          tvUrl += `&with_keywords=${category.keywordId}`;
        }
        if(category.originalLanguage) {
          movieUrl += `&with_original_language=${category.originalLanguage}`;
          tvUrl += `&with_original_language=${category.originalLanguage}`;
        }

        const [movieData, tvData] = await Promise.all([fetchJSON(movieUrl), fetchJSON(tvUrl)]);
        category.items = combineResults(movieData, tvData).slice(0, 50);
      } else {
        let url = `${baseUrl}/discover/${category.type[0]}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`;

        if(category.genreId) url += `&with_genres=${category.genreId}`;
        if(category.keywordId) url += `&with_keywords=${category.keywordId}`;
        if(category.originalLanguage) url += `&with_original_language=${category.originalLanguage}`;

        const data = await fetchJSON(url);
        category.items = data?.results?.slice(0,50) || [];
      }
    } catch(e) {
      console.error(`Error fetching category ${category.name}:`, e);
      category.items = [];
    }
  }
}

// Build category-filtered TMDb search URLs for query and page
function getSearchUrls(category, query, page = 1) {
  const urls = [];
  const encodedQuery = encodeURIComponent(query);

  if(category.type.includes('movie')) {
    let movieUrl = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodedQuery}&page=${page}&language=en-US`;
    if(category.genreId) movieUrl += `&with_genres=${category.genreId}`;
    if(category.keywordId) movieUrl += `&with_keywords=${category.keywordId}`;
    if(category.originalLanguage) movieUrl += `&with_original_language=${category.originalLanguage}`;
    urls.push(movieUrl);
  }

  if(category.type.includes('tv')) {
    let tvUrl = `${baseUrl}/search/tv?api_key=${apiKey}&query=${encodedQuery}&page=${page}&language=en-US`;
    if(category.genreId) tvUrl += `&with_genres=${category.genreId}`;
    if(category.keywordId) tvUrl += `&with_keywords=${category.keywordId}`;
    if(category.originalLanguage) tvUrl += `&with_original_language=${category.originalLanguage}`;
    urls.push(tvUrl);
  }

  return urls;
}

// Search live on TMDb for current category, query and page
async function searchCategoryItems(category, searchTerm, page = 1) {
  if(!searchTerm) return { results: category.items, totalResults: category.items.length };

  const urls = getSearchUrls(category, searchTerm, page);

  const [movieData, tvData] = await Promise.all(urls.map(url => fetchJSON(url)));

  const results = combineResults(movieData, tvData);

  let totalResults = 0;
  if (movieData?.total_results) totalResults += movieData.total_results;
  if (tvData?.total_results) totalResults += tvData.total_results;

  return { results, totalResults };
}

// Create search bar UI
function createSearchBar() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('search-bar-container');
  wrapper.style.textAlign = 'center';
  wrapper.style.marginBottom = '1rem';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = `Search ${currentCategory.name}...`;
  input.setAttribute('aria-label', `Search ${currentCategory.name} items`);
  input.style.width = '360px';
  input.style.maxWidth = '95%';
  input.style.padding = '0.7rem 1.2rem';
  input.style.borderRadius = '16px';
  input.style.border = 'none';
  input.style.fontSize = '1.2rem';
  input.style.boxShadow = '0 0 14px #7B2FF7cc';
  input.style.transition = 'box-shadow 0.3s ease, background-color 0.3s ease';
  input.style.fontWeight = '700';
  input.style.fontFamily = "'Montserrat', sans-serif";
  input.style.letterSpacing = '0.04em';
  input.style.color = '#21004c';

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      currentSearchTerm = input.value.trim();
      currentPage = 1;
      renderCategoryItems();
    }
  });

  wrapper.appendChild(input);
  return wrapper;
}

// Pagination controls UI
function renderPaginationControls(totalPages) {
  const pagination = document.createElement('div');
  pagination.classList.add('pagination-controls');
  pagination.style.textAlign = 'center';
  pagination.style.marginTop = '2rem';
  pagination.style.userSelect = 'none';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.style.marginRight = '1rem';
  prevBtn.style.padding = '0.5rem 1rem';
  prevBtn.style.background = '#7B2FF7';
  prevBtn.style.color = '#fff';
  prevBtn.style.border = 'none';
  prevBtn.style.borderRadius = '8px';
  prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';

  prevBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await renderCategoryItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.style.padding = '0.5rem 1rem';
  nextBtn.style.background = '#7B2FF7';
  nextBtn.style.color = '#fff';
  nextBtn.style.border = 'none';
  nextBtn.style.borderRadius = '8px';
  nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';

  nextBtn.addEventListener('click', async () => {
    if (currentPage < totalPages) {
      currentPage++;
      await renderCategoryItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  pageIndicator.style.color = '#d9d6ff';
  pageIndicator.style.fontWeight = '700';

  pagination.appendChild(prevBtn);
  pagination.appendChild(pageIndicator);
  pagination.appendChild(nextBtn);

  return pagination;
}

// Render category items (with live TMDb search if currentSearchTerm set)
async function renderCategoryItems() {
  if (!currentCategory) return;
  mainContent.innerHTML = '';

  // Back button
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.classList.add('back-button');
  backBtn.textContent = '← Back to Categories';
  backBtn.addEventListener('click', () => {
    currentCategory = null;
    currentPage = 1;
    currentSearchTerm = '';
    renderCategories();
  });
  backBtn.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backBtn.click();
    }
  });
  mainContent.appendChild(backBtn);

  // Title
  const title = document.createElement('h2');
  title.textContent = currentCategory.name;
  mainContent.appendChild(title);

  // Search bar
  const searchBar = createSearchBar();
  mainContent.appendChild(searchBar);

  // Loading indicator
  const loadingIndicator = document.createElement('p');
  loadingIndicator.className = 'loading';
  loadingIndicator.textContent = 'Loading...';
  mainContent.appendChild(loadingIndicator);

  // Fetch search results or fallback to cached
  let { results, totalResults } = await searchCategoryItems(currentCategory, currentSearchTerm, currentPage);
  if(!results) {
    results = [];
    totalResults = 0;
  }

  mainContent.removeChild(loadingIndicator);

  if (results.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = currentSearchTerm
      ? `No results found for "${currentSearchTerm}" in ${currentCategory.name}.`
      : 'No content available for this category right now.';
    noResults.style.textAlign = 'center';
    noResults.style.opacity = '0.7';
    noResults.style.marginTop = '2rem';
    mainContent.appendChild(noResults);
    return;
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  if (totalPages > 0 && currentPage > totalPages) currentPage = 1;

  const itemsGrid = document.createElement('div');
  itemsGrid.classList.add('items-grid');

  results.forEach(item => {
    const titleText = item.title || item.name || 'Untitled';
    const posterPath = item.poster_path ? imageBaseUrl + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image';
    const itemCard = document.createElement('article');
    itemCard.classList.add('item-card');
    itemCard.tabIndex = 0;
    itemCard.setAttribute('aria-label', `Watch ${titleText}`);

    itemCard.innerHTML = `
      <img src="${posterPath}" alt="Poster of ${titleText}" loading="lazy" />
      <div class="item-info">
        <h3 title="${titleText}">${titleText.length > 25 ? titleText.slice(0, 22) + '...' : titleText}</h3>
        <button type="button" aria-label="Watch ${titleText}">Watch Now</button>
      </div>
    `;

    const watchBtn = itemCard.querySelector('button');
    watchBtn.addEventListener('click', () => {
      alert(`Streaming "${titleText}" coming soon on PurpleTin!`);
    });

    itemCard.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        watchBtn.click();
      }
    });

    itemsGrid.appendChild(itemCard);
  });

  mainContent.appendChild(itemsGrid);

  if (totalPages > 1) {
    const paginationControls = renderPaginationControls(totalPages);
    mainContent.appendChild(paginationControls);
  }

  mainContent.focus();
}

// Render categories selection page
function renderCategories() {
  mainContent.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('categories-grid');
  categories.forEach(category => {
    const card = document.createElement('article');
    card.classList.add('category-card');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${category.name} category`);
    card.innerHTML = `
      <h2>${category.name}</h2>
      <p>${category.description}</p>
    `;
    card.addEventListener('click', () => {
      currentCategory = category;
      currentPage = 1;
      currentSearchTerm = '';
      renderCategoryItems();
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

// Show loading placeholder
function showLoading(show = true) {
  if (show) {
    mainContent.innerHTML = `<p class="loading">Loading categories...</p>`;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  await fetchAllCategoriesData();
  renderCategories();
});

// Categories nav link click handler
navCategories.addEventListener('click', e => {
  e.preventDefault();
  currentCategory = null;
  currentPage = 1;
  currentSearchTerm = '';
  renderCategories();
});
