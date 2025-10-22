/**
 * Main Application
 * OctoArcade - Arcade Cabinet Management Dashboard
 */

import { ConfigManager } from './configManager.js';
import { ConfigValidator } from './configValidator.js';

class OctoArcadeApp {
    constructor() {
        this.configManager = new ConfigManager();
        this.currentEditId = null;
        this.compareIds = [];
        this.loadStartTime = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        this.loadStartTime = performance.now();
        this.showLoading(true);

        try {
            // Initialize configuration manager
            await this.configManager.init();

            // Set up event listeners
            this.setupEventListeners();

            // Render initial state
            this.render();

            // Check load time
            const loadTime = performance.now() - this.loadStartTime;
            console.log(`Dashboard loaded in ${(loadTime / 1000).toFixed(2)} seconds`);

            if (loadTime > 2000) {
                console.warn('Load time exceeds 2 second target');
            }
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // New configuration button
        document.getElementById('new-config-btn').addEventListener('click', () => {
            this.openConfigModal();
        });

        // Import configuration button
        document.getElementById('import-config-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // File input
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileImport(e.target.files[0]);
            e.target.value = ''; // Reset input
        });

        // Configuration form
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConfigSubmit();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            document.getElementById('config-modal').style.display = 'none';
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        document.getElementById('loading-indicator').style.display = show ? 'block' : 'none';
    }

    /**
     * Show error message
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Simple success notification - could be enhanced with a toast
        console.log('Success:', message);
    }

    /**
     * Open configuration modal
     */
    openConfigModal(configId = null) {
        this.currentEditId = configId;
        const modal = document.getElementById('config-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('config-form');

        if (configId) {
            // Edit mode
            const config = this.configManager.getConfiguration(configId);
            title.textContent = 'Edit Configuration';
            document.getElementById('config-name').value = config.name;
            document.getElementById('config-description').value = config.description || '';
            document.getElementById('config-games').value = config.games.join('\n');
            document.getElementById('config-controls').value = config.controls;
        } else {
            // New mode
            title.textContent = 'New Configuration';
            form.reset();
        }

        modal.style.display = 'flex';
        document.getElementById('config-name').focus();
    }

    /**
     * Handle configuration form submission
     */
    async handleConfigSubmit() {
        try {
            const name = document.getElementById('config-name').value.trim();
            const description = document.getElementById('config-description').value.trim();
            const gamesText = document.getElementById('config-games').value;
            const controls = document.getElementById('config-controls').value;

            // Parse games (one per line, filter empty lines)
            const games = gamesText
                .split('\n')
                .map(g => g.trim())
                .filter(g => g.length > 0);

            if (games.length === 0) {
                this.showError('Please add at least one game');
                return;
            }

            if (games.length > 100) {
                this.showError('Maximum 100 games allowed per configuration');
                return;
            }

            const configData = {
                name,
                description,
                games,
                controls
            };

            if (this.currentEditId) {
                // Update existing
                await this.configManager.updateConfiguration(this.currentEditId, configData);
                this.showSuccess('Configuration updated successfully');
            } else {
                // Create new
                await this.configManager.createConfiguration(configData);
                this.showSuccess('Configuration created successfully');
            }

            // Close modal and refresh
            document.getElementById('config-modal').style.display = 'none';
            this.render();
        } catch (error) {
            console.error('Error saving configuration:', error);
            this.showError(error.message);
        }
    }

    /**
     * Handle file import
     */
    async handleFileImport(file) {
        if (!file) return;

        this.showLoading(true);

        try {
            // Import with progress tracking
            await this.configManager.importConfiguration(file, (progress) => {
                console.log(`Import progress: ${progress.toFixed(0)}%`);
            });

            this.showSuccess('Configuration imported successfully');
            this.render();
        } catch (error) {
            console.error('Error importing configuration:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Activate a configuration
     */
    async activateConfiguration(id) {
        try {
            this.configManager.setActiveConfiguration(id);
            this.showSuccess('Configuration activated');
            this.render();
        } catch (error) {
            console.error('Error activating configuration:', error);
            this.showError(error.message);
        }
    }

    /**
     * Delete a configuration
     */
    async deleteConfiguration(id) {
        const config = this.configManager.getConfiguration(id);
        if (!confirm(`Are you sure you want to delete "${config.name}"?`)) {
            return;
        }

        try {
            this.configManager.deleteConfiguration(id);
            this.showSuccess('Configuration deleted');
            this.render();
        } catch (error) {
            console.error('Error deleting configuration:', error);
            this.showError(error.message);
        }
    }

    /**
     * Export a configuration
     */
    exportConfiguration(id) {
        try {
            const config = this.configManager.getConfiguration(id);
            const json = this.configManager.exportConfiguration(id);
            
            // Create download
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${config.name.replace(/[^a-z0-9]/gi, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showSuccess('Configuration exported');
        } catch (error) {
            console.error('Error exporting configuration:', error);
            this.showError(error.message);
        }
    }

    /**
     * Open compare modal
     */
    openCompareModal(id1, id2) {
        try {
            const comparison = this.configManager.compareConfigurations(id1, id2);
            const modal = document.getElementById('compare-modal');
            const content = document.getElementById('compare-content');

            content.innerHTML = `
                <div class="compare-section">
                    <h3>${comparison.config1.name}</h3>
                    <div class="compare-item">
                        <strong>Total Games</strong>
                        <p>${comparison.config1.games.length}</p>
                    </div>
                    <div class="compare-item">
                        <strong>Control Scheme</strong>
                        <p>${comparison.config1.controls}</p>
                    </div>
                    <div class="compare-item">
                        <strong>Unique Games (${comparison.uniqueToConfig1.length})</strong>
                        <ul>
                            ${comparison.uniqueToConfig1.slice(0, 10).map(g => `<li>${this.escapeHtml(g)}</li>`).join('')}
                            ${comparison.uniqueToConfig1.length > 10 ? `<li>... and ${comparison.uniqueToConfig1.length - 10} more</li>` : ''}
                        </ul>
                    </div>
                </div>
                <div class="compare-section">
                    <h3>${comparison.config2.name}</h3>
                    <div class="compare-item">
                        <strong>Total Games</strong>
                        <p>${comparison.config2.games.length}</p>
                    </div>
                    <div class="compare-item">
                        <strong>Control Scheme</strong>
                        <p>${comparison.config2.controls}</p>
                    </div>
                    <div class="compare-item">
                        <strong>Unique Games (${comparison.uniqueToConfig2.length})</strong>
                        <ul>
                            ${comparison.uniqueToConfig2.slice(0, 10).map(g => `<li>${this.escapeHtml(g)}</li>`).join('')}
                            ${comparison.uniqueToConfig2.length > 10 ? `<li>... and ${comparison.uniqueToConfig2.length - 10} more</li>` : ''}
                        </ul>
                    </div>
                </div>
                <div style="grid-column: 1 / -1; text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 0.5rem;">
                    <strong>Common Games: ${comparison.commonGames.length}</strong>
                    <p>Similarity: ${comparison.similarity}%</p>
                </div>
            `;

            modal.style.display = 'flex';
        } catch (error) {
            console.error('Error comparing configurations:', error);
            this.showError(error.message);
        }
    }

    /**
     * Render the dashboard
     */
    render() {
        const configs = this.configManager.getAllConfigurations();
        const activeConfig = this.configManager.getActiveConfiguration();
        const memoryStats = this.configManager.getMemoryStats();

        // Update statistics
        document.getElementById('total-configs').textContent = configs.length;
        document.getElementById('active-config').textContent = activeConfig ? activeConfig.name : 'None';
        document.getElementById('memory-usage').textContent = memoryStats.allocatedKB + ' KB';

        // Render configuration grid
        const grid = document.getElementById('configurations-grid');
        const noConfigsMessage = document.getElementById('no-configs-message');

        if (configs.length === 0) {
            grid.innerHTML = '';
            noConfigsMessage.style.display = 'block';
            return;
        }

        noConfigsMessage.style.display = 'none';

        grid.innerHTML = configs.map(config => this.renderConfigCard(config)).join('');

        // Attach event listeners to card buttons
        configs.forEach(config => {
            // Activate button
            const activateBtn = document.querySelector(`[data-activate="${config.id}"]`);
            if (activateBtn) {
                activateBtn.addEventListener('click', () => this.activateConfiguration(config.id));
            }

            // Edit button
            const editBtn = document.querySelector(`[data-edit="${config.id}"]`);
            if (editBtn) {
                editBtn.addEventListener('click', () => this.openConfigModal(config.id));
            }

            // Export button
            const exportBtn = document.querySelector(`[data-export="${config.id}"]`);
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportConfiguration(config.id));
            }

            // Delete button
            const deleteBtn = document.querySelector(`[data-delete="${config.id}"]`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteConfiguration(config.id));
            }

            // Compare button (if multiple configs exist)
            if (configs.length > 1) {
                const compareBtn = document.querySelector(`[data-compare="${config.id}"]`);
                if (compareBtn) {
                    compareBtn.addEventListener('click', () => {
                        // Find another config to compare with
                        const otherConfig = configs.find(c => c.id !== config.id);
                        if (otherConfig) {
                            this.openCompareModal(config.id, otherConfig.id);
                        }
                    });
                }
            }
        });
    }

    /**
     * Render a configuration card
     */
    renderConfigCard(config) {
        const isActive = config.active;
        const gamesToShow = config.games.slice(0, 5);
        const remainingGames = config.games.length - gamesToShow.length;

        return `
            <div class="config-card ${isActive ? 'active' : ''}">
                <div class="config-header">
                    <h3 class="config-name">${this.escapeHtml(config.name)}</h3>
                    ${config.description ? `<p class="config-description">${this.escapeHtml(config.description)}</p>` : ''}
                </div>
                <div class="config-meta">
                    <div class="config-meta-item">
                        <span>🎮 ${config.games.length} games</span>
                    </div>
                    <div class="config-meta-item">
                        <span>🕹️ ${this.formatControlScheme(config.controls)}</span>
                    </div>
                </div>
                <div class="config-games-preview">
                    <h4>Games Preview</h4>
                    <ul class="config-games-list">
                        ${gamesToShow.map(game => `<li>${this.escapeHtml(game)}</li>`).join('')}
                        ${remainingGames > 0 ? `<li>... and ${remainingGames} more</li>` : ''}
                    </ul>
                </div>
                <div class="config-actions">
                    ${!isActive ? `<button class="btn btn-primary btn-small" data-activate="${config.id}">Activate</button>` : ''}
                    <button class="btn btn-secondary btn-small" data-edit="${config.id}">✏️ Edit</button>
                    <button class="btn btn-secondary btn-small" data-export="${config.id}">💾 Export</button>
                    <button class="btn btn-secondary btn-small" data-compare="${config.id}">📊 Compare</button>
                    <button class="btn btn-danger btn-small" data-delete="${config.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    /**
     * Format control scheme for display
     */
    formatControlScheme(scheme) {
        const schemes = {
            'joystick-6button': 'Joystick + 6 Buttons',
            'joystick-8button': 'Joystick + 8 Buttons',
            'dual-joystick': 'Dual Joystick',
            'spinner': 'Spinner',
            'trackball': 'Trackball'
        };
        return schemes[scheme] || scheme;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new OctoArcadeApp();
    app.init();
});
