// script.js
document.addEventListener('DOMContentLoaded', function() {
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
