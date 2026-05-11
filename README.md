# OctoArcade

A gaming arcade platform with comprehensive load testing capabilities for performance analysis and bottleneck identification.

## Features

- **Search API**: Fast search across games and players
- **Dashboard API**: Real-time statistics and leaderboards  
- **Load Testing Suite**: Comprehensive performance testing tools
- **Performance Monitoring**: Built-in metrics collection

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Run load tests:**
   ```bash
   npm run loadtest
   ```

## API Endpoints

- `GET /health` - Health check
- `GET /api/search` - Search games and players
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/games` - Games list
- `GET /api/players` - Players list

## Load Testing

This repository includes comprehensive load testing capabilities targeting high concurrency scenarios. See [LOAD_TESTING.md](LOAD_TESTING.md) for detailed documentation.

### Quick Load Test Commands

```bash
# Test search endpoints
npm run loadtest:search

# Test dashboard endpoints  
npm run loadtest:dashboard

# Run comprehensive test suite
./scripts/run-load-tests.sh --start-server
```

## Performance Metrics

The load testing suite collects key performance metrics:
- Response times (p50, p95, p99)
- Request rates and throughput
- Error rates and success ratios
- System resource utilization

## Project Structure

```
octoarcade/
├── src/
│   └── server.js              # Main Express server
├── tests/
│   └── load/                  # Load testing configurations
│       ├── search-test.yml    # Search endpoint tests
│       ├── dashboard-test.yml # Dashboard endpoint tests
│       ├── combined-test.yml  # Combined stress tests
│       └── processor.js       # Test data generators
├── scripts/
│   └── run-load-tests.sh     # Load testing script
├── package.json              # Dependencies and scripts
├── LOAD_TESTING.md          # Detailed load testing guide
└── README.md                # This file
```

## Development

```bash
# Development mode with auto-reload
npm run dev

# Run specific load test
artillery run tests/load/search-test.yml

# Generate HTML report
artillery report results.json --output report.html
```

## License

MIT
