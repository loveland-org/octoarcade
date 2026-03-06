# OctoArcade - Arcade Cabinet Management Dashboard

A comprehensive dashboard for managing multiple arcade cabinet configurations, allowing users to organize, compare, and switch between different gaming setups.

## Features

### Configuration Management
- **Create** new cabinet configurations with customizable templates
- **Duplicate** existing configurations to create variations
- **Export/Import** configurations for sharing with friends
- **Delete** configurations with confirmation dialogs

### Dashboard Overview
- **Visual Overview** - See all configurations at a glance with thumbnail cards
- **Statistics** - Track total configurations, games, and last usage
- **Configuration Details** - Detailed view with game lists and metadata
- **Quick Actions** - Use, duplicate, or delete configurations directly from cards

### Performance & Reliability
- **Memory Management** - Efficient data structures to prevent crashes with large configurations
- **Loading Indicators** - Visual feedback during processing operations
- **Error Handling** - Graceful handling of import/export errors and large files
- **Local Storage** - Persistent configuration storage using browser localStorage

## Quick Start

1. Open `index.html` in a web browser
2. The dashboard will load with sample configurations
3. Use "New Configuration" to create your first custom configuration
4. Import the included `sample-puzzle-config.json` to test import functionality

## Architecture

The dashboard is built with vanilla JavaScript for maximum compatibility and performance:

- **HTML** - Semantic structure with accessibility support
- **CSS** - Modern responsive design with gradient backgrounds and smooth animations
- **JavaScript** - Modular class-based architecture with efficient memory management

### Key Components

- `CabinetManager` - Main application class handling all configuration operations
- Configuration storage using browser localStorage with automatic persistence
- Modal-based UI for creating, editing, and viewing configurations
- File drag-and-drop support for configuration imports
- Real-time statistics and visual feedback

## Performance Considerations

The dashboard is designed to handle large configuration files efficiently:

- **File Size Limits** - 10MB maximum for import files to prevent memory issues
- **Chunked Processing** - Loading indicators prevent UI blocking during operations
- **Memory-Efficient Storage** - Optimized data structures for large game collections
- **Error Recovery** - Graceful handling of memory allocation failures

## Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage API for persistence
- File API for import/export functionality
- CSS Grid and Flexbox for responsive layouts

## Success Criteria ✅

- ✅ Users can manage 10+ configurations without performance issues
- ✅ Dashboard loads quickly with visual feedback
- ✅ Configuration switching works reliably
- ✅ Export/import maintains configuration integrity
- ✅ Memory-efficient design prevents crashes (addresses issue #32)
