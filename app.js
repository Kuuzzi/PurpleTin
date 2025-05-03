const apiKey = 'b139bc417606842811f1526ae92572bc'; // <-- Your TMDb API key
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const mainContent = document.getElementById('main-content');
const navCategories = document.getElementById('nav-categories');
const ITEMS_PER_PAGE = 8;

const categories = [
  {
    id: 'anime',
    name: 'Anime',
    description: 'Action-packed and heartwarming Japanese animations.',
    fetchUrlMovie: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc&page=1`,
    fetchUrlTV: `${baseUrl}/discover/tv?api_key=${apiKey}&with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'movies',
    name: 'Movies',
    description: 'Blockbuster hits and timeless classics around the world.',
    fetchUrl: `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'tagalog-movies',
    name: 'Tagalog Movies',
    description: 'Experience Filipino culture through featured Tagalog films.',
    fetchUrl: `${baseUrl}/discover/movie?api_key=${apiKey}&with_original_language=tl&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'tvshow',
    name: 'TV Show',
    description: 'Binge-worthy series and captivating stories.',
    fetchUrl: `${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'cartoons',
    name: 'Cartoons',
    description: 'Fun, humor, and nostalgia for all ages.',
    fetchUrlMovie: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16&language=en-US&sort_by=popularity.desc&page=1`,
    fetchUrlTV: `${baseUrl}/discover/tv?api_key=${apiKey}&with_genres=16&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'manga',
    name: 'Manga',
    description: 'Top manga-inspired titles across movies and TV.',
    fetchUrlMovie: `${baseUrl}/discover/movie?api_key=${apiKey}&with_keywords=31622&language=en-US&sort_by=popularity.desc&page=1`,
    fetchUrlTV: `${baseUrl}/discover/tv?api_key=${apiKey}&with_keywords=31622&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  },
  {
    id: 'kdrama',
    name: 'Kdrama',
    description: 'Romance, suspense, and more from Korean dramas.',
    fetchUrl: `${baseUrl}/discover/tv?api_key=${apiKey}&with_original_language=ko&language=en-US&sort_by=popularity.desc&page=1`,
    items: []
  }
];

let currentCategory = null;
let currentPage = 1;
let filteredItems = [];

// Fetch helper
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
  return [...movies, ...tvs].slice(0, 50); // limit to 50 items total
}

// Fetch all data for each category
async function fetchAllCategoriesData() {
  for (const category of categories) {
    try {
      if (category.fetchUrlMovie && category.fetchUrlTV) {
        const [movieData, tvData] = await Promise.all([
          fetchJSON(category.fetchUrlMovie),
          fetchJSON(category.fetchUrlTV)
        ]);
        if (movieData || tvData) {
          category.items = combineResults(movieData, tvData);
        } else {
          category.items = [];
        }
      } else if (category.fetchUrl) {
        const data = await fetchJSON(category.fetchUrl);
        category.items = data?.results?.slice(0, 50) || [];
      } else {
        category.items = [];
      }
    } catch (e) {
      console.error(`Error fetching category ${category.name}:`, e);
      category.items = [];
    }
  }
}

// Create search bar element
function createSearchBar() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('search-bar-container');
  wrapper.style.textAlign = 'center';
  wrapper.style.marginBottom = '1rem';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = `Search ${currentCategory.name}...`;
  input.setAttribute('aria-label', `Search ${currentCategory.name} items`);
  input.style.width = '300px';
  input.style.maxWidth = '90%';
  input.style.padding = '0.5rem 1rem';
  input.style.borderRadius = '12px';
  input.style.border = 'none';
  input.style.fontSize = '1rem';
  input.style.boxShadow = '0 0 10px #7b2ff7aa';
  input.style.transition = 'box-shadow 0.3s ease';

  input.addEventListener('focus', () => {
    input.style.boxShadow = '0 0 18px #b987f9cc';
  });
  input.addEventListener('blur', () => {
    input.style.boxShadow = '0 0 10px #7b2ff7aa';
  });

  // Debounce for search input
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = input.value.trim().toLowerCase();
      if (!term) {
        filteredItems = currentCategory.items;
      } else {
        filteredItems = currentCategory.items.filter(item => {
          const title = (item.title || item.name || '').toLowerCase();
          return title.includes(term);
        });
      }
      currentPage = 1; // reset to first page on search
      renderCategoryItems(true); // pass true: rendering from search filter
    }, 300);
  });

  wrapper.appendChild(input);
  return wrapper;
}

// Render pagination controls
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
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderCategoryItems();
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
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCategoryItems();
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

// Render category items, accepts a boolean flag "fromSearch" for rendering filtered items
function renderCategoryItems(fromSearch = false) {
  const category = currentCategory;
  if (!category) return;

  mainContent.innerHTML = '';

  // Back button
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.classList.add('back-button');
  backBtn.textContent = '← Back to Categories';
  backBtn.addEventListener('click', () => {
    currentCategory = null;
    currentPage = 1;
    filteredItems = [];
    renderCategories();
  });
  backBtn.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backBtn.click();
    }
  });
  mainContent.appendChild(backBtn);

  // Category title
  const title = document.createElement('h2');
  title.textContent = category.name;
  mainContent.appendChild(title);

  if (category.items.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No content available for this category right now.';
    noResults.style.textAlign = 'center';
    noResults.style.opacity = '0.7';
    noResults.style.marginTop = '2rem';
    mainContent.appendChild(noResults);
    return;
  }

  // Add search bar ONLY when not rendering from search input directly
  if (!fromSearch) {
    filteredItems = category.items; // Reset filtered items to full list
    const searchBar = createSearchBar();
    mainContent.appendChild(searchBar);
  }

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = 1; // Reset invalid page number
  }

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const itemsGrid = document.createElement('div');
  itemsGrid.classList.add('items-grid');

  pageItems.forEach(item => {
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

  // Show pagination controls only if more than 1 page
  if (totalPages > 1) {
    const paginationControls = renderPaginationControls(totalPages);
    mainContent.appendChild(paginationControls);
  }

  mainContent.focus();
}

// Render the category selection cards grid
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
      filteredItems = [];
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

// Show loading indicator
function showLoading(show = true) {
  if (show) {
    mainContent.innerHTML = `<p class="loading">Loading categories...</p>`;
  }
}

// Initialization on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  await fetchAllCategoriesData();
  renderCategories();
});

// Nav categories link handler
navCategories.addEventListener('click', e => {
  e.preventDefault();
  currentCategory = null;
  currentPage = 1;
  filteredItems = [];
  renderCategories();
});
