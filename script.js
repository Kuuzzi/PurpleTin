// script.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const movieContainers = document.querySelectorAll('.movie-list ul');

  const movies = [
    "Movie Title",
    "Sampung Utos Kay Josh 2025",
    // Add more movies here
  ];

  function displayMovies(filteredMovies) {
    movieContainers.forEach(container => {
      container.innerHTML = ''; // Clear existing movies

      if (filteredMovies.length === 0) {
        const message = document.createElement('li');
        message.textContent = 'No movies found. Please check back later.';
        message.style.fontStyle = 'italic';
        message.style.color = '#bbb';
        container.appendChild(message);
      } else {
        filteredMovies.forEach(movie => {
          const li = document.createElement('li');
          li.textContent = movie;
          li.addEventListener('click', function() {
            // Handle click event to navigate to download page
            window.location.href = `download.html?title=${encodeURIComponent(movie)}`;
          });
          container.appendChild(li);
        });
      }
    });
  }

  searchInput.addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase().trim();
    if (searchQuery === '') {
      displayMovies(movies); // Display all movies if search query is empty
    } else {
      const filteredMovies = movies.filter(movie =>
        movie.toLowerCase().includes(searchQuery)
      );
      displayMovies(filteredMovies);
    }
  });

  // Initial display of all movies
  displayMovies(movies);

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
});
