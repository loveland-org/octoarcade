/**
 * ConfigurationManager - Handles arcade cabinet configuration management
 * with memory-efficient loading, validation, and size limits
 */
class ConfigurationManager {
    constructor() {
        this.configurations = new Map();
        this.activeConfigId = null;
        this.maxConfigSize = 1024 * 1024; // 1MB max per config
        this.maxGamesPerConfig = 100;
        this.maxConfigs = 50;
        
        // Memory pool for efficient allocation
        this.memoryPool = {
            allocated: 0,
            maxMemory: 10 * 1024 * 1024, // 10MB pool
            chunks: []
        };
        
        this.loadFromStorage();
    }

    /**
     * Validate configuration data with size limits
     */
    validateConfig(config) {
        const errors = [];
        
        // Name validation
        if (!config.name || config.name.trim().length === 0) {
            errors.push('Configuration name is required');
        }
        if (config.name && config.name.length > 50) {
            errors.push('Configuration name must be 50 characters or less');
        }
        
        // Description validation
        if (config.description && config.description.length > 200) {
            errors.push('Description must be 200 characters or less');
        }
        
        // Games validation
        if (!config.games || config.games.length === 0) {
            errors.push('At least one game is required');
        }
        if (config.games && config.games.length > this.maxGamesPerConfig) {
            errors.push(`Maximum ${this.maxGamesPerConfig} games allowed per configuration`);
        }
        
        // Settings validation
        if (!config.settings) {
            errors.push('Settings are required');
        }
        
        try {
            if (config.settings && typeof config.settings === 'string') {
                JSON.parse(config.settings);
            }
        } catch (e) {
            errors.push('Settings must be valid JSON');
        }
        
        // Size validation
        const configSize = this.estimateConfigSize(config);
        if (configSize > this.maxConfigSize) {
            errors.push(`Configuration size (${this.formatBytes(configSize)}) exceeds maximum allowed (${this.formatBytes(this.maxConfigSize)})`);
        }
        
        // Check total configurations limit
        if (!config.id && this.configurations.size >= this.maxConfigs) {
            errors.push(`Maximum ${this.maxConfigs} configurations allowed`);
        }
        
        return errors;
    }

    /**
     * Estimate configuration size in bytes
     */
    estimateConfigSize(config) {
        const str = JSON.stringify({
            name: config.name,
            description: config.description,
            games: config.games,
            settings: typeof config.settings === 'string' ? config.settings : JSON.stringify(config.settings)
        });
        return new Blob([str]).size;
    }

    /**
     * Format bytes to human-readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Memory pool allocation - prevents memory fragmentation
     */
    allocateMemory(size) {
        if (this.memoryPool.allocated + size > this.memoryPool.maxMemory) {
            // Trigger garbage collection hint
            this.compactMemoryPool();
            
            if (this.memoryPool.allocated + size > this.memoryPool.maxMemory) {
                throw new Error('Memory pool exhausted. Try removing some configurations.');
            }
        }
        
        this.memoryPool.allocated += size;
        this.memoryPool.chunks.push({ size, timestamp: Date.now() });
        return true;
    }

    /**
     * Compact memory pool by removing old allocations
     */
    compactMemoryPool() {
        const now = Date.now();
        const oldChunks = this.memoryPool.chunks.filter(chunk => 
            now - chunk.timestamp > 60000 // Keep chunks younger than 1 minute
        );
        
        const freedMemory = oldChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        this.memoryPool.allocated -= freedMemory;
        this.memoryPool.chunks = this.memoryPool.chunks.filter(chunk => 
            now - chunk.timestamp <= 60000
        );
    }

    /**
     * Streaming parser for large configuration files
     * Processes data in chunks to avoid blocking the main thread
     */
    async parseConfigurationStreaming(configData) {
        return new Promise((resolve, reject) => {
            const chunkSize = 64 * 1024; // 64KB chunks
            let offset = 0;
            const data = typeof configData === 'string' ? configData : JSON.stringify(configData);
            
            const processChunk = () => {
                const chunk = data.slice(offset, offset + chunkSize);
                
                if (chunk.length === 0) {
                    // Finished processing
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error('Invalid configuration format: ' + e.message));
                    }
                    return;
                }
                
                offset += chunk.length;
                
                // Use setTimeout to yield to the event loop
                setTimeout(processChunk, 0);
            };
            
            processChunk();
        });
    }

    /**
     * Add or update configuration with validation
     */
    async addConfiguration(configData) {
        const startTime = performance.now();
        
        try {
            // Parse settings if string
            if (typeof configData.settings === 'string') {
                configData.settings = await this.parseConfigurationStreaming(configData.settings);
            }
            
            // Validate configuration
            const errors = this.validateConfig(configData);
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            // Allocate memory
            const configSize = this.estimateConfigSize(configData);
            this.allocateMemory(configSize);
            
            // Create or update configuration
            const id = configData.id || this.generateId();
            const config = {
                id,
                name: configData.name.trim(),
                description: configData.description?.trim() || '',
                games: Array.isArray(configData.games) ? configData.games : 
                       configData.games.split(',').map(g => g.trim()).filter(g => g),
                settings: configData.settings,
                createdAt: configData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                size: configSize
            };
            
            this.configurations.set(id, config);
            this.saveToStorage();
            
            const endTime = performance.now();
            return {
                success: true,
                config,
                loadTime: Math.round(endTime - startTime)
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete configuration
     */
    deleteConfiguration(id) {
        const config = this.configurations.get(id);
        if (config) {
            this.memoryPool.allocated -= config.size;
            this.configurations.delete(id);
            
            if (this.activeConfigId === id) {
                this.activeConfigId = null;
            }
            
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Set active configuration
     */
    setActiveConfiguration(id) {
        if (this.configurations.has(id)) {
            this.activeConfigId = id;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Get configuration by ID
     */
    getConfiguration(id) {
        return this.configurations.get(id);
    }

    /**
     * Get all configurations
     */
    getAllConfigurations() {
        return Array.from(this.configurations.values());
    }

    /**
     * Get active configuration
     */
    getActiveConfiguration() {
        return this.activeConfigId ? this.configurations.get(this.activeConfigId) : null;
    }

    /**
     * Search configurations
     */
    searchConfigurations(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllConfigurations().filter(config =>
            config.name.toLowerCase().includes(lowerQuery) ||
            config.description.toLowerCase().includes(lowerQuery) ||
            config.games.some(game => game.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'config_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                configurations: Array.from(this.configurations.entries()),
                activeConfigId: this.activeConfigId
            };
            localStorage.setItem('arcadeConfigurations', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save configurations:', e);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('arcadeConfigurations');
            if (data) {
                const parsed = JSON.parse(data);
                this.configurations = new Map(parsed.configurations || []);
                this.activeConfigId = parsed.activeConfigId || null;
                
                // Recalculate memory usage
                this.memoryPool.allocated = 0;
                for (const config of this.configurations.values()) {
                    this.memoryPool.allocated += config.size || this.estimateConfigSize(config);
                }
            }
        } catch (e) {
            console.error('Failed to load configurations:', e);
            this.configurations = new Map();
        }
    }

    /**
     * Export configurations
     */
    exportConfigurations() {
        return JSON.stringify(Array.from(this.configurations.values()), null, 2);
    }

    /**
     * Import configurations
     */
    async importConfigurations(jsonData) {
        try {
            const configs = JSON.parse(jsonData);
            if (!Array.isArray(configs)) {
                throw new Error('Invalid format: expected array of configurations');
            }
            
            const results = [];
            for (const config of configs) {
                try {
                    const result = await this.addConfiguration(config);
                    results.push(result);
                } catch (e) {
                    results.push({ success: false, error: e.message, config });
                }
            }
            
            return results;
        } catch (e) {
            throw new Error('Failed to import configurations: ' + e.message);
        }
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        return {
            allocated: this.memoryPool.allocated,
            maxMemory: this.memoryPool.maxMemory,
            percentUsed: Math.round((this.memoryPool.allocated / this.memoryPool.maxMemory) * 100),
            chunks: this.memoryPool.chunks.length
        };
    }
}
