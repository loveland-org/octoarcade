module.exports = {
  searchTerms: function(context, events, done) {
    const terms = ['pac', 'space', 'arcade', 'frog', 'asteroid', 'donkey', 'galaga', 'centipede'];
    return terms[Math.floor(Math.random() * terms.length)];
  },
  
  gameNames: function(context, events, done) {
    const games = ['Pac-Man', 'Space Invaders', 'Asteroids', 'Frogger', 'Centipede', 'Donkey Kong', 'Galaga'];
    return games[Math.floor(Math.random() * games.length)];
  },
  
  playerTerms: function(context, events, done) {
    const terms = ['Player', 'King', 'Master', 'Gamer', 'Scorer'];
    return terms[Math.floor(Math.random() * terms.length)];
  },
  
  gameGenres: function(context, events, done) {
    const genres = ['Arcade', 'Shooter', 'Action', 'Platform'];
    return genres[Math.floor(Math.random() * genres.length)];
  }
};