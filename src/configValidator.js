/**
 * Configuration Validator
 * Addresses sub-issue: "Add configuration file validation and size limits"
 * 
 * Validates configuration files to prevent loading invalid or excessively large files
 * that could cause crashes or performance issues.
 */

export class ConfigValidator {
    static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB maximum file size
    static MAX_GAMES = 1000; // Maximum number of games per configuration
    static MAX_NAME_LENGTH = 100;
    static MAX_DESCRIPTION_LENGTH = 500;
    static MAX_GAME_TITLE_LENGTH = 200;

    /**
     * Validate a configuration object
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    static validate(config) {
        const errors = [];

        // Check required fields
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Configuration name is required and must be a string');
        } else if (config.name.length > this.MAX_NAME_LENGTH) {
            errors.push(`Configuration name exceeds maximum length of ${this.MAX_NAME_LENGTH} characters`);
        }

        // Validate description if present
        if (config.description && typeof config.description !== 'string') {
            errors.push('Configuration description must be a string');
        } else if (config.description && config.description.length > this.MAX_DESCRIPTION_LENGTH) {
            errors.push(`Description exceeds maximum length of ${this.MAX_DESCRIPTION_LENGTH} characters`);
        }

        // Validate games array
        if (!Array.isArray(config.games)) {
            errors.push('Games must be an array');
        } else {
            if (config.games.length === 0) {
                errors.push('Configuration must have at least one game');
            }
            
            if (config.games.length > this.MAX_GAMES) {
                errors.push(`Number of games (${config.games.length}) exceeds maximum of ${this.MAX_GAMES}`);
            }

            // Validate each game entry
            config.games.forEach((game, index) => {
                if (typeof game !== 'string') {
                    errors.push(`Game at index ${index} must be a string`);
                } else if (game.length > this.MAX_GAME_TITLE_LENGTH) {
                    errors.push(`Game title at index ${index} exceeds maximum length of ${this.MAX_GAME_TITLE_LENGTH} characters`);
                }
            });
        }

        // Validate controls
        const validControls = ['joystick-6button', 'joystick-8button', 'dual-joystick', 'spinner', 'trackball'];
        if (config.controls && !validControls.includes(config.controls)) {
            errors.push(`Invalid control scheme: ${config.controls}. Must be one of: ${validControls.join(', ')}`);
        }

        // Validate ID format if present
        if (config.id && typeof config.id !== 'string') {
            errors.push('Configuration ID must be a string');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate file size before parsing
     * @param {number} fileSize - Size of file in bytes
     * @returns {Object} Validation result { valid: boolean, error: string }
     */
    static validateFileSize(fileSize) {
        if (fileSize > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${(this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(2)}MB`
            };
        }
        return { valid: true };
    }

    /**
     * Sanitize configuration data
     * @param {Object} config - Configuration to sanitize
     * @returns {Object} Sanitized configuration
     */
    static sanitize(config) {
        return {
            id: config.id || this.generateId(),
            name: (config.name || 'Untitled').substring(0, this.MAX_NAME_LENGTH).trim(),
            description: (config.description || '').substring(0, this.MAX_DESCRIPTION_LENGTH).trim(),
            games: (config.games || [])
                .filter(game => typeof game === 'string' && game.trim())
                .map(game => game.substring(0, this.MAX_GAME_TITLE_LENGTH).trim())
                .slice(0, this.MAX_GAMES),
            controls: config.controls || 'joystick-6button',
            created: config.created || new Date().toISOString(),
            modified: new Date().toISOString(),
            active: config.active || false
        };
    }

    /**
     * Generate a unique ID for a configuration
     * @returns {string} Unique identifier
     */
    static generateId() {
        return `config_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Estimate memory size of a configuration
     * @param {Object} config - Configuration object
     * @returns {number} Estimated size in bytes
     */
    static estimateSize(config) {
        // Rough estimation based on JSON string length
        const jsonString = JSON.stringify(config);
        return jsonString.length * 2; // UTF-16 encoding approximation
    }
}
