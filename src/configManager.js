/**
 * Configuration Manager
 * Main module for managing arcade cabinet configurations
 * Addresses the crash bug by implementing proper error handling and memory management
 */

import { ConfigValidator } from './configValidator.js';
import { ConfigParser } from './configParser.js';
import { memoryPool } from './memoryPool.js';

export class ConfigManager {
    constructor() {
        this.configurations = new Map();
        this.activeConfigId = null;
        this.storageKey = 'octoarcade_configurations';
        this.activeConfigKey = 'octoarcade_active_config';
    }

    /**
     * Initialize manager and load configurations from storage
     */
    async init() {
        try {
            await this.loadFromStorage();
        } catch (error) {
            console.error('Error loading configurations from storage:', error);
            // Don't throw - allow app to continue with empty state
        }
    }

    /**
     * Load configurations from localStorage
     */
    async loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        const activeId = localStorage.getItem(this.activeConfigKey);

        if (stored) {
            const configs = JSON.parse(stored);
            
            // Load each configuration with memory allocation
            for (const config of configs) {
                const estimatedSize = ConfigValidator.estimateSize(config);
                
                try {
                    // Allocate memory for this configuration
                    memoryPool.allocate(config.id, estimatedSize);
                    this.configurations.set(config.id, config);
                } catch (error) {
                    console.error(`Failed to load configuration ${config.id}:`, error);
                    // Continue loading other configurations
                }
            }
        }

        if (activeId) {
            this.activeConfigId = activeId;
        }
    }

    /**
     * Save configurations to localStorage
     */
    saveToStorage() {
        try {
            const configs = Array.from(this.configurations.values());
            localStorage.setItem(this.storageKey, JSON.stringify(configs));
            
            if (this.activeConfigId) {
                localStorage.setItem(this.activeConfigKey, this.activeConfigId);
            }
        } catch (error) {
            console.error('Error saving to storage:', error);
            throw new Error('Failed to save configurations. Storage may be full.');
        }
    }

    /**
     * Create a new configuration
     * @param {Object} configData - Configuration data
     * @returns {Object} Created configuration
     */
    createConfiguration(configData) {
        try {
            // Sanitize and validate
            const config = ConfigValidator.sanitize(configData);
            const validation = ConfigValidator.validate(config);

            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Estimate and allocate memory
            const estimatedSize = ConfigValidator.estimateSize(config);
            memoryPool.allocate(config.id, estimatedSize);

            // Store configuration
            this.configurations.set(config.id, config);
            this.saveToStorage();

            return config;
        } catch (error) {
            console.error('Error creating configuration:', error);
            throw error;
        }
    }

    /**
     * Import configuration from file
     * @param {File} file - Configuration file
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} Imported configuration
     */
    async importConfiguration(file, progressCallback = null) {
        try {
            // Parse the file with streaming support
            const parsedConfig = await ConfigParser.parse(file, progressCallback);
            
            // Ensure unique ID
            parsedConfig.id = ConfigValidator.generateId();
            parsedConfig.created = new Date().toISOString();
            parsedConfig.modified = new Date().toISOString();

            // Estimate and allocate memory
            const estimatedSize = ConfigValidator.estimateSize(parsedConfig);
            memoryPool.allocate(parsedConfig.id, estimatedSize);

            // Store configuration
            this.configurations.set(parsedConfig.id, parsedConfig);
            this.saveToStorage();

            return parsedConfig;
        } catch (error) {
            console.error('Error importing configuration:', error);
            throw error;
        }
    }

    /**
     * Update an existing configuration
     * @param {string} id - Configuration ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated configuration
     */
    updateConfiguration(id, updates) {
        const config = this.configurations.get(id);
        if (!config) {
            throw new Error(`Configuration ${id} not found`);
        }

        // Free old memory allocation
        memoryPool.free(id);

        // Apply updates
        const updatedConfig = {
            ...config,
            ...updates,
            id: config.id, // Prevent ID changes
            modified: new Date().toISOString()
        };

        // Validate
        const validation = ConfigValidator.validate(updatedConfig);
        if (!validation.valid) {
            // Restore old allocation if validation fails
            const estimatedSize = ConfigValidator.estimateSize(config);
            memoryPool.allocate(id, estimatedSize);
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Allocate memory for updated configuration
        const estimatedSize = ConfigValidator.estimateSize(updatedConfig);
        memoryPool.allocate(id, estimatedSize);

        // Store updated configuration
        this.configurations.set(id, updatedConfig);
        this.saveToStorage();

        return updatedConfig;
    }

    /**
     * Delete a configuration
     * @param {string} id - Configuration ID
     */
    deleteConfiguration(id) {
        if (!this.configurations.has(id)) {
            throw new Error(`Configuration ${id} not found`);
        }

        // Free memory
        memoryPool.free(id);

        // Remove from storage
        this.configurations.delete(id);

        // Clear active if this was active
        if (this.activeConfigId === id) {
            this.activeConfigId = null;
            localStorage.removeItem(this.activeConfigKey);
        }

        this.saveToStorage();
    }

    /**
     * Set active configuration
     * @param {string} id - Configuration ID
     */
    setActiveConfiguration(id) {
        if (!this.configurations.has(id)) {
            throw new Error(`Configuration ${id} not found`);
        }

        // Update active flags
        this.configurations.forEach((config, configId) => {
            config.active = configId === id;
        });

        this.activeConfigId = id;
        this.saveToStorage();
    }

    /**
     * Get configuration by ID
     * @param {string} id - Configuration ID
     * @returns {Object} Configuration
     */
    getConfiguration(id) {
        return this.configurations.get(id);
    }

    /**
     * Get all configurations
     * @returns {Array} Array of configurations
     */
    getAllConfigurations() {
        return Array.from(this.configurations.values());
    }

    /**
     * Get active configuration
     * @returns {Object|null} Active configuration or null
     */
    getActiveConfiguration() {
        return this.activeConfigId ? this.configurations.get(this.activeConfigId) : null;
    }

    /**
     * Export configuration to JSON file
     * @param {string} id - Configuration ID
     * @returns {string} JSON string
     */
    exportConfiguration(id) {
        const config = this.configurations.get(id);
        if (!config) {
            throw new Error(`Configuration ${id} not found`);
        }

        return ConfigParser.serialize(config);
    }

    /**
     * Compare two configurations
     * @param {string} id1 - First configuration ID
     * @param {string} id2 - Second configuration ID
     * @returns {Object} Comparison result
     */
    compareConfigurations(id1, id2) {
        const config1 = this.configurations.get(id1);
        const config2 = this.configurations.get(id2);

        if (!config1 || !config2) {
            throw new Error('One or both configurations not found');
        }

        // Find common and unique games
        const games1 = new Set(config1.games);
        const games2 = new Set(config2.games);

        const commonGames = [...games1].filter(game => games2.has(game));
        const uniqueToConfig1 = [...games1].filter(game => !games2.has(game));
        const uniqueToConfig2 = [...games2].filter(game => !games1.has(game));

        return {
            config1,
            config2,
            commonGames,
            uniqueToConfig1,
            uniqueToConfig2,
            similarity: (commonGames.length / Math.max(games1.size, games2.size) * 100).toFixed(1)
        };
    }

    /**
     * Get memory statistics
     * @returns {Object} Memory statistics
     */
    getMemoryStats() {
        return memoryPool.getStats();
    }

    /**
     * Clear all configurations (for testing/reset)
     */
    clearAll() {
        this.configurations.forEach((config, id) => {
            memoryPool.free(id);
        });
        
        this.configurations.clear();
        this.activeConfigId = null;
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.activeConfigKey);
    }
}
