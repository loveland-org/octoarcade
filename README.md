# OctoArcade

A screenshot management utility for arcade-style applications with automated validation and testing capabilities.

## Features

- 📸 **Screenshot Validation**: Validates screenshot filenames against expected naming conventions
- 🔧 **Automated Testing**: Comprehensive test suite with high code coverage
- 📊 **Statistics**: Provides detailed statistics about screenshot collections
- 🎮 **CLI Tool**: Command-line interface for validation and reporting
- ⚡ **Fast & Reliable**: Built with Node.js for performance and reliability

## Screenshot Naming Conventions

This tool validates two types of screenshot formats:

### Keyframe Screenshots
Format: `TIMESTAMP-screenshot_keyframe_N_TIMEs.png`
- Example: `1758538266417-screenshot_keyframe_6_14.500s.png`

### Issue Screenshots  
Format: `screenshot-YYYY-MM-DDTHH-MM-SS-sssZ-N.png`
- Example: `screenshot-2025-09-18T16-27-05-539Z-1.png`

## Installation

```bash
npm install
```

## Usage

### CLI Validation Tool

Run the validation tool to check all screenshots:

```bash
node cli.js
```

This will validate all files in the `screenshots/` and `issue-screenshots/` directories and provide a detailed report.

### Programmatic Usage

```javascript
const { OctoArcade, ScreenshotManager } = require('./src/index');

// Initialize OctoArcade
const arcade = new OctoArcade();

// Validate all screenshots
const results = await arcade.validate();
console.log('Valid:', results.valid);

// Or use ScreenshotManager directly
const manager = new ScreenshotManager();
const isValid = manager.validateScreenshotFilename('1758538266417-screenshot_keyframe_6_14.500s.png');
```

## Testing

Run the test suite:

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

Current test coverage: **92%** with 19 passing tests.

## Project Structure

```
octoarcade/
├── src/
│   ├── ScreenshotManager.js   # Core screenshot validation logic
│   └── index.js              # Main OctoArcade class
├── test/
│   ├── ScreenshotManager.test.js  # Unit tests
│   └── index.test.js             # Integration tests
├── screenshots/              # Keyframe screenshots
├── issue-screenshots/        # Issue-related screenshots
├── cli.js                   # Command-line interface
└── package.json            # Project configuration
```

## Bug Fixes

This version addresses several potential issues:

- ✅ **Filename Validation**: Strict validation of screenshot naming conventions
- ✅ **Error Handling**: Graceful handling of filesystem errors
- ✅ **Directory Management**: Automatic directory creation and validation
- ✅ **Type Safety**: Proper input validation and type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## License

MIT
