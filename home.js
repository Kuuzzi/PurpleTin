const API_KEY = 'b139bc417606842811f1526ae92572bc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem = null;

// Helper to get rating stars string
function getStars(rating) {
  const fullStars = Math.floor(rating / 2);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

// Fetch trending movies, tv, or anime
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

// Fetch trending anime filtered by Japanese animation & genre 16 (Animation)
async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
    );
    const data = await res.json();
    const filtered = data.results.filter(
      (item) => item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

// Fetch video trailers for a given item id and type (movie or tv)
async function fetchTrailer(type, id) {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    // Prefer official trailer on YouTube
    let trailer = data.results.find(
      (video) =>
        (video.type.toLowerCase() === 'trailer' || video.type.toLowerCase() === 'teaser') &&
        video.site.toLowerCase() === 'youtube' &&
        video.official
    );
    if (!trailer) {
      trailer = data.results.find(
        (video) =>
          (video.type.toLowerCase() === 'trailer' || video.type.toLowerCase() === 'teaser') &&
          video.site.toLowerCase() === 'youtube'
      );
    }
    return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&enablejsapi=1` : null;
  } catch (error) {
    console.error('Failed fetching trailers:', error);
    return null;
  }
}

// Display banner info & background
async function displayBanner(item) {
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path || item.poster_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name || '';
  document.getElementById('banner-description').textContent = item.overview || '';
  document.getElementById('banner-year').textContent = (item.first_air_date || item.release_date || '').split('-')[0] || '';
  document.getElementById('banner-rating').innerHTML =
    '<i class="fas fa-star"></i> ' + (item.vote_average ? item.vote_average.toFixed(1) + ' / 10' : 'N/A');

  // Load trailer video in banner-video iframe
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

  // Play button scrolls to details modal for featured item
  document.getElementById('btn-play').onclick = () => showDetails(item);
}

// Display a horizontal list of movies/shows/anime with ratings
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  items.forEach((item) => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.dataset.rating = '★ ' + (item.vote_average ? item.vote_average.toFixed(1) : 'N/A');
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// Show modal with details of the clicked movie/show
function showDetails(item) {
  currentItem = item;
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title || item.name || '';
  document.getElementById('modal-description').textContent = item.overview || '';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML =
    '★'.repeat(Math.round(item.vote_average / 2)) + ` (${item.vote_average.toFixed(1)} / 10)`;
  document.getElementById('server').selectedIndex = 0; // default server
  changeServer();
  modal.style.display = 'flex';
}

// Change server embed URL in modal iframe
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

// Search modal open/close
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').value = '';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

// Search TMDB API on user input
async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

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
}

// Carousel scroll controls

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

async function init() {
  try {
    const movies = await fetchTrending('movie');
    const tvShows = await fetchTrending('tv');
    const anime = await fetchTrendingAnime();

    // Featured banner is random from movies trending
    const featured = movies[Math.floor(Math.random() * movies.length)];
    // Provide media_type for uniformity
    featured.media_type = 'movie';

    displayBanner(featured);
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');

    setupCarouselButtons();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

init();
