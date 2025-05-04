const API_KEY = 'b139bc417606842811f1526ae92572bc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;
let featuredMovies = [];
let featuredIndex = 0;
let featuredTimer = null;

// Genres IDs to names mapping for reference
const genreIds = {
  action: 28,
  comedy: 35,
  fantasy: 14,
  animation:16,
};

// Helper: get star rating string
function getStars(rating) {
  const fullStars = Math.floor(rating / 2);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

// Fetch trending or tv shows
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json  return data.results;
}

// Fetch anime filtered by (using genre filter)
async function fetchAnimeByGenre(genre) {
  try {
    // Discover tv with Japanese language genre filter
    const res = await fetch(
      `${BASE}/discover/tv?api_key=${API_KEY}&withres=${genreId}&with_original_language=ja&language=en&sort_by=popularity.desc&page=1`
       const data = await res.json();
    return data.results  } catch (err) {
    console.error('Anime fetch:', err);
    return [];
  }
}

// Fetch video trailers for given item and type
async function fetchTrailer(type, id) {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    let trailer = data.results.find(
      (video) =>
        ['trailer', 'teaser'].includes(video.type.toLowerCase()) &&
        video.site.toLowerCase() === 'youtube' &&
        video.official
    );
    if (!trailer) {
      trailer = data.results.find(
        (video) =>
          ['trailer', 'teaser'].includes(video.type.toLowerCase()) &&
          video.site.toLowerCase() === 'youtube'
      );
    }
    return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&enablejsapi=1` : null;
  } catch {
    return null;
  }
}

// Display banner info + trailer iframe
async functionBanner(item) {
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url(${_URL}${item.backdrop_path || item.poster_path})`;
 .getElementById('banner-title').textContent = item || item.name || '';
  document.getElementById('banner').textContent = item.overview || '';
  document.getById('banner-year').textContent = (item.first_air_date || item.release_date || '').split('-')[0] ||  document.getElementById('banner-rating').innerHTML    '<i class="fas fa-star"></i> ' +item.vote_average ? item.vote_average.toFixed(1) ' / 10' : 'N/A');

  const bannerVideoFrame = document.getElementById('banner-video');
  type = item.media_type === 'tv' ? 'tv' 'movie';
  const trailerURL = await fetchTrailer(type, item.id);
  if (trailerURL) {
    bannerFrame.src = trailerURL;
    bannerVideoFrame.style.display 'block';
  } else {
    bannerVideoFrame.style = 'none';
    bannerVideoFrame.src = '';
  }

 document.getElementById('btn-play').onclick = () showDetails(item);
}

// Display horizontal list with ratings
function display(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((item) => {
    if (!item.poster_path) return    const img = document.createElement('img');
 img.src = `${IMG_URL}${item.poster_path}`;
    img = item.title || item.name || '';
    img.dataset.rating '★ ' + (item.vote_average ? item.vote_averageFixed(1) : 'N/A');
    img.onclick = => showDetails(item);
    container.appendChild(img);
 }

// Show modal with item details and play embed video
function show(item) {
  currentItem = item;
  const modal document.getElementById('modal');
  document.getElementBy('modal-title').textContent = item.title || item.name '';
  document.getElementById('modal-description').text = item.overview || '';
  document.getElementById('-image').src = `${IMG_URL}${item.poster_path}`;
 document.getElementById('modal-rating').innerHTML =
   ★'.repeat(Math.round(item.vote_average / 2)) ` (${item.vote_average.toFixed(1)} / 10`;
  document.getElementById('server').selectedIndex 0;
  changeServer();
  modal.style.display =flex';
}

// Change embed server iframe in modal
function changeServer {
  if (!currentItem) return;
  const server document.getElementById('server').value;
  const type currentItem.media_type === 'movie' ? 'movie' 'tv';
  let embedURL = '';
  if (server 'vidsrc.cc') {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id  } else if (server === 'vidsrc.me') {
 embedURL = `https://vidsrc.net/embed/${type?tmdb=${currentItem.id}`;
  } else if ( === 'player.videasy.net') {
    embedURL `https://player.videasy.net/${type}/${currentItem}`;
  }
  document.getElementById('modal-videosrc = embedURL;
}

// Close modal and clear iframe src
 closeModal() {
  document.getElementById('modalstyle.display = 'none';
  document.getElementByIdmodal-video').src = '';
}

// Search modal open & close
 openSearchModal() {
  document.getElementById('-modal').style.display = 'flex';
  const input = documentElementById('search-input');
  input.value = '';
 input.focus();
}

function closeSearchModal() {
  documentElementById('search-modal').style.display = 'none';
 document.getElementById('search-results').innerHTML =}

// TMDb search by query
let searchTimeout = null;
 function searchTMDB(query) {
  clearTimeout(searchTimeout  if (!query || query.trim() === '') {
    documentElementById('search-results').innerHTML = '';
   ;
  }
  // Debounce to limit API calls
 searchTimeout = setTimeout(async () => {
    try {
      res = await fetch(`${BASE_URL}/search/multi?_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      data = await res.json();
      const container = document.getById('search-results');
      container.innerHTML = '';
 data.results.forEach((item) => {
        if (!item_path) return;
        const img = document.createElement('');
        img.src = `${IMG_URL}${item.poster_path}`;
 img.alt = item.title || item.name || '';
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
    } catch (error) {
      console.error('Search error:', error    }
  }, 300);
}

// Carousel buttons scroll
functionCarouselButtons() {
  const carousels = document.querySelectorAll('.carousel-wrapper');
  carousels.forEach((carousel) => {
    const prevBtn = carousel.querySelector('.carousel.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const list = carousel.querySelector('.list');
    prevBtn.onclick = () => list.scrollBy({ left: -400, behavior: 'smooth' });
    nextBtn.onclick = () => list.scrollBy({ left: 400, behavior: 'smooth' });
  });
}

// FEATURED MOVIES ROTATION
async function startFeaturedRotation(movies) {
  if (!movies.length) return;
  const featuredList = document.getElementById('featured-list');
  featuredList.innerHTML = '';

  // Display all 8 featured movies in carousel list
  for (let movie of movies) {
    if (!movie.poster_path) continue;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${movie.poster_path}`;
    img.alt = movie.title || movie.name || '';
    img.dataset.rating = '★ ' + (movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A');
    img.onclick = () => showDetails(movie);
    featuredList.appendChild(img);
  }

  // Cycle banner to these movies every 8 seconds
  featuredMovies = movies;
  featuredIndex = 0;
  await displayBanner(featuredMovies[featuredIndex]);

  if (featuredTimer) clearInterval(featuredTimer);
  featuredTimer = setInterval(async () => {
    featuredIndex = (featuredIndex + 1) % featuredMovies.length;
    await displayBanner(featuredMovies[featuredIndex]);
  }, 8000);
}

// Initialize the pageasync function init() {
  try {
    setupCarouselButtons    const trendingMovies = await fetchTrending('movie');
    const featured = trendingMovies.slice(0, 8);
    featured.forEach((m) => (m.media_type = 'movie')); // normalize media_type
    startFeaturedRotation(featured);

    // Display the other categories: action, comedy, fantasy, cartoons(anime)
    const actionAnime = await fetchAnimeByGenre(genreIds.action);
    actionAnime.forEach((m) =>m.media_type = 'tv'));
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
