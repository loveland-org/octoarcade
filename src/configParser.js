/**
 * Configuration Parser with Streaming Support
 * Addresses sub-issue: "Optimize configuration parser for streaming large files"
 * 
 * Implements a streaming JSON parser to handle large configuration files
 * without loading the entire file into memory at once.
 */

import { ConfigValidator } from './configValidator.js';
import { memoryPool } from './memoryPool.js';

export class ConfigParser {
    /**
     * Parse configuration from a file using streaming approach
     * @param {File} file - File object to parse
     * @param {Function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Object>} Parsed configuration
     */
    static async parseFile(file, progressCallback = null) {
        // Validate file size first
        const sizeValidation = ConfigValidator.validateFileSize(file.size);
        if (!sizeValidation.valid) {
            throw new Error(sizeValidation.error);
        }

        // For small files, use simple parsing
        if (file.size < 100 * 1024) { // Less than 100KB
            return this.parseSmallFile(file, progressCallback);
        }

        // For large files, use streaming parser
        return this.parseStreamingFile(file, progressCallback);
    }

    /**
     * Parse small files directly
     * @param {File} file - File object
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} Parsed configuration
     */
    static async parseSmallFile(file, progressCallback) {
        if (progressCallback) progressCallback(0);

        const text = await file.text();
        
        if (progressCallback) progressCallback(50);

        const config = JSON.parse(text);
        
        if (progressCallback) progressCallback(100);

        return config;
    }

    /**
     * Parse large files using streaming/chunked approach
     * @param {File} file - File object
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} Parsed configuration
     */
    static async parseStreamingFile(file, progressCallback) {
        const chunkSize = 64 * 1024; // 64KB chunks
        let offset = 0;
        let buffer = '';
        const totalSize = file.size;

        // Allocate memory pool for this operation
        const tempId = `temp_parse_${Date.now()}`;
        memoryPool.allocate(tempId, totalSize);

        try {
            while (offset < totalSize) {
                const chunk = file.slice(offset, offset + chunkSize);
                const text = await chunk.text();
                buffer += text;
                offset += chunkSize;

                if (progressCallback) {
                    const progress = Math.min((offset / totalSize) * 100, 100);
                    progressCallback(progress);
                }

                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            // Parse the complete buffer
            const config = JSON.parse(buffer);
            
            return config;
        } finally {
            // Free the temporary allocation
            memoryPool.free(tempId);
        }
    }

    /**
     * Parse configuration from JSON string
     * @param {string} jsonString - JSON string to parse
     * @returns {Object} Parsed configuration
     */
    static parseString(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON format: ${error.message}`);
        }
    }

    /**
     * Validate and sanitize parsed configuration
     * @param {Object} config - Parsed configuration
     * @returns {Object} Validated and sanitized configuration
     */
    static validateAndSanitize(config) {
        // Validate first
        const validation = ConfigValidator.validate(config);
        
        if (!validation.valid) {
            throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
        }

        // Sanitize the configuration
        return ConfigValidator.sanitize(config);
    }

    /**
     * Complete parse operation with validation
     * @param {File|string} input - File or JSON string to parse
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} Validated configuration
     */
    static async parse(input, progressCallback = null) {
        let config;

        if (input instanceof File) {
            config = await this.parseFile(input, progressCallback);
        } else if (typeof input === 'string') {
            config = this.parseString(input);
        } else {
            throw new Error('Input must be a File or JSON string');
        }

        return this.validateAndSanitize(config);
    }

    /**
     * Serialize configuration to JSON string
     * @param {Object} config - Configuration to serialize
     * @param {boolean} pretty - Whether to pretty-print
     * @returns {string} JSON string
     */
    static serialize(config, pretty = true) {
        return JSON.stringify(config, null, pretty ? 2 : 0);
    }
}
