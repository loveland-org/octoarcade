# 🕹️ OctoArcade

**Arcade Cabinet Configuration Manager**

A web-based application for managing arcade cabinet configurations, designed to handle large game collections without memory allocation issues.

## Features

- 📁 Load arcade cabinet configurations from JSON files
- 🚀 Memory-efficient streaming parser for large configurations (50+ games)
- 📊 Real-time progress tracking and memory usage monitoring
- 🎮 Support for detailed game metadata and controls mapping
- ✅ Configuration file validation and size limits
- 🔄 Chunked processing to prevent UI freezing
- ❌ Cancellable loading operations

## Bug Fix: Memory Allocation Issue

**Problem**: Previous versions crashed with "Memory allocation failed" when loading configurations with 50+ games.

**Solution**: Implemented streaming JSON parser with chunked processing:
- Processes games in chunks of 10 instead of loading entire file into memory
- Memory usage tracking and limits (10MB max file size)
- Progressive UI updates with cancellation support
- Optimized memory management for large collections

## Usage

1. Open `index.html` in a web browser
2. Select or drag-and-drop a JSON configuration file
3. Click "Apply Configuration" to load games
4. Monitor memory usage and loading progress

## Test Configurations

- `test-configs/small_config.json` - 5 games (working baseline)
- `test-configs/large_config.json` - 75 games (previously crashed)
- `test-configs/extreme_large_config.json` - 150 games (stress test)

## Configuration Format

```json
{
  "name": "My Arcade Collection",
  "description": "Collection description",
  "version": "1.0",
  "games": [
    {
      "id": "game_1",
      "name": "Game Name",
      "genre": "Arcade",
      "year": 1980,
      "players": 1,
      "description": "Game description",
      "controls": ["joystick", "button1"],
      "screenshot": "/path/to/screenshot.jpg",
      "rom": "/path/to/rom.zip"
    }
  ]
}
```

## Technical Details

- **Memory Management**: Chunked processing prevents loading entire configurations into memory
- **File Size Limits**: 10MB maximum file size with validation
- **Progress Tracking**: Real-time progress updates and memory monitoring  
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Browser Compatibility**: Modern browsers with FileReader API support

## Memory Statistics

The application tracks and displays:
- Current memory usage
- Peak memory during loading
- Processing operations count
- Memory checkpoints for debugging
