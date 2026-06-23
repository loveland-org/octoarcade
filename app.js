// OctoArcade Cabinet Management Dashboard
class CabinetManager {
    constructor() {
        this.configurations = [];
        this.currentConfig = null;
        this.init();
    }

    init() {
        this.loadConfigurations();
        this.bindEvents();
        this.renderDashboard();
        
        // Show empty state if no configurations
        if (this.configurations.length === 0) {
            this.showEmptyState();
        }
    }

    bindEvents() {
        // New configuration button
        document.getElementById('new-config-btn').addEventListener('click', () => {
            this.showNewConfigModal();
        });

        // Import button
        document.getElementById('import-btn').addEventListener('click', () => {
            this.showImportModal();
        });

        // New configuration form
        document.getElementById('new-config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createConfiguration();
        });

        // Import file handling
        const fileInput = document.getElementById('import-file');
        const dropZone = document.getElementById('file-drop-zone');
        
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFileSelect({ target: { files: e.dataTransfer.files } });
        });

        // Import confirmation
        document.getElementById('confirm-import-btn').addEventListener('click', () => {
            this.importConfiguration();
        });

        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    loadConfigurations() {
        try {
            const saved = localStorage.getItem('octoarcade-configurations');
            if (saved) {
                this.configurations = JSON.parse(saved);
                // Ensure each configuration has required properties
                this.configurations = this.configurations.map(config => ({
                    id: config.id || this.generateId(),
                    name: config.name || 'Unnamed Configuration',
                    description: config.description || '',
                    games: config.games || [],
                    created: config.created || new Date().toISOString(),
                    lastUsed: config.lastUsed || null,
                    size: config.size || 0,
                    ...config
                }));
            } else {
                // Create some sample configurations for demo
                this.createSampleConfigurations();
            }
        } catch (error) {
            console.error('Error loading configurations:', error);
            this.configurations = [];
        }
    }

    saveConfigurations() {
        try {
            localStorage.setItem('octoarcade-configurations', JSON.stringify(this.configurations));
        } catch (error) {
            console.error('Error saving configurations:', error);
            this.showAlert('Failed to save configurations. Storage may be full.', 'error');
        }
    }

    generateId() {
        return 'config_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    createSampleConfigurations() {
        const sampleConfigs = [
            {
                id: this.generateId(),
                name: 'Classic Arcade Collection',
                description: 'A curated selection of timeless arcade classics',
                games: this.generateSampleGames(25),
                created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                size: 2.1
            },
            {
                id: this.generateId(),
                name: 'Fighting Games Arena',
                description: 'The ultimate fighting game experience',
                games: this.generateSampleGames(15, 'fighting'),
                created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                size: 1.8
            },
            {
                id: this.generateId(),
                name: 'Retro Racing Collection',
                description: 'High-speed retro racing games',
                games: this.generateSampleGames(12, 'racing'),
                created: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsed: null,
                size: 1.2
            }
        ];
        
        this.configurations = sampleConfigs;
        this.saveConfigurations();
    }

    generateSampleGames(count, genre = 'arcade') {
        const gameTemplates = {
            arcade: ['Pac-Man', 'Galaga', 'Donkey Kong', 'Frogger', 'Centipede', 'Space Invaders', 'Asteroids', 'Defender'],
            fighting: ['Street Fighter II', 'Mortal Kombat', 'King of Fighters', 'Tekken 3', 'Soul Calibur', 'Darkstalkers'],
            racing: ['OutRun', 'Pole Position', 'Road Rash', 'Daytona USA', 'Ridge Racer', 'Wipeout']
        };
        
        const templates = gameTemplates[genre] || gameTemplates.arcade;
        const games = [];
        
        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            games.push({
                id: this.generateId(),
                name: i < templates.length ? template : `${template} ${Math.floor(i / templates.length) + 1}`,
                size: Math.random() * 100 + 10, // MB
                genre: genre,
                added: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        return games;
    }

    renderDashboard() {
        this.updateStats();
        this.renderConfigurationGrid();
    }

    updateStats() {
        const totalConfigs = this.configurations.length;
        const totalGames = this.configurations.reduce((sum, config) => sum + config.games.length, 0);
        const lastUsedConfig = this.configurations
            .filter(config => config.lastUsed)
            .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))[0];
        
        document.getElementById('total-configs').textContent = totalConfigs;
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('last-used').textContent = lastUsedConfig 
            ? this.formatTimeAgo(lastUsedConfig.lastUsed)
            : 'Never';
    }

    renderConfigurationGrid() {
        const grid = document.getElementById('configurations-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.configurations.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.configurations.map(config => this.createConfigCard(config)).join('');
        
        // Add click events to cards
        grid.querySelectorAll('.config-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    const configId = card.dataset.configId;
                    this.showConfigDetails(configId);
                }
            });
        });
    }

    createConfigCard(config) {
        const gameCount = config.games.length;
        const size = config.size ? `${config.size.toFixed(1)} GB` : 'Unknown';
        const lastUsed = config.lastUsed ? this.formatTimeAgo(config.lastUsed) : 'Never used';
        const status = config.lastUsed ? 'Active' : 'Inactive';
        
        return `
            <div class="config-card fade-in" data-config-id="${config.id}">
                <div class="config-thumbnail">
                    <i class="fas fa-gamepad"></i>
                    <div class="config-status">${status}</div>
                </div>
                <div class="config-info">
                    <div class="config-name">${this.escapeHtml(config.name)}</div>
                    <div class="config-description">${this.escapeHtml(config.description)}</div>
                    <div class="config-stats">
                        <span><i class="fas fa-games"></i> ${gameCount} games</span>
                        <span><i class="fas fa-hdd"></i> ${size}</span>
                    </div>
                    <div class="config-actions">
                        <button class="btn btn-primary btn-small" onclick="cabinetManager.useConfiguration('${config.id}')">
                            <i class="fas fa-play"></i> Use
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="cabinetManager.duplicateConfiguration('${config.id}')">
                            <i class="fas fa-copy"></i> Duplicate
                        </button>
                        <button class="btn btn-danger btn-small" onclick="cabinetManager.deleteConfiguration('${config.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showNewConfigModal() {
        document.getElementById('new-config-modal').style.display = 'block';
        document.getElementById('config-name').focus();
    }

    showImportModal() {
        document.getElementById('import-modal').style.display = 'block';
    }

    showConfigDetails(configId) {
        const config = this.configurations.find(c => c.id === configId);
        if (!config) return;

        const modal = document.getElementById('config-details-modal');
        const title = document.getElementById('config-details-title');
        const body = document.getElementById('config-details-body');
        
        title.textContent = config.name;
        
        const gamesList = config.games.map(game => `
            <div class="game-item">
                <span class="game-name">${this.escapeHtml(game.name)}</span>
                <span class="game-size">${game.size ? game.size.toFixed(1) + ' MB' : 'Unknown'}</span>
            </div>
        `).join('');
        
        body.innerHTML = `
            <div class="config-details">
                <div class="detail-section">
                    <h4>Configuration Info</h4>
                    <p><strong>Description:</strong> ${this.escapeHtml(config.description)}</p>
                    <p><strong>Created:</strong> ${this.formatDate(config.created)}</p>
                    <p><strong>Last Used:</strong> ${config.lastUsed ? this.formatDate(config.lastUsed) : 'Never'}</p>
                    <p><strong>Total Games:</strong> ${config.games.length}</p>
                    <p><strong>Total Size:</strong> ${config.size ? config.size.toFixed(1) + ' GB' : 'Unknown'}</p>
                </div>
                <div class="detail-section">
                    <h4>Games (${config.games.length})</h4>
                    <div class="games-list" style="max-height: 300px; overflow-y: auto;">
                        ${gamesList}
                    </div>
                </div>
            </div>
            <style>
                .detail-section { margin-bottom: 2rem; }
                .detail-section h4 { color: #4a5568; margin-bottom: 1rem; }
                .game-item { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 0.5rem; 
                    border-bottom: 1px solid #e2e8f0; 
                }
                .game-name { font-weight: 500; }
                .game-size { color: #718096; font-size: 0.9rem; }
            </style>
        `;
        
        // Set up modal actions
        document.getElementById('duplicate-config-btn').onclick = () => {
            this.duplicateConfiguration(configId);
            this.closeModal('config-details-modal');
        };
        
        document.getElementById('export-config-btn').onclick = () => {
            this.exportConfiguration(configId);
        };
        
        modal.style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        // Reset forms
        if (modalId === 'new-config-modal') {
            document.getElementById('new-config-form').reset();
        }
        if (modalId === 'import-modal') {
            document.getElementById('import-file').value = '';
            document.getElementById('import-preview').style.display = 'none';
            document.getElementById('confirm-import-btn').disabled = true;
        }
    }

    createConfiguration() {
        this.showLoading();
        
        // Simulate processing time
        setTimeout(() => {
            try {
                const name = document.getElementById('config-name').value.trim();
                const description = document.getElementById('config-description').value.trim();
                const template = document.getElementById('config-template').value;
                
                if (!name) {
                    this.showAlert('Configuration name is required', 'error');
                    this.hideLoading();
                    return;
                }
                
                const config = {
                    id: this.generateId(),
                    name: name,
                    description: description,
                    games: this.getTemplateGames(template),
                    created: new Date().toISOString(),
                    lastUsed: null,
                    size: 0
                };
                
                // Calculate size
                config.size = config.games.reduce((sum, game) => sum + (game.size || 0), 0) / 1024; // Convert to GB
                
                this.configurations.push(config);
                this.saveConfigurations();
                this.renderDashboard();
                this.closeModal('new-config-modal');
                this.showAlert(`Configuration "${name}" created successfully!`, 'success');
                this.hideLoading();
            } catch (error) {
                console.error('Error creating configuration:', error);
                this.showAlert('Failed to create configuration', 'error');
                this.hideLoading();
            }
        }, 1000);
    }

    getTemplateGames(template) {
        switch (template) {
            case 'classic':
                return this.generateSampleGames(30, 'arcade');
            case 'modern':
                return this.generateSampleGames(20, 'arcade');
            case 'fighting':
                return this.generateSampleGames(15, 'fighting');
            default:
                return [];
        }
    }

    duplicateConfiguration(configId) {
        const config = this.configurations.find(c => c.id === configId);
        if (!config) return;
        
        const duplicate = {
            ...config,
            id: this.generateId(),
            name: `${config.name} (Copy)`,
            created: new Date().toISOString(),
            lastUsed: null
        };
        
        this.configurations.push(duplicate);
        this.saveConfigurations();
        this.renderDashboard();
        this.showAlert(`Configuration duplicated as "${duplicate.name}"`, 'success');
    }

    deleteConfiguration(configId) {
        if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
            return;
        }
        
        this.configurations = this.configurations.filter(c => c.id !== configId);
        this.saveConfigurations();
        this.renderDashboard();
        this.showAlert('Configuration deleted successfully', 'success');
    }

    useConfiguration(configId) {
        const config = this.configurations.find(c => c.id === configId);
        if (!config) return;
        
        // Update last used timestamp
        config.lastUsed = new Date().toISOString();
        this.currentConfig = config;
        this.saveConfigurations();
        this.renderDashboard();
        this.showAlert(`Now using configuration: ${config.name}`, 'success');
    }

    exportConfiguration(configId) {
        const config = this.configurations.find(c => c.id === configId);
        if (!config) return;
        
        try {
            const exportData = {
                ...config,
                exportedAt: new Date().toISOString(),
                exportedBy: 'OctoArcade Dashboard',
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_config.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('Configuration exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showAlert('Failed to export configuration', 'error');
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'application/json') {
            this.showAlert('Please select a valid JSON file', 'error');
            return;
        }
        
        // Check file size to prevent memory issues (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showAlert('File is too large. Maximum size is 10MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.previewImport(data);
            } catch (error) {
                this.showAlert('Invalid JSON file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    previewImport(data) {
        const preview = document.getElementById('import-preview');
        const details = document.getElementById('import-details');
        
        // Validate configuration structure
        if (!data.name || !Array.isArray(data.games)) {
            this.showAlert('Invalid configuration format', 'error');
            return;
        }
        
        details.innerHTML = `
            <p><strong>Name:</strong> ${this.escapeHtml(data.name)}</p>
            <p><strong>Description:</strong> ${this.escapeHtml(data.description || 'No description')}</p>
            <p><strong>Games:</strong> ${data.games.length}</p>
            <p><strong>Created:</strong> ${data.created ? this.formatDate(data.created) : 'Unknown'}</p>
        `;
        
        preview.style.display = 'block';
        document.getElementById('confirm-import-btn').disabled = false;
        this.importData = data;
    }

    importConfiguration() {
        if (!this.importData) return;
        
        this.showLoading();
        
        // Simulate processing time to prevent UI blocking
        setTimeout(() => {
            try {
                const config = {
                    ...this.importData,
                    id: this.generateId(),
                    imported: new Date().toISOString(),
                    lastUsed: null
                };
                
                // Check for duplicate names and modify if necessary
                const existingNames = this.configurations.map(c => c.name);
                let finalName = config.name;
                let counter = 1;
                
                while (existingNames.includes(finalName)) {
                    finalName = `${config.name} (${counter})`;
                    counter++;
                }
                
                config.name = finalName;
                
                this.configurations.push(config);
                this.saveConfigurations();
                this.renderDashboard();
                this.closeModal('import-modal');
                this.showAlert(`Configuration "${finalName}" imported successfully!`, 'success');
                this.hideLoading();
            } catch (error) {
                console.error('Import error:', error);
                this.showAlert('Failed to import configuration', 'error');
                this.hideLoading();
            }
        }, 1500);
    }

    showEmptyState() {
        document.getElementById('configurations-grid').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.innerHTML = `
            ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
        `;
        
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
window.showNewConfigModal = () => cabinetManager.showNewConfigModal();
window.closeModal = (modalId) => cabinetManager.closeModal(modalId);

// Initialize the application
let cabinetManager;
document.addEventListener('DOMContentLoaded', () => {
    cabinetManager = new CabinetManager();
});

// Export for global access
window.cabinetManager = cabinetManager;