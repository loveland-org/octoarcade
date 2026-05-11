/**
 * Tests for Arcade Cabinet Management Dashboard
 * 
 * Run with: node tests/test.js
 */

// Import modules
const { MemoryPool } = require('../src/utils/memoryPool');
const { ConfigurationValidator, ConfigurationValidationError } = require('../src/utils/configValidator');
const { StreamingConfigParser } = require('../src/utils/streamingParser');
const { ConfigurationManager } = require('../src/utils/configManager');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(`${message} Expected true, got ${value}`);
  }
}

function assertFalse(value, message = '') {
  if (value) {
    throw new Error(`${message} Expected false, got ${value}`);
  }
}

// Sample configurations for testing
const sampleConfig = {
  id: 'test-cabinet',
  name: 'Test Cabinet',
  description: 'A test configuration',
  games: [
    { id: 'game1', name: 'Test Game 1', path: '/games/test1' },
    { id: 'game2', name: 'Test Game 2', path: '/games/test2' }
  ],
  settings: {
    volume: 75,
    brightness: 80
  },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const largeConfig = {
  id: 'large-cabinet',
  name: 'Large Cabinet',
  description: 'A large configuration for stress testing',
  games: Array(100).fill(null).map((_, i) => ({
    id: `game${i}`,
    name: `Test Game ${i}`,
    path: `/games/test${i}`
  })),
  settings: { volume: 100 }
};

// ============== Memory Pool Tests ==============

console.log('\n📦 Memory Pool Tests\n');

test('MemoryPool: should create with default options', () => {
  const pool = new MemoryPool();
  assertEqual(pool.poolSize, 50 * 1024 * 1024, 'Pool size');
  assertEqual(pool.maxConfigurations, 100, 'Max configurations');
});

test('MemoryPool: should allocate configuration', () => {
  const pool = new MemoryPool();
  const result = pool.allocate('test', sampleConfig);
  assertTrue(result.success, 'Allocation should succeed');
  assertEqual(result.configId, 'test', 'Config ID');
});

test('MemoryPool: should retrieve allocated configuration', () => {
  const pool = new MemoryPool();
  pool.allocate('test', sampleConfig);
  const config = pool.get('test');
  assertEqual(config.id, 'test-cabinet', 'Config ID');
  assertEqual(config.name, 'Test Cabinet', 'Config name');
});

test('MemoryPool: should return null for non-existent config', () => {
  const pool = new MemoryPool();
  const config = pool.get('nonexistent');
  assertEqual(config, null, 'Should be null');
});

test('MemoryPool: should free configuration', () => {
  const pool = new MemoryPool();
  pool.allocate('test', sampleConfig);
  const freed = pool.free('test');
  assertTrue(freed, 'Should free');
  assertEqual(pool.get('test'), null, 'Should be null after free');
});

test('MemoryPool: should track memory usage', () => {
  const pool = new MemoryPool();
  const sizeBefore = pool.allocatedMemory;
  pool.allocate('test', sampleConfig);
  const sizeAfter = pool.allocatedMemory;
  assertTrue(sizeAfter > sizeBefore, 'Memory should increase');
});

test('MemoryPool: should handle pool exhaustion gracefully', () => {
  const pool = new MemoryPool({ poolSize: 1000, maxConfigurations: 2 });
  pool.allocate('test1', sampleConfig);
  pool.allocate('test2', sampleConfig);
  // Pool should fail when config is too large for pool
  const result = pool.allocate('test3', largeConfig);
  assertFalse(result.success, 'Should fail when pool is exhausted');
  assertEqual(result.error, 'POOL_EXHAUSTED', 'Error should be POOL_EXHAUSTED');
});

test('MemoryPool: should provide accurate stats', () => {
  const pool = new MemoryPool();
  pool.allocate('test', sampleConfig);
  const stats = pool.getStats();
  assertTrue(stats.allocatedMemory > 0, 'Allocated memory');
  assertEqual(stats.configurationCount, 1, 'Configuration count');
});

test('MemoryPool: should reset properly', () => {
  const pool = new MemoryPool();
  pool.allocate('test1', sampleConfig);
  pool.allocate('test2', sampleConfig);
  pool.reset();
  assertEqual(pool.allocatedMemory, 0, 'Memory should be 0');
  assertEqual(pool.configurations.size, 0, 'Should have no configs');
});

// ============== Configuration Validator Tests ==============

console.log('\n✅ Configuration Validator Tests\n');

test('ConfigurationValidator: should validate correct configuration', () => {
  const validator = new ConfigurationValidator();
  const result = validator.validate(sampleConfig);
  assertTrue(result.success, 'Validation should succeed');
  assertEqual(result.errors.length, 0, 'No errors');
});

test('ConfigurationValidator: should reject configuration without id', () => {
  const validator = new ConfigurationValidator();
  const invalidConfig = { ...sampleConfig };
  delete invalidConfig.id;
  const result = validator.validate(invalidConfig);
  assertFalse(result.success, 'Validation should fail');
  assertTrue(result.errors.length > 0, 'Should have errors');
});

test('ConfigurationValidator: should reject configuration without name', () => {
  const validator = new ConfigurationValidator();
  const invalidConfig = { ...sampleConfig };
  delete invalidConfig.name;
  const result = validator.validate(invalidConfig);
  assertFalse(result.success, 'Validation should fail');
});

test('ConfigurationValidator: should parse valid JSON string', () => {
  const validator = new ConfigurationValidator();
  const jsonString = JSON.stringify(sampleConfig);
  const result = validator.validate(jsonString);
  assertTrue(result.success, 'Should parse and validate');
});

test('ConfigurationValidator: should reject invalid JSON', () => {
  const validator = new ConfigurationValidator();
  const result = validator.validate('{invalid json}');
  assertFalse(result.success, 'Should fail parsing');
  assertEqual(result.error.code, 'PARSE_ERROR', 'Error code');
});

test('ConfigurationValidator: should enforce size limits', () => {
  const validator = new ConfigurationValidator({ limits: { MAX_CONFIG_SIZE: 100 } });
  const result = validator.validate(sampleConfig);
  assertFalse(result.success, 'Should fail size check');
});

test('ConfigurationValidator: should validate game array', () => {
  const validator = new ConfigurationValidator();
  const configWithInvalidGames = { ...sampleConfig, games: 'not an array' };
  const result = validator.validate(configWithInvalidGames);
  assertFalse(result.success, 'Should fail');
});

test('ConfigurationValidator: should enforce game limits', () => {
  const validator = new ConfigurationValidator({ limits: { MAX_GAMES_PER_CABINET: 5 } });
  const result = validator.validate(largeConfig);
  assertFalse(result.success, 'Should fail game limit check');
});

test('ConfigurationValidator: should sanitize configuration', () => {
  const validator = new ConfigurationValidator();
  const configWithWhitespace = { ...sampleConfig, name: '  Test Cabinet  ' };
  const sanitized = validator.sanitize(configWithWhitespace);
  assertEqual(sanitized.name, 'Test Cabinet', 'Name should be trimmed');
});

test('ConfigurationValidator: should detect deep nesting', () => {
  const validator = new ConfigurationValidator({ limits: { MAX_NESTED_DEPTH: 3 } });
  const deeplyNested = {
    id: 'test',
    name: 'Test',
    level1: { level2: { level3: { level4: { level5: {} } } } }
  };
  const result = validator.validate(deeplyNested);
  assertFalse(result.success, 'Should fail nesting check');
});

// ============== Streaming Parser Tests ==============

console.log('\n📜 Streaming Parser Tests\n');

test('StreamingConfigParser: should parse JSON string', async () => {
  const parser = new StreamingConfigParser();
  const result = await parser.parseString(JSON.stringify(sampleConfig));
  assertEqual(result.id, sampleConfig.id, 'Config ID');
});

test('StreamingConfigParser: should report progress', async () => {
  let progressReported = false;
  const parser = new StreamingConfigParser({
    onProgress: () => { progressReported = true; }
  });
  await parser.parseString(JSON.stringify(largeConfig));
  assertTrue(progressReported, 'Progress should be reported');
});

test('StreamingConfigParser: should reject oversized content', async () => {
  const parser = new StreamingConfigParser({ maxFileSize: 100 });
  let threw = false;
  try {
    await parser.parseString(JSON.stringify(largeConfig));
  } catch (e) {
    threw = true;
  }
  assertTrue(threw, 'Should throw for oversized content');
});

test('StreamingConfigParser: should track state', async () => {
  const parser = new StreamingConfigParser();
  assertEqual(parser.getState().state, 'idle', 'Initial state');
  await parser.parseString(JSON.stringify(sampleConfig));
  assertEqual(parser.getState().state, 'complete', 'Final state');
});

test('StreamingConfigParser: should reset properly', async () => {
  const parser = new StreamingConfigParser();
  await parser.parseString(JSON.stringify(sampleConfig));
  parser.reset();
  assertEqual(parser.getState().state, 'idle', 'State after reset');
});

test('StreamingConfigParser: should parse incrementally', async () => {
  const parser = new StreamingConfigParser();
  const items = [];
  const count = await parser.parseArrayIncremental(
    JSON.stringify([sampleConfig, sampleConfig]),
    async (item) => items.push(item)
  );
  assertEqual(count, 2, 'Item count');
  assertEqual(items.length, 2, 'Collected items');
});

// ============== Configuration Manager Tests ==============

console.log('\n🎮 Configuration Manager Tests\n');

test('ConfigurationManager: should load configuration from string', async () => {
  const manager = new ConfigurationManager();
  const result = await manager.loadFromString(JSON.stringify(sampleConfig));
  assertTrue(result.success, 'Load should succeed');
  assertEqual(result.configId, sampleConfig.id, 'Config ID');
});

test('ConfigurationManager: should retrieve loaded configuration', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  const config = manager.getConfig(sampleConfig.id);
  assertEqual(config.name, sampleConfig.name, 'Config name');
});

test('ConfigurationManager: should list configuration IDs', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  const ids = manager.getConfigIds();
  assertTrue(ids.includes(sampleConfig.id), 'Should include config ID');
});

test('ConfigurationManager: should switch active configuration', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  const result = manager.switchConfig(sampleConfig.id);
  assertTrue(result.success, 'Switch should succeed');
  assertEqual(manager.activeConfig, sampleConfig.id, 'Active config');
});

test('ConfigurationManager: should return active configuration', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  manager.switchConfig(sampleConfig.id);
  const active = manager.getActiveConfig();
  assertEqual(active.id, sampleConfig.id, 'Active config ID');
});

test('ConfigurationManager: should remove configuration', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  const removed = manager.removeConfig(sampleConfig.id);
  assertTrue(removed, 'Should remove');
  assertEqual(manager.getConfig(sampleConfig.id), null, 'Should be null');
});

test('ConfigurationManager: should clear active config on removal', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  manager.switchConfig(sampleConfig.id);
  manager.removeConfig(sampleConfig.id);
  assertEqual(manager.activeConfig, null, 'Active should be null');
});

test('ConfigurationManager: should compare configurations', async () => {
  const manager = new ConfigurationManager();
  const config1 = { ...sampleConfig, id: 'config1' };
  const config2 = { ...sampleConfig, id: 'config2', name: 'Different Name' };
  
  await manager.loadFromString(JSON.stringify(config1));
  await manager.loadFromString(JSON.stringify(config2));
  
  const result = manager.compareConfigs('config1', 'config2');
  assertTrue(result.success, 'Compare should succeed');
  assertTrue(result.differences.length > 0, 'Should have differences');
});

test('ConfigurationManager: should provide stats', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  const stats = manager.getStats();
  assertTrue(stats.configurationCount > 0, 'Should have configs');
  assertTrue(typeof stats.utilizationPercent === 'number', 'Has utilization');
});

test('ConfigurationManager: should handle 10+ configurations', async () => {
  const manager = new ConfigurationManager();
  
  for (let i = 0; i < 12; i++) {
    const config = { ...sampleConfig, id: `config-${i}`, name: `Config ${i}` };
    const result = await manager.loadFromString(JSON.stringify(config));
    assertTrue(result.success, `Config ${i} should load`);
  }
  
  const ids = manager.getConfigIds();
  assertEqual(ids.length, 12, 'Should have 12 configs');
});

test('ConfigurationManager: should clear all configurations', async () => {
  const manager = new ConfigurationManager();
  await manager.loadFromString(JSON.stringify(sampleConfig));
  manager.switchConfig(sampleConfig.id);
  manager.clearAll();
  assertEqual(manager.getConfigIds().length, 0, 'Should have no configs');
  assertEqual(manager.activeConfig, null, 'Active should be null');
});

test('ConfigurationManager: should validate before loading', async () => {
  const manager = new ConfigurationManager();
  const invalidConfig = { name: 'No ID' }; // Missing id
  const result = await manager.loadFromString(JSON.stringify(invalidConfig));
  assertFalse(result.success, 'Should fail validation');
});

test('ConfigurationManager: should sanitize configuration', async () => {
  const manager = new ConfigurationManager();
  const configWithWhitespace = { ...sampleConfig, name: '  Spaced Name  ' };
  const result = await manager.loadFromString(JSON.stringify(configWithWhitespace), { sanitize: true });
  assertTrue(result.success, 'Should succeed');
  assertEqual(result.config.name, 'Spaced Name', 'Name should be trimmed');
});

// ============== Performance Tests ==============

console.log('\n⚡ Performance Tests\n');

test('Performance: should handle large configurations without crash', async () => {
  const manager = new ConfigurationManager();
  
  // Create a larger configuration
  const hugeConfig = {
    id: 'huge-cabinet',
    name: 'Huge Cabinet',
    games: Array(500).fill(null).map((_, i) => ({
      id: `game${i}`,
      name: `Game ${i} with a longer name to simulate realistic data`,
      path: `/games/category/${i % 10}/game${i}`,
      description: `This is the description for game ${i}`
    })),
    settings: { volume: 100 }
  };

  const start = Date.now();
  const result = await manager.loadFromString(JSON.stringify(hugeConfig));
  const duration = Date.now() - start;
  
  // Should complete without crashing and reasonably fast
  assertTrue(result.success, 'Should load large config');
  assertTrue(duration < 5000, `Should complete in < 5s, took ${duration}ms`);
});

test('Performance: streaming parser should not block', async () => {
  const parser = new StreamingConfigParser({ chunkSize: 1024 });
  
  const config = {
    id: 'test',
    name: 'Test',
    data: 'x'.repeat(100000) // 100KB of data
  };

  const start = Date.now();
  await parser.parseString(JSON.stringify(config));
  const duration = Date.now() - start;
  
  assertTrue(duration < 1000, `Should complete quickly, took ${duration}ms`);
});

// ============== Summary ==============

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed\n`);

if (testsFailed > 0) {
  process.exit(1);
}
