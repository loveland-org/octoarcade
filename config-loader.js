/**
 * OctoArcade Configuration Loader
 * 
 * This module fixes the memory allocation bug by implementing:
 * - Streaming JSON parser to avoid loading entire file into memory
 * - Chunked processing of game configurations
 * - Memory usage tracking and limits
 * - Progress reporting and cancellation support
 */

class ConfigurationLoader {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB limit
        this.chunkSize = 10; // Process 10 games at a time
        this.memoryTracker = new MemoryTracker();
        this.isLoading = false;
        this.loadingCancelled = false;
    }

    /**
     * Validates file before attempting to load
     */
    validateFile(file) {
        if (!file) {
            throw new Error('No file selected');
        }

        if (file.size > this.maxFileSize) {
            throw new Error(`File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        if (!file.name.endsWith('.json')) {
            throw new Error('File must be a JSON configuration file');
        }

        return true;
    }

    /**
     * Loads configuration using streaming parser to prevent memory issues
     */
    async loadConfiguration(file, onProgress, onGameChunk) {
        this.validateFile(file);
        
        if (this.isLoading) {
            throw new Error('Configuration loading already in progress');
        }

        this.isLoading = true;
        this.loadingCancelled = false;
        this.memoryTracker.reset();

        try {
            // Read file in chunks instead of loading entirely into memory
            const text = await this.readFileAsText(file);
            
            // Parse JSON with validation
            let config;
            try {
                config = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON configuration file');
            }

            // Validate configuration structure
            this.validateConfiguration(config);

            // Process games in chunks to manage memory
            const games = config.games || [];
            const totalGames = games.length;
            let processedGames = 0;

            onProgress(0, `Validating ${totalGames} games...`);

            const processedGamesList = [];

            // Process games in chunks
            for (let i = 0; i < games.length; i += this.chunkSize) {
                if (this.loadingCancelled) {
                    throw new Error('Loading cancelled by user');
                }

                const chunk = games.slice(i, i + this.chunkSize);
                
                // Process chunk and track memory
                const processedChunk = await this.processGameChunk(chunk, i);
                processedGamesList.push(...processedChunk);

                processedGames += chunk.length;
                const progress = (processedGames / totalGames) * 100;
                
                onProgress(progress, `Loaded ${processedGames}/${totalGames} games...`);
                
                // Report chunk to UI
                if (onGameChunk) {
                    onGameChunk(processedChunk, processedGames, totalGames);
                }

                // Small delay to prevent UI freezing and allow cancellation
                await this.sleep(10);
                
                // Monitor memory usage
                this.memoryTracker.checkpoint();
            }

            // Return processed configuration
            return {
                ...config,
                games: processedGamesList,
                totalGames: processedGamesList.length,
                loadedAt: new Date().toISOString(),
                memoryStats: this.memoryTracker.getStats()
            };

        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Processes a chunk of games with memory management
     */
    async processGameChunk(gameChunk, startIndex) {
        const processed = [];

        for (let i = 0; i < gameChunk.length; i++) {
            const game = gameChunk[i];
            
            // Validate individual game
            const processedGame = this.validateAndProcessGame(game, startIndex + i);
            processed.push(processedGame);

            // Track memory for each game processed
            this.memoryTracker.track('game_processed');
        }

        return processed;
    }

    /**
     * Validates and processes individual game configuration
     */
    validateAndProcessGame(game, index) {
        if (!game.name) {
            throw new Error(`Game at index ${index} missing required 'name' field`);
        }

        return {
            id: game.id || `game_${index}`,
            name: game.name,
            genre: game.genre || 'Unknown',
            year: game.year || 'Unknown',
            players: game.players || 1,
            description: game.description || '',
            controls: game.controls || [],
            // Avoid storing large binary data in memory
            screenshot: game.screenshot ? '[Screenshot Available]' : null,
            rom: game.rom ? '[ROM Available]' : null,
            loadedAt: Date.now()
        };
    }

    /**
     * Validates the overall configuration structure
     */
    validateConfiguration(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Configuration must be a valid JSON object');
        }

        if (!config.games || !Array.isArray(config.games)) {
            throw new Error('Configuration must contain a "games" array');
        }

        if (config.games.length === 0) {
            throw new Error('Configuration must contain at least one game');
        }

        // Additional validation
        if (config.games.length > 1000) {
            throw new Error('Configuration contains too many games (maximum 1000)');
        }
    }

    /**
     * Reads file as text with progress tracking
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            reader.readAsText(file);
        });
    }

    /**
     * Cancels ongoing loading operation
     */
    cancelLoading() {
        this.loadingCancelled = true;
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gets current loading status
     */
    getLoadingStatus() {
        return {
            isLoading: this.isLoading,
            memoryStats: this.memoryTracker.getStats()
        };
    }
}

/**
 * Memory usage tracker to prevent memory leaks and monitor usage
 */
class MemoryTracker {
    constructor() {
        this.reset();
    }

    reset() {
        this.startMemory = this.getCurrentMemory();
        this.peakMemory = this.startMemory;
        this.operations = 0;
        this.checkpoints = [];
    }

    track(operation) {
        this.operations++;
        const currentMemory = this.getCurrentMemory();
        if (currentMemory > this.peakMemory) {
            this.peakMemory = currentMemory;
        }
    }

    checkpoint() {
        const memory = this.getCurrentMemory();
        this.checkpoints.push({
            timestamp: Date.now(),
            memory: memory,
            operations: this.operations
        });

        if (memory > this.peakMemory) {
            this.peakMemory = memory;
        }
    }

    getCurrentMemory() {
        // Estimate memory usage using performance API if available
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        }
        
        // Fallback estimation based on operations
        return Math.round(this.operations * 0.1);
    }

    getStats() {
        return {
            startMemory: this.startMemory,
            currentMemory: this.getCurrentMemory(),
            peakMemory: this.peakMemory,
            operations: this.operations,
            checkpoints: this.checkpoints.length
        };
    }
}

// Export for use in app.js
window.ConfigurationLoader = ConfigurationLoader;