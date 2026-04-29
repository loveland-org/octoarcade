# 🎮 Octoarcade - Arcade Cabinet Manager

A comprehensive dashboard for managing multiple arcade cabinet configurations, allowing users to organize, compare, and switch between different gaming setups.

## Features

- **Configuration Management**: Load, save, and manage arcade cabinet configurations
- **Memory Pool Allocator**: Efficient memory management to prevent crashes with large configurations
- **Configuration Validation**: Input validation with size limits for security
- **Streaming Parser**: Optimized parsing for large configuration files
- **Visual Dashboard**: Modern, responsive UI for managing configurations
- **Configuration Comparison**: Compare two configurations side-by-side

## Getting Started

### Open the Dashboard

Simply open `src/index.html` in a web browser to view the dashboard with sample configurations.

### Running Tests

```bash
node tests/test.js
```

## Architecture

### Core Components

- **MemoryPool** (`src/utils/memoryPool.js`): Memory pool allocator for efficient configuration loading
- **ConfigurationValidator** (`src/utils/configValidator.js`): Validation and size limits for configurations
- **StreamingConfigParser** (`src/utils/streamingParser.js`): Streaming parser for large files
- **ConfigurationManager** (`src/utils/configManager.js`): Central manager integrating all utilities
- **Dashboard** (`src/components/Dashboard.js`): Main dashboard UI component
- **ConfigurationCard** (`src/components/ConfigurationCard.js`): Individual configuration card component

### Success Criteria

- ✅ Manage 10+ configurations without performance issues
- ✅ Dashboard loads in under 2 seconds with visual feedback
- ✅ Configuration switching works reliably without crashes
- ✅ Memory pool prevents crashes from large configurations
- ✅ Configuration validation enforces size limits

## Configuration Format

```json
{
  "id": "unique-id",
  "name": "Cabinet Name",
  "description": "Description of the cabinet",
  "games": [
    { "id": "game-id", "name": "Game Name", "path": "/path/to/game" }
  ],
  "settings": {
    "volume": 75,
    "brightness": 80
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

## Configuration Limits

- Maximum configuration size: 10MB
- Maximum games per cabinet: 500
- Maximum name length: 100 characters
- Maximum description length: 1000 characters
- Maximum nesting depth: 10 levels

## License

MIT
