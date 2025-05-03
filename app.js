const apiKey = 'b139bc417606842811f1526ae92572bc'; // <-- Replace with your TMDb API key
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const mainContent = document.getElementById('main-content');
const navCategories = document.getElementById('nav-categories');

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

// Utility function to fetch JSON and handle errors
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

// Combine movie & TV results for categories that have both
function combineResults(movieData, tvData) {
  const movies = movieData?.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
  const tvs = tvData?.results?.map(item => ({ ...item, media_type: 'tv' })) || [];
  const combined = [...movies, ...tvs];
  // Return up to 20 combined items
  return combined.slice(0, 20);
}

// Fetch all category data and store in categories[].items
async function fetchAllCategoriesData() {
  for (const category of categories) {
    try {
      if (category.fetchUrlMovie && category.fetchUrlTV) {
        // Categories with both movie and TV fetch URLs (anime, cartoons, manga)
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
        // Categories with single fetch URL
        const data = await fetchJSON(category.fetchUrl);
        category.items = data?.results?.slice(0, 20) || [];
      } else {
        category.items = [];
      }
    } catch (e) {
      console.error(`Error fetching category ${category.name}:`, e);
      category.items = [];
    }
  }
}

// Render categories grid on page load
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

// Render items of a selected category
function renderCategoryItems(category) {
  mainContent.innerHTML = '';

  // Back button
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.classList.add('back-button');
  backBtn.textContent = '← Back to Categories';
  backBtn.addEventListener('click', () => {
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

  if (!category.items.length) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No content available for this category right now.';
    noResults.style.textAlign = 'center';
    noResults.style.opacity = '0.7';
    noResults.style.marginTop = '2rem';
    mainContent.appendChild(noResults);
    return;
  }

  // Items grid
  const itemsGrid = document.createElement('div');
  itemsGrid.classList.add('items-grid');

  category.items.forEach(item => {
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

    // Allow keyboard Enter or Space on entire item card to trigger watch
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

// Show loading indicator while fetching
function showLoading(show = true) {
  if (show) {
    mainContent.innerHTML = `<p class="loading">Loading categories...</p>`;
  }
}

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  await fetchAllCategoriesData();
  renderCategories();  
});

// Nav link to categories (in header)
navCategories.addEventListener('click', e => {
  e.preventDefault();
  renderCategories();
});
