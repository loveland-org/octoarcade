# OctoArcade Load Testing Guide

This repository includes comprehensive load testing capabilities for the OctoArcade gaming platform, specifically targeting the search and dashboard endpoints.

## Overview

The load testing suite is designed to simulate high concurrency scenarios and collect performance metrics to identify bottlenecks in:

- **Search Endpoint** (`/api/search`) - Handles game and player searches
- **Dashboard Endpoint** (`/api/dashboard`) - Provides aggregated statistics and leaderboards

## Prerequisites

- Node.js (v14 or higher)
- npm
- Artillery.js (installed via npm)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Run load tests (in another terminal):**
   ```bash
   npm run loadtest
   ```

## Load Test Scenarios

### 1. Search Endpoint Tests (`tests/load/search-test.yml`)

Tests various search scenarios with increasing load:
- **Warm up**: 5 requests/second for 30 seconds
- **Ramp up**: 10-50 requests/second for 60 seconds  
- **Sustained load**: 50 requests/second for 120 seconds
- **Peak load**: 100 requests/second for 60 seconds
- **Cool down**: 10 requests/second for 30 seconds

**Scenarios tested:**
- Game searches by name (30% weight)
- Player searches (20% weight)
- General content searches (25% weight)
- Parameterized searches (15% weight)
- Error handling with invalid queries (10% weight)

### 2. Dashboard Endpoint Tests (`tests/load/dashboard-test.yml`)

Tests dashboard performance under load:
- **Warm up**: 3 requests/second for 30 seconds
- **Ramp up**: 5-30 requests/second for 60 seconds
- **Sustained load**: 30 requests/second for 120 seconds
- **Peak load**: 60 requests/second for 60 seconds
- **Cool down**: 5 requests/second for 30 seconds

**Scenarios tested:**
- Dashboard main view (50% weight)
- Dashboard + games list (20% weight)
- Dashboard + players list (15% weight)
- Dashboard + filtered games (10% weight)
- Multiple dashboard refreshes (5% weight)

### 3. Combined Stress Test (`tests/load/combined-test.yml`)

Comprehensive test simulating real user behavior:
- **Light load**: 5 requests/second for 30 seconds
- **Medium load**: 15-40 requests/second for 60 seconds
- **Heavy load**: 40-80 requests/second for 90 seconds
- **Peak load**: 80-150 requests/second for 60 seconds
- **Sustained peak**: 150 requests/second for 120 seconds
- **Cool down**: 10 requests/second for 45 seconds

## Running Tests

### Individual Tests

```bash
# Search endpoint only
npm run loadtest:search

# Dashboard endpoint only
npm run loadtest:dashboard

# All tests
npm run loadtest
```

### Using the Comprehensive Script

The included script provides additional features:

```bash
# Basic usage
./scripts/run-load-tests.sh

# Start server automatically
./scripts/run-load-tests.sh --start-server

# Custom server URL
./scripts/run-load-tests.sh --server-url http://localhost:8080

# Custom output directory
./scripts/run-load-tests.sh --output-dir ./my-results
```

## Understanding Results

### Key Metrics

Artillery provides several important metrics:

- **Response Times**: p50, p95, p99 percentiles
- **Request Rate**: Requests per second
- **Error Rate**: Failed requests percentage
- **Throughput**: Data transferred per second

### Performance Thresholds

**Good Performance:**
- p95 response time < 200ms
- p99 response time < 500ms
- Error rate < 1%
- Consistent throughput

**Performance Issues:**
- p95 response time > 500ms
- p99 response time > 1000ms
- Error rate > 5%
- Declining throughput under load

### Result Files

Results are saved in `load-test-results/` with timestamps:
- `*.json` - Raw Artillery results
- `*.html` - HTML reports (when generated)
- `system_monitor_*.log` - System performance metrics

## API Endpoints

### Search Endpoint: `/api/search`

**Parameters:**
- `q` (required) - Search query string
- `type` (optional) - Filter by 'games' or 'players'
- `limit` (optional) - Number of results (default: 10)

**Example:**
```bash
curl "http://localhost:3000/api/search?q=pac&type=games&limit=5"
```

### Dashboard Endpoint: `/api/dashboard`

Returns aggregated statistics including:
- Total games and players
- Average scores
- Top games by player count
- Leaderboard (top 5 players)
- Recent activity

**Example:**
```bash
curl "http://localhost:3000/api/dashboard"
```

### Additional Endpoints

- `/health` - Health check
- `/api/games` - Games list with optional genre filtering
- `/api/players` - Players list

## Performance Optimization Tips

Based on load test results, consider these optimizations:

1. **Caching**: Implement Redis caching for dashboard data
2. **Database Indexing**: Add indexes on frequently searched fields
3. **Response Compression**: Enable gzip compression
4. **Connection Pooling**: Optimize database connections
5. **Rate Limiting**: Implement API rate limiting

## Monitoring Production

For production monitoring, consider:

1. **Application Performance Monitoring (APM)** tools
2. **Real User Monitoring (RUM)**
3. **Synthetic monitoring** with simplified versions of these tests
4. **Alert thresholds** based on your load test results

## Troubleshooting

### Common Issues

**Connection Errors:**
- Ensure server is running on correct port
- Check firewall settings
- Verify server URL in test configurations

**High Error Rates:**
- Check server logs for errors
- Verify database connections
- Monitor system resources (CPU, memory)

**Inconsistent Results:**
- Run tests multiple times
- Check for background processes
- Ensure consistent test environment

### Server Logs

Check `server.log` for detailed server-side information during load tests.

## Extending Tests

To add new test scenarios:

1. Create new `.yml` file in `tests/load/`
2. Define test phases and scenarios
3. Add to npm scripts in `package.json`
4. Update this documentation

## Contributing

When adding new endpoints or modifying existing ones:

1. Update corresponding load test scenarios
2. Adjust performance thresholds as needed
3. Test locally before deploying
4. Update documentation

## License

MIT License - see LICENSE file for details.