// Utility: get movieId from URL param
function getMovieId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('movieId');
}

// Dummy function to simulate fetching movie info from your source
async function fetchMovieInfo(movieId) {
  // TODO: Replace with your real API call returning title, year, genres, overview
  // Example stub data:
  return {
    title: "Moana 2",
    year: "2024",
    genres: ["Animation", "Adventure", "Family", "Comedy"],
    overview: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced."
  };
}

function getServerEmbedUrl(serverIndex, movieId) {
  // Replace ${type} with "movie" as example -- adjust if needed
  const type = "movie";
  const servers = [
    `https://vidsrc.cc/v2/embed/${type}/${movieId}`,
    `https://vidsrc.net/embed/${type}/?tmdb=${movieId}`,
    `https://player.videasy.net/${type}/${movieId}`,
    `https://vidsrc.me/embed/${movieId}`
  ];
  return servers[serverIndex];
}

function setupServerButtons(movieId) {
  const container = document.getElementById('server-buttons');

  for(let i=0; i<4; i++) {
    const btn = document.createElement('button');
    btn.textContent = "Server " + (i + 1);
    btn.dataset.serverIndex = i;

    btn.addEventListener('click', () => {
      selectServer(i, movieId);
      setActiveButton(btn);
    });

    if (i === 0) {
      btn.classList.add('active');
    }

    container.appendChild(btn);
  }

  // Set initial server iframe
  document.getElementById('video-frame').src = getServerEmbedUrl(0, movieId);
}

function setActiveButton(activeBtn) {
  const buttons = document.querySelectorAll('#server-buttons button');
  buttons.forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}

function selectServer(index, movieId) {
  const iframe = document.getElementById('video-frame');
  iframe.src = getServerEmbedUrl(index, movieId);
}

async function init() {
  const movieId = getMovieId();

  if(!movieId) {
    alert('No movie ID provided in URL!');
    return;
  }

  const movieInfo = await fetchMovieInfo(movieId);

  // Update UI
  document.getElementById('movie-title').textContent = movieInfo.title;
  document.getElementById('movie-year').textContent = movieInfo.year;

  const genresContainer = document.getElementById('genres');
  genresContainer.innerHTML = '';
  movieInfo.genres.forEach(g => {
    const span = document.createElement('span');
    span.textContent = g;
    genresContainer.appendChild(span);
  });

  document.getElementById('overview-text').textContent = movieInfo.overview;

  setupServerButtons(movieId);
}

init();
