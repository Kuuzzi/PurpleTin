// script.js

const movies = []; // No movies yet

const container = document.getElementById("movieContainer");

function displayMovies(list) {
  container.innerHTML = "";

  if (list.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No movies available yet. Please check back later.";
    message.style.fontStyle = "italic";
    message.style.color = "#bbb";
    container.appendChild(message);
    return;
  }

  list.forEach(movie => {
    const li = document.createElement("li");
    li.textContent = movie;
    container.appendChild(li);
  });
}

document.getElementById("searchInput").addEventListener("input", function () {
  const search = this.value.toLowerCase();
  const filtered = movies.filter(m => m.toLowerCase().includes(search));
  displayMovies(filtered);
});

displayMovies(movies);
