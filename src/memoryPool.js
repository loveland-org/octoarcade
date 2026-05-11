/**
 * Memory Pool Allocator for efficient configuration loading
 * Addresses sub-issue: "Implement memory pool allocator for game configuration loading"
 * 
 * This allocator pre-allocates memory pools to avoid frequent allocations/deallocations
 * when loading large configuration files.
 */

class MemoryPool {
    constructor(blockSize = 1024 * 10, maxBlocks = 100) {
        this.blockSize = blockSize; // Size of each memory block (10KB default)
        this.maxBlocks = maxBlocks; // Maximum number of blocks
        this.pools = new Map(); // Active memory pools
        this.freeBlocks = []; // Available blocks for reuse
        this.allocatedBytes = 0;
        this.peakMemory = 0;
    }

    /**
     * Allocate memory for a configuration object
     * @param {string} configId - Unique identifier for the configuration
     * @param {number} estimatedSize - Estimated size in bytes
     * @returns {Object} Memory allocation info
     */
    allocate(configId, estimatedSize) {
        const blocksNeeded = Math.ceil(estimatedSize / this.blockSize);
        
        if (blocksNeeded > this.maxBlocks) {
            throw new Error(`Configuration too large: requires ${blocksNeeded} blocks, max is ${this.maxBlocks}`);
        }

        // Reuse free blocks if available
        let blocks = [];
        while (blocks.length < blocksNeeded && this.freeBlocks.length > 0) {
            blocks.push(this.freeBlocks.pop());
        }

        // Allocate new blocks if needed
        while (blocks.length < blocksNeeded) {
            blocks.push(new ArrayBuffer(this.blockSize));
        }

        const allocation = {
            configId,
            blocks,
            size: estimatedSize,
            timestamp: Date.now()
        };

        this.pools.set(configId, allocation);
        this.allocatedBytes += estimatedSize;
        this.peakMemory = Math.max(this.peakMemory, this.allocatedBytes);

        return allocation;
    }

    /**
     * Free memory allocated for a configuration
     * @param {string} configId - Configuration identifier
     */
    free(configId) {
        const allocation = this.pools.get(configId);
        if (!allocation) {
            return;
        }

        // Return blocks to free pool for reuse
        this.freeBlocks.push(...allocation.blocks);
        this.allocatedBytes -= allocation.size;
        this.pools.delete(configId);
    }

    /**
     * Free all allocations
     */
    clear() {
        this.pools.clear();
        this.freeBlocks = [];
        this.allocatedBytes = 0;
    }

    /**
     * Get memory usage statistics
     * @returns {Object} Memory statistics
     */
    getStats() {
        return {
            allocatedBytes: this.allocatedBytes,
            allocatedKB: (this.allocatedBytes / 1024).toFixed(2),
            allocatedMB: (this.allocatedBytes / (1024 * 1024)).toFixed(2),
            peakMemoryMB: (this.peakMemory / (1024 * 1024)).toFixed(2),
            activeAllocations: this.pools.size,
            freeBlocks: this.freeBlocks.length,
            utilizationPercent: ((this.pools.size / this.maxBlocks) * 100).toFixed(1)
        };
    }
}

// Singleton instance
export const memoryPool = new MemoryPool();
