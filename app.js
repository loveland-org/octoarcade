/**
 * OctoArcade Main Application
 * 
 * Manages the UI and user interactions for the arcade cabinet configuration manager
 */

class OctoArcadeApp {
    constructor() {
        this.configLoader = new ConfigurationLoader();
        this.currentConfig = null;
        this.loadedGames = [];
        this.initializeEventListeners();
        this.updateMemoryDisplay();
        
        // Update memory display every 2 seconds
        setInterval(() => this.updateMemoryDisplay(), 2000);
    }

    initializeEventListeners() {
        // File selection
        const fileInput = document.getElementById('configFile');
        const loadButton = document.getElementById('loadConfig');
        const cancelButton = document.getElementById('cancelLoad');

        fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        loadButton.addEventListener('click', () => this.loadConfiguration());
        cancelButton.addEventListener('click', () => this.cancelLoading());

        // Drag and drop support
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.displayFileInfo(file);
            document.getElementById('loadConfig').disabled = false;
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.background = '#f0f8ff';
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.style.background = '';
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            document.getElementById('configFile').files = files;
            this.displayFileInfo(file);
            document.getElementById('loadConfig').disabled = false;
        }
    }

    displayFileInfo(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        // Show validation status
        try {
            this.configLoader.validateFile(file);
            fileName.style.color = '#2f855a';
            fileSize.style.color = '#2f855a';
        } catch (error) {
            fileName.style.color = '#c53030';
            fileSize.textContent += ` - ${error.message}`;
            document.getElementById('loadConfig').disabled = true;
        }
    }

    async loadConfiguration() {
        const fileInput = document.getElementById('configFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showStatus('No file selected', 'error');
            return;
        }

        // Show progress section
        this.showProgressSection(true);
        document.getElementById('loadConfig').disabled = true;
        this.loadedGames = [];
        
        try {
            const config = await this.configLoader.loadConfiguration(
                file,
                (progress, message) => this.updateProgress(progress, message),
                (gameChunk, processed, total) => this.displayGameChunk(gameChunk, processed, total)
            );

            this.currentConfig = config;
            this.showConfigurationLoaded(config);
            this.showStatus(`Successfully loaded ${config.totalGames} games!`, 'success');
            
        } catch (error) {
            this.showStatus(`Error loading configuration: ${error.message}`, 'error');
            console.error('Configuration loading error:', error);
        } finally {
            this.showProgressSection(false);
            document.getElementById('loadConfig').disabled = false;
        }
    }

    cancelLoading() {
        this.configLoader.cancelLoading();
        this.showProgressSection(false);
        document.getElementById('loadConfig').disabled = false;
        this.showStatus('Loading cancelled by user', 'error');
    }

    updateProgress(progress, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = message;
        progressPercent.textContent = `${Math.round(progress)}%`;
    }

    displayGameChunk(gameChunk, processedCount, totalCount) {
        const gamesContainer = document.getElementById('games');
        const gameList = document.getElementById('gameList');
        const gameCount = document.getElementById('gameCount');
        
        // Show game list section
        gameList.style.display = 'block';
        
        // Add new games to the list
        gameChunk.forEach(game => {
            this.loadedGames.push(game);
            const gameCard = this.createGameCard(game);
            gamesContainer.appendChild(gameCard);
        });
        
        // Update count
        gameCount.textContent = processedCount;
        
        // Auto-scroll to bottom to show progress
        gamesContainer.scrollTop = gamesContainer.scrollHeight;
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        card.innerHTML = `
            <div class="game-title">${this.escapeHtml(game.name)}</div>
            <div class="game-info">
                <div>Genre: ${this.escapeHtml(game.genre)}</div>
                <div>Year: ${game.year}</div>
                <div>Players: ${game.players}</div>
            </div>
        `;
        
        return card;
    }

    showConfigurationLoaded(config) {
        const gameList = document.getElementById('gameList');
        const gameCount = document.getElementById('gameCount');
        
        gameList.style.display = 'block';
        gameCount.textContent = config.totalGames;
        
        // Display memory statistics
        const memStats = config.memoryStats;
        console.log('Configuration loaded with memory stats:', memStats);
    }

    showProgressSection(show) {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = show ? 'block' : 'none';
        
        if (!show) {
            // Reset progress
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('progressText').textContent = 'Preparing...';
            document.getElementById('progressPercent').textContent = '0%';
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('configStatus');
        statusElement.textContent = message;
        statusElement.className = `status-info ${type}`;
    }

    updateMemoryDisplay() {
        const stats = this.configLoader.getLoadingStatus();
        const memoryStats = stats.memoryStats;
        
        document.getElementById('peakMemory').textContent = `${memoryStats.peakMemory} MB`;
        document.getElementById('currentMemory').textContent = `${memoryStats.currentMemory} MB`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.octoArcade = new OctoArcadeApp();
});