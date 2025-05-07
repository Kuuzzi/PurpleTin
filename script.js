// script.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const movieContainers = document.querySelectorAll('.movie-list ul');
  const movies = {
    movies: ["Movie Title 1", "Movie Title 2"],
    tagalog: ["Tagalog Movie Title 1", "Tagalog Movie Title 2"],
    anime: ["Anime Title 1", "Anime Title 2"],
    tvseries: ["TV Series Title 1", "TV Series Title 2"]
  };

  function displayMovies(filteredMovies) {
    movieContainers.forEach((container, index) => {
      container.innerHTML = '';
      if (filteredMovies[index].length === 0) {
        const message = document.createElement('li');
        message.textContent = 'No movies found. Please check back later.';
        message.style.fontStyle = 'italic';
        message.style.color = '#bbb';
        container.appendChild(message);
      } else {
        filteredMovies[index].forEach(movie => {
          const li = document.createElement('li');
          li.textContent = movie;
          li.addEventListener('click', function() {
            window.location.href = `download.html?title=${encodeURIComponent(movie)}`;
          });
          container.appendChild(li);
        });
      }
    });
  }

  function filterMovies() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    if (searchQuery === '') {
      displayMovies(Object.values(movies).flat());
    } else {
      const filteredMovies = Object.values(movies).map(categoryMovies =>
        categoryMovies.filter(movie => movie.toLowerCase().includes(searchQuery))
      );
      displayMovies(filteredMovies);
    }
  }

  searchInput.addEventListener('input', filterMovies);

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
      filterMovies(); // Refilter movies when category is selected
    });
  });

  // Initial display of all movies
  displayMovies(Object.values(movies).map(categoryMovies => categoryMovies));
});
