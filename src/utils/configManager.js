/**
 * Configuration Manager
 * 
 * Central manager for arcade cabinet configurations that integrates:
 * - Memory pool allocation
 * - Configuration validation
 * - Streaming parsing for large files
 */

// Import utilities (works in both browser and Node.js)
let MemoryPool_Local, ConfigurationValidator_Local, StreamingConfigParser_Local;
if (typeof require !== 'undefined') {
  ({ MemoryPool: MemoryPool_Local } = require('./memoryPool'));
  ({ ConfigurationValidator: ConfigurationValidator_Local } = require('./configValidator'));
  ({ StreamingConfigParser: StreamingConfigParser_Local } = require('./streamingParser'));
} else {
  // In browser, these are available as globals
  MemoryPool_Local = MemoryPool;
  ConfigurationValidator_Local = ConfigurationValidator;
  StreamingConfigParser_Local = StreamingConfigParser;
}

/**
 * Configuration Manager class
 */
class ConfigurationManager {
  /**
   * Creates a new configuration manager
   * @param {Object} options - Manager options
   * @param {Object} options.memoryPool - Memory pool options
   * @param {Object} options.validator - Validator options
   * @param {Object} options.parser - Parser options
   * @param {Function} options.onConfigLoaded - Callback when a config is loaded
   * @param {Function} options.onConfigRemoved - Callback when a config is removed
   * @param {Function} options.onError - Error callback
   */
  constructor(options = {}) {
    this.memoryPool = new MemoryPool_Local(options.memoryPool || {});
    this.validator = new ConfigurationValidator_Local(options.validator || {});
    this.parserOptions = options.parser || {};
    
    this.onConfigLoaded = options.onConfigLoaded || (() => {});
    this.onConfigRemoved = options.onConfigRemoved || (() => {});
    this.onError = options.onError || console.error;
    
    this.activeConfig = null;
    this.loadingState = {
      isLoading: false,
      progress: 0,
      currentConfigId: null
    };
  }

  /**
   * Loads a configuration from a JSON string
   * @param {string} configString - JSON configuration string
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Load result
   */
  async loadFromString(configString, options = {}) {
    const parser = new StreamingConfigParser_Local({
      ...this.parserOptions,
      onProgress: (progress) => {
        this.loadingState.progress = progress;
        if (options.onProgress) options.onProgress(progress);
      }
    });

    this.loadingState.isLoading = true;
    this.loadingState.progress = 0;

    try {
      // Parse with streaming
      const config = await parser.parseString(configString);
      return await this.processLoadedConfig(config, options);
    } catch (e) {
      this.loadingState.isLoading = false;
      this.onError(e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Loads a configuration from a File object
   * @param {File} file - Configuration file
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Load result
   */
  async loadFromFile(file, options = {}) {
    const parser = new StreamingConfigParser_Local({
      ...this.parserOptions,
      onProgress: (progress) => {
        this.loadingState.progress = progress;
        if (options.onProgress) options.onProgress(progress);
      }
    });

    this.loadingState.isLoading = true;
    this.loadingState.progress = 0;

    try {
      // Parse with streaming
      const config = await parser.parseFile(file);
      return await this.processLoadedConfig(config, options);
    } catch (e) {
      this.loadingState.isLoading = false;
      this.onError(e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Loads a configuration from a URL
   * @param {string} url - Configuration URL
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Load result
   */
  async loadFromUrl(url, options = {}) {
    const parser = new StreamingConfigParser_Local({
      ...this.parserOptions,
      onProgress: (progress) => {
        this.loadingState.progress = progress;
        if (options.onProgress) options.onProgress(progress);
      }
    });

    this.loadingState.isLoading = true;
    this.loadingState.progress = 0;

    try {
      // Parse with streaming
      const config = await parser.parseFromUrl(url);
      return await this.processLoadedConfig(config, options);
    } catch (e) {
      this.loadingState.isLoading = false;
      this.onError(e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Processes a loaded configuration (validation, memory allocation)
   * @param {Object} config - Parsed configuration
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processLoadedConfig(config, options = {}) {
    try {
      // Validate configuration
      const validationResult = this.validator.validate(config);
      
      if (!validationResult.success) {
        this.loadingState.isLoading = false;
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validationResult.errors
        };
      }

      // Sanitize if requested
      const processedConfig = options.sanitize 
        ? this.validator.sanitize(validationResult.config)
        : validationResult.config;

      // Allocate in memory pool
      const configId = processedConfig.id || `config_${Date.now()}`;
      const allocationResult = this.memoryPool.allocate(configId, processedConfig);

      if (!allocationResult.success) {
        this.loadingState.isLoading = false;
        return {
          success: false,
          error: 'Memory allocation failed',
          allocationError: allocationResult
        };
      }

      this.loadingState.isLoading = false;
      this.loadingState.currentConfigId = configId;
      
      this.onConfigLoaded(configId, processedConfig);

      return {
        success: true,
        configId,
        config: processedConfig,
        warnings: validationResult.warnings,
        allocation: allocationResult
      };
    } catch (e) {
      this.loadingState.isLoading = false;
      this.onError(e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Gets a configuration by ID
   * @param {string} configId - Configuration ID
   * @returns {Object|null} Configuration or null
   */
  getConfig(configId) {
    return this.memoryPool.get(configId);
  }

  /**
   * Gets all loaded configuration IDs
   * @returns {string[]} Array of configuration IDs
   */
  getConfigIds() {
    return Array.from(this.memoryPool.configurations.keys());
  }

  /**
   * Gets all loaded configurations
   * @returns {Object[]} Array of configurations with metadata
   */
  getAllConfigs() {
    return Array.from(this.memoryPool.configurations.entries()).map(([id, entry]) => ({
      id,
      config: entry.config,
      size: entry.size,
      allocatedAt: entry.allocatedAt,
      lastAccessed: entry.lastAccessed
    }));
  }

  /**
   * Switches the active configuration
   * @param {string} configId - Configuration ID to activate
   * @returns {Object} Switch result
   */
  switchConfig(configId) {
    const config = this.memoryPool.get(configId);
    
    if (!config) {
      return {
        success: false,
        error: `Configuration ${configId} not found`
      };
    }

    this.activeConfig = configId;
    return {
      success: true,
      configId,
      config
    };
  }

  /**
   * Gets the active configuration
   * @returns {Object|null} Active configuration or null
   */
  getActiveConfig() {
    if (!this.activeConfig) return null;
    return this.memoryPool.get(this.activeConfig);
  }

  /**
   * Removes a configuration
   * @param {string} configId - Configuration ID to remove
   * @returns {boolean} True if removed
   */
  removeConfig(configId) {
    const removed = this.memoryPool.free(configId);
    if (removed) {
      if (this.activeConfig === configId) {
        this.activeConfig = null;
      }
      this.onConfigRemoved(configId);
    }
    return removed;
  }

  /**
   * Compares two configurations
   * @param {string} configId1 - First configuration ID
   * @param {string} configId2 - Second configuration ID
   * @returns {Object} Comparison result
   */
  compareConfigs(configId1, configId2) {
    const config1 = this.memoryPool.get(configId1);
    const config2 = this.memoryPool.get(configId2);

    if (!config1 || !config2) {
      return {
        success: false,
        error: 'One or both configurations not found'
      };
    }

    const differences = this.findDifferences(config1, config2);
    const similarities = this.findSimilarities(config1, config2);

    return {
      success: true,
      differences,
      similarities,
      config1Id: configId1,
      config2Id: configId2
    };
  }

  /**
   * Finds differences between two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @param {string} path - Current path
   * @returns {Object[]} Array of differences
   */
  findDifferences(obj1, obj2, path = '') {
    const differences = [];
    const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (typeof val1 !== typeof val2) {
        differences.push({
          path: currentPath,
          type: 'type_change',
          value1: val1,
          value2: val2
        });
      } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
        if (Array.isArray(val1) !== Array.isArray(val2)) {
          differences.push({
            path: currentPath,
            type: 'type_change',
            value1: val1,
            value2: val2
          });
        } else {
          differences.push(...this.findDifferences(val1, val2, currentPath));
        }
      } else if (val1 !== val2) {
        differences.push({
          path: currentPath,
          type: val1 === undefined ? 'added' : val2 === undefined ? 'removed' : 'changed',
          value1: val1,
          value2: val2
        });
      }
    }

    return differences;
  }

  /**
   * Finds similarities between two configurations
   * @param {Object} config1 - First configuration
   * @param {Object} config2 - Second configuration
   * @returns {Object} Similarities
   */
  findSimilarities(config1, config2) {
    const similarities = {
      sameGameCount: (config1.games?.length || 0) === (config2.games?.length || 0),
      sharedGames: [],
      sameSettings: {}
    };

    // Find shared games
    if (config1.games && config2.games) {
      const games1Ids = new Set(config1.games.map(g => g.id));
      similarities.sharedGames = config2.games
        .filter(g => games1Ids.has(g.id))
        .map(g => g.id);
    }

    // Find same settings
    if (config1.settings && config2.settings) {
      for (const key of Object.keys(config1.settings)) {
        if (JSON.stringify(config1.settings[key]) === JSON.stringify(config2.settings[key])) {
          similarities.sameSettings[key] = config1.settings[key];
        }
      }
    }

    return similarities;
  }

  /**
   * Gets memory pool statistics
   * @returns {Object} Pool statistics
   */
  getStats() {
    return {
      ...this.memoryPool.getStats(),
      activeConfig: this.activeConfig,
      loadingState: { ...this.loadingState }
    };
  }

  /**
   * Clears all configurations
   */
  clearAll() {
    this.memoryPool.reset();
    this.activeConfig = null;
    this.loadingState = {
      isLoading: false,
      progress: 0,
      currentConfigId: null
    };
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfigurationManager };
}
