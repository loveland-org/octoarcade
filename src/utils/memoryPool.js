/**
 * Memory Pool Allocator for Game Configuration Loading
 * 
 * This module implements a memory pool allocator to efficiently manage
 * memory for loading arcade cabinet configurations, preventing crashes
 * when loading large configurations.
 */

class MemoryPool {
  /**
   * Creates a new memory pool with the specified configuration
   * @param {Object} options - Pool configuration options
   * @param {number} options.poolSize - Maximum pool size in bytes (default: 50MB)
   * @param {number} options.blockSize - Size of each memory block (default: 1KB)
   * @param {number} options.maxConfigurations - Maximum number of configurations to hold (default: 100)
   */
  constructor(options = {}) {
    this.poolSize = options.poolSize || 50 * 1024 * 1024; // 50MB default
    this.blockSize = options.blockSize || 1024; // 1KB blocks
    this.maxConfigurations = options.maxConfigurations || 100;
    
    this.allocatedMemory = 0;
    this.configurations = new Map();
    this.allocationHistory = [];
    this.lastCleanup = Date.now();
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
  }

  /**
   * Estimates the memory size of a configuration object
   * @param {Object} config - The configuration object
   * @returns {number} Estimated size in bytes
   */
  estimateSize(config) {
    const jsonString = JSON.stringify(config);
    // Approximate memory size: 2 bytes per character (UTF-16) plus overhead
    return jsonString.length * 2 + 64;
  }

  /**
   * Checks if there's enough memory to allocate a new configuration
   * @param {number} requiredSize - Size required in bytes
   * @returns {boolean} True if allocation is possible
   */
  canAllocate(requiredSize) {
    return (this.allocatedMemory + requiredSize) <= this.poolSize &&
           this.configurations.size < this.maxConfigurations;
  }

  /**
   * Allocates memory for a configuration
   * @param {string} configId - Unique identifier for the configuration
   * @param {Object} config - The configuration object
   * @returns {Object} Allocation result with success status and details
   */
  allocate(configId, config) {
    this.maybeCleanup();

    const size = this.estimateSize(config);

    // Check if configuration already exists
    if (this.configurations.has(configId)) {
      const existing = this.configurations.get(configId);
      this.allocatedMemory -= existing.size;
      this.configurations.delete(configId);
    }

    // Try to allocate
    if (!this.canAllocate(size)) {
      // Attempt to free older configurations to make room
      const freed = this.freeOldest(size);
      if (!freed) {
        return {
          success: false,
          error: 'POOL_EXHAUSTED',
          message: `Cannot allocate ${size} bytes. Pool size: ${this.poolSize}, allocated: ${this.allocatedMemory}`,
          requiredSize: size,
          availableSize: this.poolSize - this.allocatedMemory
        };
      }
    }

    // Perform allocation
    this.configurations.set(configId, {
      config,
      size,
      allocatedAt: Date.now(),
      lastAccessed: Date.now()
    });
    this.allocatedMemory += size;
    this.allocationHistory.push({ configId, size, timestamp: Date.now() });

    return {
      success: true,
      configId,
      allocatedSize: size,
      totalAllocated: this.allocatedMemory,
      poolRemaining: this.poolSize - this.allocatedMemory
    };
  }

  /**
   * Retrieves a configuration from the pool
   * @param {string} configId - Configuration identifier
   * @returns {Object|null} The configuration or null if not found
   */
  get(configId) {
    const entry = this.configurations.get(configId);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.config;
    }
    return null;
  }

  /**
   * Frees a specific configuration from the pool
   * @param {string} configId - Configuration identifier
   * @returns {boolean} True if successfully freed
   */
  free(configId) {
    const entry = this.configurations.get(configId);
    if (entry) {
      this.allocatedMemory -= entry.size;
      this.configurations.delete(configId);
      return true;
    }
    return false;
  }

  /**
   * Frees oldest configurations until enough space is available
   * @param {number} requiredSize - Size needed in bytes
   * @returns {boolean} True if enough space was freed
   */
  freeOldest(requiredSize) {
    // Sort configurations by last accessed time
    const sorted = Array.from(this.configurations.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    let freedSpace = 0;
    const toFree = [];

    for (const [id, entry] of sorted) {
      if (this.canAllocate(requiredSize)) {
        break;
      }
      toFree.push(id);
      freedSpace += entry.size;
    }

    // Free the selected configurations
    for (const id of toFree) {
      this.free(id);
    }

    return this.canAllocate(requiredSize);
  }

  /**
   * Performs cleanup if enough time has passed since last cleanup
   */
  maybeCleanup() {
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
    }
  }

  /**
   * Cleans up stale configurations (not accessed in the last hour)
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   */
  cleanup(maxAge = 3600000) {
    const now = Date.now();
    const toRemove = [];

    for (const [id, entry] of this.configurations) {
      if (now - entry.lastAccessed > maxAge) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.free(id);
    }

    this.lastCleanup = now;
    
    // Trim allocation history
    this.allocationHistory = this.allocationHistory.filter(
      entry => now - entry.timestamp < maxAge
    );
  }

  /**
   * Gets pool statistics
   * @returns {Object} Pool statistics
   */
  getStats() {
    return {
      poolSize: this.poolSize,
      allocatedMemory: this.allocatedMemory,
      availableMemory: this.poolSize - this.allocatedMemory,
      utilizationPercent: (this.allocatedMemory / this.poolSize) * 100,
      configurationCount: this.configurations.size,
      maxConfigurations: this.maxConfigurations
    };
  }

  /**
   * Resets the memory pool, freeing all allocations
   */
  reset() {
    this.configurations.clear();
    this.allocatedMemory = 0;
    this.allocationHistory = [];
    this.lastCleanup = Date.now();
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryPool };
}
