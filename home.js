const API_KEY = 'b139bc417606842811f1526ae92572bc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;
let featuredMovies = [];
let featuredIndex = 0;
let featuredTimer = null;

// Genre IDs mapping
const genreIds = {
  action: 28,
  comedy: 35,
  fantasy: 14,
  animation: 16,
};

// Get stars string
function getStars(rating) {
  const fullStars = Math.floor(rating / 2);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

// Fetch trending (movie or tv)
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

// Fetch anime by genre and Japanese language
async function fetchAnimeByGenre(genreId) {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&with_original_language=ja&language=en&sort_by=popularity.desc&page=1`
    );
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error('Anime fetch:', err);
    return [];
  }
}

// Fetch trailer url from YouTube embed
async function fetchTrailer(type, id) {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    let trailer = data.results.find(
      (v) =>
        (v.type.toLowerCase() === 'trailer' || v.type.toLowerCase() === 'teaser') &&
        v.site.toLowerCase() === 'youtube' &&
        v.official
    );
    if (!trailer) {
      trailer = data.results.find(
        (v) =>
          (v.type.toLowerCase() === 'trailer' || v.type.toLowerCase() === 'teaser') &&
          v.site.toLowerCase() === 'youtube'
      );
    }
    return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&enablejsapi=1` : null;
  } catch {
    return null;
  }
}

// Display banner info + trailer video switch for featured movie
async function displayBanner(item) {
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path || item.poster_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name || '';
  document.getElementById('banner-description').textContent = item.overview || '';
  document.getElementById('banner-year').textContent = (item.first_air_date || item.release_date || '').split('-')[0] || '';
  document.getElementById('banner-rating').innerHTML = `<i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) + ' / 10' : 'N/A'}`;

  const bannerVideoFrame = document.getElementById('banner-video');
  const type = item.media_type === 'tv' ? 'tv' : 'movie';
  const trailerURL = await fetchTrailer(type, item.id);
  if (trailerURL) {
    bannerVideoFrame.src = trailerURL;
    bannerVideoFrame.style.display = 'block';
  } else {
    bannerVideoFrame.style.display = 'none';
    bannerVideoFrame.src = '';
  }

  document.getElementById('btn-play').onclick = () => showDetails(item);
}

// Display list with rating badges
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((item) => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name || '';
    img.dataset.rating = `★ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// Show modal with info and player
function showDetails(item) {
  currentItem = item;
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title || item.name || '';
  document.getElementById('modal-description').textContent = item.overview || '';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML =
    '★'.repeat(Math.round(item.vote_average / 2)) + ` (${item.vote_average.toFixed(1)} / 10)`;
  document.getElementById('server').selectedIndex = 0;
  changeServer();
  modal.style.display = 'flex';
}

// Change embed server iframe src
function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  let embedURL = '';
  if (server === 'vidsrc.cc') {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }
  document.getElementById('modal-video').src = embedURL;
}

// Close modal and stop video
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// Open search modal and focus input
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  const input = document.getElementById('search-input');
  input.value = '';
  input.focus();
}

// Close search modal and clear
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

let searchTimeout = null;
// Search TMDb multi endpoint by query with debounce
function searchTMDB(query) {
  clearTimeout(searchTimeout);
  if (!query || query.trim() === '') {
    document.getElementById('search-results').innerHTML = '';
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      const container = document.getElementById('search-results');
      container.innerHTML = '';
      data.results.forEach((item) => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name || '';
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);
}

// Setup horizontal scrolling carousel button handlers
function setupCarouselButtons() {
  const carousels = document.querySelectorAll('.carousel-wrapper');
  carousels.forEach((carousel) => {
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const list = carousel.querySelector('.list');
    prevBtn.onclick = () => {
      list.scrollBy({ left: -400, behavior: 'smooth' });
    };
    nextBtn.onclick = () => {
      list.scrollBy({ left: 400, behavior: 'smooth' });
    };
  });
}

// Initialize featured movies rotation in banner every 8 seconds
async function startFeaturedRotation(movies) {
  if (!movies.length) return;
  featuredMovies = movies;
  featuredIndex = 0;
  await displayBanner(featuredMovies[featuredIndex]);
  if (featuredTimer) clearInterval(featuredTimer);
  featuredTimer = setInterval(async () => {
    featuredIndex = (featuredIndex + 1) % featuredMovies.length;
    await displayBanner(featuredMovies[featuredIndex]);
  }, 8000);
}

// Main init
async function init() {
  try {
    setupCarouselButtons();

    // Get trending movies
    const trendingMovies = await fetchTrending('movie');
    trendingMovies.forEach((m) => (m.media_type = 'movie'));

    // Start featured movies rotation with top 8 trending movies
    const featured = trendingMovies.slice(0, 8);
    await startFeaturedRotation(featured);

    // Fetch anime by genres
    const actionAnime = await fetchAnimeByGenre(genreIds.action);
    actionAnime.forEach((m) => (m.media_type = 'tv'));
    displayList(actionAnime, 'action-list');

    const comedyAnime = await fetchAnimeByGenre(genreIds.comedy);
    comedyAnime.forEach((m) => (m.media_type = 'tv'));
    displayList(comedyAnime, 'comedy-list');

    const fantasyAnime = await fetchAnimeByGenre(genreIds.fantasy);
    fantasyAnime.forEach((m) => (m.media_type = 'tv'));
    displayList(fantasyAnime, 'fantasy-list');

    const cartoonsAnime = await fetchAnimeByGenre(genreIds.animation);
    cartoonsAnime.forEach((m) => (m.media_type = 'tv'));
    displayList(cartoonsAnime, 'cartoons-list');
  } catch (error) {
    console.error('Init error:', error);
  }
}

init();
