// script.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const movieContainers = document.querySelectorAll('.movie-list ul');

  const movies = {
    movies: [
     { title: "Movie Title 1", url: "https://example.com/movie1" },
     { title: "Movie Title 2", url: "https://example.com/movie2" }
   ],
    tagalog: [
     { title: "Sampung Utos Kay Josh 2025", url: "https://pastepeso.com/lMe53DgC" },
     { title: "Ang Babaeng Walang Pakiramdam 2021", url: "https://pastepeso.com/FvNH0qZqR" }
    ],
    anime: [
     { title: "Anime Title 1", url: "https://example.com/anime1" },
     { title: "Anime Title 2", url: "https://example.com/anime2" }
    ],
    tvseries: [
     { title: "TV Series Title 1", url: "https://example.com/tvseries1" },
     { title: "TV Series Title 2", url: "https://example.com/tvseries2" }
    ]
  };

  function displayMovies(filteredMovies) {
    movieContainers.forEach((container, index) => {
      const category = Object.keys(movies)[index];
      const moviesInCategory = filteredMovies[index] || movies[category];
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
          const a = document.createElement('a');
          a.href = movie.url; // Set the href attribute to the movie's URL
          a.textContent = movie.title;
          a.target = "_blank"; // Open the link in a new tab
          li.appendChild(a);
          container.appendChild(li);
        });
      }
    });
  }

  searchInput.addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase().trim();
    const allMovies = Object.values(movies).flat();
    const filteredMovies = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery)
    );

    displayMovies(filteredMovies);
  });

  // Initial display of all movies
  displayMovies(Object.values(movies).flat());

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
