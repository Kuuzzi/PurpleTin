// script.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const movieContainers = document.querySelectorAll('.movie-list ul');

  const movies = {
    movies: ["Movie Title"],
    tagalog: ["Sampung Utos Kay Josh 2025"],
    anime: ["Anime Title"],
    tvseries: ["TV Series Title"]
  };

  function displayMovies() {
    movieContainers.forEach((container, index) => {
      const category = Object.keys(movies)[index];
      const moviesInCategory = movies[category];
      container.innerHTML = '';

      if (moviesInCategory.length === 0) {
        const message = document.createElement('li');
        message.textContent = 'No movies available yet. Please check back later.';
        message.style.fontStyle = 'italic';
        message.style.color = '#bbb';
        container.appendChild(message);
      } else {
        moviesInCategory.forEach(movie => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="#">${movie}</a>
            <button onclick="downloadMovie('${movie}', '1080p')">Download 1080p</button>
            <button onclick="downloadMovie('${movie}', '720p')">Download 720p</button>
          `;
          container.appendChild(li);
        });
      }
    });
  }

// script.js
function downloadMovie(title, quality) {
  // Implement your download logic here
  // For now, it just shows an alert
  alert(`Downloading ${title} in ${quality} quality...`);
  // Example: window.location.href = `/path/to/${title}-${quality}.mp4`;
}

  searchInput.addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase().trim();
    const allMovies = Object.values(movies).flat();
    const filteredMovies = allMovies.filter(movie =>
      movie.toLowerCase().includes(searchQuery)
    );

    displayMovies(filteredMovies);
  });

  // Initial display of all movies
  displayMovies();
});

const navLinks = document.querySelectorAll('.nav-left a');
const sections = document.querySelectorAll('.movie-list');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const category = this.getAttribute('href').substring(1);

    sections.forEach(section => {
      section.style.display = 'none';
    });

    document.getElementById(category).style.display = 'block';
  });
});
