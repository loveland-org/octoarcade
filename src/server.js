const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing
const games = [
  { id: 1, name: 'Pac-Man', genre: 'Arcade', highScore: 999999, players: 12543 },
  { id: 2, name: 'Space Invaders', genre: 'Shooter', highScore: 87500, players: 8932 },
  { id: 3, name: 'Asteroids', genre: 'Shooter', highScore: 156200, players: 6781 },
  { id: 4, name: 'Frogger', genre: 'Action', highScore: 65320, players: 4521 },
  { id: 5, name: 'Centipede', genre: 'Shooter', highScore: 98765, players: 3456 },
  { id: 6, name: 'Donkey Kong', genre: 'Platform', highScore: 125000, players: 9876 },
  { id: 7, name: 'Galaga', genre: 'Shooter', highScore: 245670, players: 7654 },
  { id: 8, name: 'Ms. Pac-Man', genre: 'Arcade', highScore: 888888, players: 11234 }
];

const players = [
  { id: 1, name: 'PlayerOne', totalScore: 567890, gamesPlayed: 45, rank: 1 },
  { id: 2, name: 'ArcadeKing', totalScore: 523456, gamesPlayed: 38, rank: 2 },
  { id: 3, name: 'HighScorer', totalScore: 456789, gamesPlayed: 42, rank: 3 },
  { id: 4, name: 'RetroGamer', totalScore: 398765, gamesPlayed: 29, rank: 4 },
  { id: 5, name: 'PixelMaster', totalScore: 345678, gamesPlayed: 35, rank: 5 }
];

// Simulate database query delay for realistic load testing
const simulateDelay = () => {
  const delay = Math.random() * 100 + 50; // 50-150ms random delay
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Search endpoint - searches games and players
app.get('/api/search', async (req, res) => {
  try {
    await simulateDelay();
    
    const { q, type, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const query = q.toLowerCase();
    let results = [];
    
    if (!type || type === 'games') {
      const gameResults = games
        .filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.genre.toLowerCase().includes(query)
        )
        .map(game => ({ ...game, type: 'game' }));
      results = results.concat(gameResults);
    }
    
    if (!type || type === 'players') {
      const playerResults = players
        .filter(player => player.name.toLowerCase().includes(query))
        .map(player => ({ ...player, type: 'player' }));
      results = results.concat(playerResults);
    }
    
    results = results.slice(0, parseInt(limit));
    
    res.json({
      query: q,
      type: type || 'all',
      count: results.length,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Dashboard endpoint - returns aggregated statistics
app.get('/api/dashboard', async (req, res) => {
  try {
    await simulateDelay();
    
    const totalGames = games.length;
    const totalPlayers = players.length;
    const totalScores = players.reduce((sum, player) => sum + player.totalScore, 0);
    const averageScore = Math.round(totalScores / totalPlayers);
    
    // Top games by player count
    const topGames = games
      .sort((a, b) => b.players - a.players)
      .slice(0, 5)
      .map(game => ({
        name: game.name,
        players: game.players,
        highScore: game.highScore
      }));
    
    // Recent activity simulation
    const recentActivity = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      player: players[Math.floor(Math.random() * players.length)].name,
      game: games[Math.floor(Math.random() * games.length)].name,
      score: Math.floor(Math.random() * 100000),
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
    }));
    
    res.json({
      stats: {
        totalGames,
        totalPlayers,
        averageScore,
        totalScores
      },
      topGames,
      leaderboard: players.slice(0, 5),
      recentActivity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Dashboard data failed to load', message: error.message });
  }
});

// Games endpoint for additional testing
app.get('/api/games', async (req, res) => {
  try {
    await simulateDelay();
    
    const { genre, limit = 10 } = req.query;
    let filteredGames = games;
    
    if (genre) {
      filteredGames = games.filter(game => 
        game.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    
    filteredGames = filteredGames.slice(0, parseInt(limit));
    
    res.json({
      count: filteredGames.length,
      games: filteredGames,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games', message: error.message });
  }
});

// Players endpoint for additional testing
app.get('/api/players', async (req, res) => {
  try {
    await simulateDelay();
    
    const { limit = 10 } = req.query;
    const limitedPlayers = players.slice(0, parseInt(limit));
    
    res.json({
      count: limitedPlayers.length,
      players: limitedPlayers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players', message: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`OctoArcade server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Search API: http://localhost:${PORT}/api/search?q=pac`);
  console.log(`Dashboard API: http://localhost:${PORT}/api/dashboard`);
});

module.exports = app;