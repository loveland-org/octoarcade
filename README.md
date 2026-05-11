# 🕹️ OctoArcade - Arcade Cabinet Management Dashboard

A comprehensive dashboard for managing multiple arcade cabinet configurations, allowing users to organize, compare, and switch between different gaming setups.

## Features

### Core Functionality
- ✅ **Configuration Management**: Add, edit, delete, and organize arcade cabinet configurations
- ✅ **Quick Switching**: Seamlessly switch between different cabinet setups
- ✅ **Search & Filter**: Find configurations quickly with real-time search
- ✅ **Visual Dashboard**: Beautiful, modern interface with configuration cards
- ✅ **Active Configuration Tracking**: Clear indication of currently active setup

### Performance & Reliability
- ✅ **Memory Pool Allocator**: Efficient memory management prevents crashes with large configurations
- ✅ **Streaming Parser**: Large configuration files are parsed in chunks to avoid blocking
- ✅ **Configuration Validation**: Input validation and size limits prevent system overload
- ✅ **Fast Loading**: Dashboard loads in under 2 seconds with visual feedback
- ✅ **Handles 10+ Configurations**: Tested with multiple large configurations

### Data Management
- ✅ **Size Limits**: Maximum 1MB per configuration, 100 games per config
- ✅ **Persistent Storage**: Configurations saved to localStorage
- ✅ **Memory Statistics**: Track memory usage across all configurations
- ✅ **Error Handling**: Graceful error handling with user-friendly messages

## Quick Start

1. Open `index.html` in a modern web browser
2. The dashboard will load with sample configurations
3. Click "Add Configuration" to create your first custom arcade setup
4. Click "Activate" on any configuration to make it the active one

## Usage

### Adding a Configuration

1. Click the "+ Add Configuration" button
2. Fill in the configuration details:
   - **Name**: Give your configuration a descriptive name (max 50 chars)
   - **Description**: Optional description of the setup (max 200 chars)
   - **Games**: Comma-separated list of games (max 100 games)
   - **Settings**: JSON configuration for controls, display, and audio
3. Click "Save" to create the configuration

### Managing Configurations

- **Activate**: Click "Activate" to set a configuration as active
- **Edit**: Click "Edit" to modify an existing configuration
- **Delete**: Click "Delete" to remove a configuration (with confirmation)
- **Search**: Use the search box to filter configurations by name, description, or games

### Configuration Settings Format

Settings are stored as JSON with the following structure:

```json
{
  "controls": {
    "player1": {
      "up": "W",
      "down": "S",
      "left": "A",
      "right": "D",
      "action1": "Space",
      "action2": "LShift"
    },
    "player2": {
      "up": "ArrowUp",
      "down": "ArrowDown",
      "left": "ArrowLeft",
      "right": "ArrowRight",
      "action1": "Enter",
      "action2": "RShift"
    }
  },
  "display": {
    "resolution": "1920x1080",
    "fullscreen": true,
    "vsync": true
  },
  "audio": {
    "volume": 80,
    "soundEffects": true,
    "music": true
  }
}
```

## Architecture

### Components

1. **index.html**: Main HTML structure and UI layout
2. **styles.css**: Modern, responsive styling with dark theme
3. **config-manager.js**: Core configuration management logic
   - Memory pool allocation
   - Streaming parser for large files
   - Configuration validation
   - Storage management
4. **app.js**: Application logic and UI interactions
   - Event handling
   - Rendering
   - User feedback

### Key Features Implementation

#### Memory Pool Allocator
Prevents memory fragmentation and crashes by:
- Pre-allocating a 10MB memory pool
- Tracking memory usage per configuration
- Automatic garbage collection for old allocations
- Memory limit enforcement

#### Streaming Parser
Handles large configuration files efficiently by:
- Processing data in 64KB chunks
- Yielding to the event loop between chunks
- Non-blocking JSON parsing
- Progress feedback during parsing

#### Configuration Validation
Ensures system stability through:
- Name and description length limits
- Maximum games per configuration (100)
- Maximum configuration size (1MB)
- Total configurations limit (50)
- JSON schema validation

## Technical Specifications

### Limits
- **Max Configuration Size**: 1MB
- **Max Games Per Config**: 100
- **Max Total Configurations**: 50
- **Max Name Length**: 50 characters
- **Max Description Length**: 200 characters
- **Memory Pool Size**: 10MB

### Performance
- **Dashboard Load Time**: < 2 seconds
- **Configuration Switch Time**: < 300ms
- **Search Response Time**: Real-time (< 50ms)
- **Chunk Processing Size**: 64KB

### Browser Support
- Modern browsers with ES6+ support
- localStorage support required
- Tested on Chrome, Firefox, Safari, Edge

## Security

- XSS prevention through HTML escaping
- JSON validation before parsing
- Size limits prevent DoS attacks
- Input sanitization on all user inputs

## Troubleshooting

### Configuration Won't Save
- Check that the configuration size is under 1MB
- Ensure settings are valid JSON
- Verify you haven't exceeded 50 total configurations

### Memory Pool Exhausted
- Delete unused configurations
- Reduce configuration sizes
- Clear old allocations by refreshing the page

### Search Not Working
- Ensure search query is entered correctly
- Check that configurations contain the search terms
- Try clearing the search and starting fresh

## Future Enhancements

- Configuration import/export
- Bulk operations
- Configuration templates
- Cloud sync
- Configuration sharing
- Analytics dashboard
- Backup/restore functionality

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
