/**
 * Arcade Cabinet Manager Application
 * 
 * Main entry point for the arcade cabinet management dashboard.
 */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎮 Arcade Cabinet Manager - Initializing...');
  
  // Create configuration manager with optimized settings
  const configManager = new ConfigurationManager({
    memoryPool: {
      poolSize: 50 * 1024 * 1024,    // 50MB pool
      maxConfigurations: 100,         // Support 100+ configs
      cleanupInterval: 60000          // Cleanup every minute
    },
    validator: {
      strictMode: false               // Allow extra fields
    },
    parser: {
      chunkSize: 64 * 1024,           // 64KB chunks
      maxFileSize: 50 * 1024 * 1024   // 50MB max file
    },
    onConfigLoaded: (id, config) => {
      console.log(`✅ Configuration loaded: ${config.name} (${id})`);
    },
    onConfigRemoved: (id) => {
      console.log(`🗑️ Configuration removed: ${id}`);
    },
    onError: (error) => {
      console.error('❌ Configuration error:', error);
    }
  });

  // Load sample configurations for demo
  await loadSampleConfigurations(configManager);

  // Create and initialize dashboard
  const dashboard = new Dashboard('#app', {
    configManager,
    onConfigSelect: (config) => {
      console.log(`🎯 Selected: ${config.name}`);
    },
    onConfigDelete: (config) => {
      console.log(`🗑️ Deleted: ${config.name}`);
    }
  });

  await dashboard.initialize();
  
  // Expose for debugging
  window.arcadeManager = {
    configManager,
    dashboard
  };

  console.log('🎮 Arcade Cabinet Manager - Ready!');
});

/**
 * Loads sample configurations for demonstration
 * @param {ConfigurationManager} configManager - Configuration manager instance
 */
async function loadSampleConfigurations(configManager) {
  const sampleConfigs = [
    {
      id: 'classic-arcade',
      name: 'Classic Arcade',
      description: 'Retro classics from the golden age of arcade gaming',
      games: [
        { id: 'pacman', name: 'Pac-Man', path: '/games/pacman' },
        { id: 'galaga', name: 'Galaga', path: '/games/galaga' },
        { id: 'donkey-kong', name: 'Donkey Kong', path: '/games/donkey-kong' },
        { id: 'space-invaders', name: 'Space Invaders', path: '/games/space-invaders' },
        { id: 'frogger', name: 'Frogger', path: '/games/frogger' }
      ],
      settings: {
        volume: 75,
        brightness: 80,
        controls: { type: 'joystick', buttons: 2 }
      },
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-11-20T14:45:00Z'
    },
    {
      id: 'fighting-games',
      name: 'Fighting Games Collection',
      description: 'The best fighting games from arcade history',
      games: [
        { id: 'sf2', name: 'Street Fighter II', path: '/games/sf2' },
        { id: 'mk', name: 'Mortal Kombat', path: '/games/mk' },
        { id: 'tekken', name: 'Tekken 3', path: '/games/tekken3' },
        { id: 'kof', name: 'King of Fighters 98', path: '/games/kof98' }
      ],
      settings: {
        volume: 85,
        brightness: 75,
        controls: { type: 'fightstick', buttons: 6 }
      },
      createdAt: '2025-02-10T09:00:00Z',
      updatedAt: '2025-11-18T16:20:00Z'
    },
    {
      id: 'shooter-cabinet',
      name: 'Shooter Cabinet',
      description: 'Intense shoot-em-up action games',
      games: [
        { id: 'r-type', name: 'R-Type', path: '/games/rtype' },
        { id: 'gradius', name: 'Gradius', path: '/games/gradius' },
        { id: '1942', name: '1942', path: '/games/1942' },
        { id: 'contra', name: 'Contra', path: '/games/contra' },
        { id: 'metal-slug', name: 'Metal Slug', path: '/games/metal-slug' },
        { id: 'thunder-force', name: 'Thunder Force IV', path: '/games/thunder-force' }
      ],
      settings: {
        volume: 90,
        brightness: 70,
        controls: { type: 'joystick', buttons: 3 }
      },
      createdAt: '2025-03-05T11:15:00Z',
      updatedAt: '2025-11-15T12:30:00Z'
    },
    {
      id: 'racing-games',
      name: 'Racing Arcade',
      description: 'High-speed racing games with steering wheel support',
      games: [
        { id: 'outrun', name: 'OutRun', path: '/games/outrun' },
        { id: 'daytona', name: 'Daytona USA', path: '/games/daytona' },
        { id: 'cruisin', name: "Cruis'n USA", path: '/games/cruisin' }
      ],
      settings: {
        volume: 80,
        brightness: 85,
        controls: { type: 'wheel', pedals: true }
      },
      createdAt: '2025-04-20T14:00:00Z',
      updatedAt: '2025-11-10T09:45:00Z'
    },
    {
      id: 'puzzle-games',
      name: 'Puzzle Paradise',
      description: 'Mind-bending puzzle games for all skill levels',
      games: [
        { id: 'tetris', name: 'Tetris', path: '/games/tetris' },
        { id: 'puyo', name: 'Puyo Puyo', path: '/games/puyo' },
        { id: 'columns', name: 'Columns', path: '/games/columns' },
        { id: 'bust-a-move', name: 'Bust-a-Move', path: '/games/bustamove' }
      ],
      settings: {
        volume: 60,
        brightness: 80,
        controls: { type: 'joystick', buttons: 2 }
      },
      createdAt: '2025-05-12T08:30:00Z',
      updatedAt: '2025-11-22T10:00:00Z'
    },
    {
      id: 'beat-em-up',
      name: "Beat 'Em Up Collection",
      description: 'Side-scrolling beat-em-up classics',
      games: [
        { id: 'final-fight', name: 'Final Fight', path: '/games/final-fight' },
        { id: 'streets-of-rage', name: 'Streets of Rage 2', path: '/games/sor2' },
        { id: 'tmnt', name: 'TMNT: Turtles in Time', path: '/games/tmnt' },
        { id: 'simpsons', name: 'The Simpsons Arcade', path: '/games/simpsons' },
        { id: 'xmen', name: 'X-Men Arcade', path: '/games/xmen' }
      ],
      settings: {
        volume: 85,
        brightness: 75,
        controls: { type: 'joystick', buttons: 2 }
      },
      createdAt: '2025-06-08T15:20:00Z',
      updatedAt: '2025-11-21T11:15:00Z'
    },
    {
      id: 'sports-cabinet',
      name: 'Sports Arcade',
      description: 'Classic sports arcade games',
      games: [
        { id: 'nba-jam', name: 'NBA Jam', path: '/games/nba-jam' },
        { id: 'nfl-blitz', name: 'NFL Blitz', path: '/games/nfl-blitz' },
        { id: 'punch-out', name: 'Punch-Out!!', path: '/games/punch-out' }
      ],
      settings: {
        volume: 90,
        brightness: 80,
        controls: { type: 'joystick', buttons: 4 }
      },
      createdAt: '2025-07-01T12:00:00Z',
      updatedAt: '2025-11-19T14:30:00Z'
    },
    {
      id: 'platform-games',
      name: 'Platformer Collection',
      description: 'Jump and run through classic platform games',
      games: [
        { id: 'mario-bros', name: 'Super Mario Bros', path: '/games/mario' },
        { id: 'sonic', name: 'Sonic the Hedgehog', path: '/games/sonic' },
        { id: 'mega-man', name: 'Mega Man 2', path: '/games/megaman2' },
        { id: 'ghosts', name: "Ghosts 'n Goblins", path: '/games/ghosts' }
      ],
      settings: {
        volume: 70,
        brightness: 80,
        controls: { type: 'joystick', buttons: 2 }
      },
      createdAt: '2025-08-15T10:45:00Z',
      updatedAt: '2025-11-17T16:00:00Z'
    },
    {
      id: 'pinball-cabinet',
      name: 'Virtual Pinball',
      description: 'Digital recreations of classic pinball machines',
      games: [
        { id: 'pinball-fx', name: 'Pinball FX Classic Tables', path: '/games/pinball-fx' },
        { id: 'pro-pinball', name: 'Pro Pinball Collection', path: '/games/pro-pinball' }
      ],
      settings: {
        volume: 85,
        brightness: 90,
        controls: { type: 'flipper', nudge: true }
      },
      createdAt: '2025-09-20T09:30:00Z',
      updatedAt: '2025-11-16T13:45:00Z'
    },
    {
      id: 'rhythm-games',
      name: 'Rhythm & Music',
      description: 'Music and rhythm arcade games',
      games: [
        { id: 'ddr', name: 'Dance Dance Revolution', path: '/games/ddr' },
        { id: 'beatmania', name: 'Beatmania IIDX', path: '/games/beatmania' },
        { id: 'pop-n-music', name: "Pop'n Music", path: '/games/popn' },
        { id: 'taiko', name: 'Taiko no Tatsujin', path: '/games/taiko' }
      ],
      settings: {
        volume: 95,
        brightness: 85,
        controls: { type: 'dance-pad', buttons: 4 }
      },
      createdAt: '2025-10-05T16:00:00Z',
      updatedAt: '2025-11-23T08:30:00Z'
    },
    {
      id: 'neo-geo-cabinet',
      name: 'Neo Geo MVS',
      description: 'Premium Neo Geo Multi Video System games',
      games: [
        { id: 'kof-series', name: 'King of Fighters Series', path: '/games/kof' },
        { id: 'samurai', name: 'Samurai Shodown', path: '/games/samurai' },
        { id: 'fatal-fury', name: 'Fatal Fury Special', path: '/games/fatal-fury' },
        { id: 'baseball-stars', name: 'Baseball Stars', path: '/games/baseball-stars' },
        { id: 'neo-turf', name: 'Neo Turf Masters', path: '/games/neo-turf' }
      ],
      settings: {
        volume: 80,
        brightness: 75,
        controls: { type: 'joystick', buttons: 4 }
      },
      createdAt: '2025-10-28T11:30:00Z',
      updatedAt: '2025-11-24T15:20:00Z'
    },
    {
      id: 'multiplayer-cabinet',
      name: 'Party Multiplayer',
      description: '4-player multiplayer arcade classics',
      games: [
        { id: 'gauntlet', name: 'Gauntlet Legends', path: '/games/gauntlet' },
        { id: 'sunset-riders', name: 'Sunset Riders', path: '/games/sunset-riders' },
        { id: 'simpsons', name: 'The Simpsons', path: '/games/simpsons-arcade' },
        { id: 'xmen-6p', name: 'X-Men 6 Player', path: '/games/xmen-6p' }
      ],
      settings: {
        volume: 90,
        brightness: 80,
        controls: { type: 'joystick', buttons: 2, players: 4 }
      },
      createdAt: '2025-11-01T14:00:00Z',
      updatedAt: '2025-11-25T10:10:00Z'
    }
  ];

  // Load all sample configurations
  for (const config of sampleConfigs) {
    try {
      await configManager.loadFromString(JSON.stringify(config));
    } catch (e) {
      console.warn(`Failed to load sample config: ${config.name}`, e);
    }
  }

  // Set the first one as active
  if (sampleConfigs.length > 0) {
    configManager.switchConfig(sampleConfigs[0].id);
  }
}
