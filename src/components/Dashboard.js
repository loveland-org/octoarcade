/**
 * Dashboard Component
 * 
 * Main dashboard component for managing arcade cabinet configurations.
 * Provides a grid layout with search, filtering, and bulk actions.
 */

class Dashboard {
  /**
   * Creates the dashboard component
   * @param {HTMLElement|string} container - Container element or selector
   * @param {Object} options - Dashboard options
   * @param {Object} options.configManager - Configuration manager instance
   * @param {Function} options.onConfigSelect - Callback when config is selected
   * @param {Function} options.onConfigDelete - Callback when config is deleted
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.options = options;
    this.configManager = options.configManager;
    this.cards = new Map();
    this.selectedConfigs = new Set();
    this.compareConfigs = [];
    this.searchQuery = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.filterStatus = 'all';
    
    this.loadingStartTime = null;
    this.isInitialized = false;
  }

  /**
   * Initializes and renders the dashboard
   * @returns {Promise<void>}
   */
  async initialize() {
    this.loadingStartTime = performance.now();
    
    this.render();
    this.attachEventListeners();
    await this.loadConfigurations();
    
    const loadTime = performance.now() - this.loadingStartTime;
    console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
    
    this.isInitialized = true;
    this.hideLoading();
    
    // Verify load time meets success criteria (< 2 seconds)
    if (loadTime > 2000) {
      console.warn('Dashboard load time exceeds 2 second target');
    }
  }

  /**
   * Renders the main dashboard structure
   */
  render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <header class="dashboard-header">
          <h1 class="dashboard-title">🎮 Arcade Cabinet Manager</h1>
          <p class="dashboard-subtitle">Manage and organize your arcade configurations</p>
        </header>
        
        <div class="dashboard-toolbar">
          <div class="toolbar-left">
            <div class="search-box">
              <input type="text" 
                     class="search-input" 
                     placeholder="Search configurations..." 
                     aria-label="Search configurations">
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="filter-group">
              <select class="filter-select filter-status" aria-label="Filter by status">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="ready">Ready</option>
                <option value="modified">Modified</option>
                <option value="error">Has Errors</option>
              </select>
              
              <select class="filter-select filter-sort" aria-label="Sort by">
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="games-desc">Most Games</option>
                <option value="games-asc">Least Games</option>
              </select>
            </div>
          </div>
          
          <div class="toolbar-right">
            <button class="btn btn-primary btn-add" title="Add new configuration">
              ➕ Add Config
            </button>
            <button class="btn btn-secondary btn-import" title="Import configuration file">
              📥 Import
            </button>
            <button class="btn btn-secondary btn-compare-mode" title="Compare configurations">
              🔄 Compare
            </button>
          </div>
        </div>
        
        <div class="dashboard-stats">
          <div class="stat-card">
            <span class="stat-value" id="stat-total">0</span>
            <span class="stat-label">Total Configs</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" id="stat-active">0</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" id="stat-games">0</span>
            <span class="stat-label">Total Games</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" id="stat-memory">0%</span>
            <span class="stat-label">Memory Used</span>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="loading-overlay" id="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading configurations...</div>
            <div class="loading-progress">
              <div class="progress-bar" id="loading-progress-bar"></div>
            </div>
          </div>
          
          <div class="config-grid" id="config-grid">
            <!-- Configuration cards will be inserted here -->
          </div>
          
          <div class="empty-state" id="empty-state" style="display: none;">
            <div class="empty-icon">🎮</div>
            <h3>No Configurations Found</h3>
            <p>Get started by adding your first arcade cabinet configuration.</p>
            <button class="btn btn-primary btn-add-empty">➕ Add Configuration</button>
          </div>
        </div>
        
        <div class="compare-panel" id="compare-panel" style="display: none;">
          <div class="compare-header">
            <h3>Compare Configurations</h3>
            <button class="btn btn-secondary btn-close-compare">✕</button>
          </div>
          <div class="compare-content" id="compare-content">
            <!-- Comparison results will be shown here -->
          </div>
        </div>
      </div>
      
      <!-- File input for imports -->
      <input type="file" 
             id="file-input" 
             accept=".json" 
             style="display: none;" 
             aria-hidden="true">
    `;
  }

  /**
   * Attaches event listeners to dashboard elements
   */
  attachEventListeners() {
    // Search input
    const searchInput = this.container.querySelector('.search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterAndRenderCards();
    });

    // Status filter
    const statusFilter = this.container.querySelector('.filter-status');
    statusFilter?.addEventListener('change', (e) => {
      this.filterStatus = e.target.value;
      this.filterAndRenderCards();
    });

    // Sort filter
    const sortFilter = this.container.querySelector('.filter-sort');
    sortFilter?.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      this.sortBy = field;
      this.sortOrder = order;
      this.filterAndRenderCards();
    });

    // Add config button
    const addBtn = this.container.querySelector('.btn-add');
    addBtn?.addEventListener('click', () => this.showAddDialog());

    const addEmptyBtn = this.container.querySelector('.btn-add-empty');
    addEmptyBtn?.addEventListener('click', () => this.showAddDialog());

    // Import button
    const importBtn = this.container.querySelector('.btn-import');
    importBtn?.addEventListener('click', () => this.triggerFileImport());

    // File input change
    const fileInput = this.container.querySelector('#file-input');
    fileInput?.addEventListener('change', (e) => this.handleFileImport(e));

    // Compare mode button
    const compareBtn = this.container.querySelector('.btn-compare-mode');
    compareBtn?.addEventListener('click', () => this.toggleCompareMode());

    // Close compare panel
    const closeCompareBtn = this.container.querySelector('.btn-close-compare');
    closeCompareBtn?.addEventListener('click', () => this.closeComparePanel());
  }

  /**
   * Loads configurations from the manager
   * @returns {Promise<void>}
   */
  async loadConfigurations() {
    if (!this.configManager) return;

    this.showLoading();
    
    try {
      const configs = this.configManager.getAllConfigs();
      const activeId = this.configManager.activeConfig;
      
      // Clear existing cards
      this.cards.clear();
      
      // Create cards for each configuration
      for (const { id, config, size, lastAccessed } of configs) {
        const cardConfig = {
          ...config,
          id,
          size,
          lastAccessed,
          isActive: id === activeId
        };
        
        this.createCard(cardConfig);
      }
      
      this.updateStats();
      this.filterAndRenderCards();
    } catch (e) {
      console.error('Error loading configurations:', e);
      this.showError('Failed to load configurations');
    }
  }

  /**
   * Creates a card for a configuration
   * @param {Object} config - Configuration data
   */
  createCard(config) {
    const card = new ConfigurationCard(config, {
      onSelect: (cfg) => this.handleConfigSelect(cfg),
      onEdit: (cfg) => this.handleConfigEdit(cfg),
      onDelete: (cfg) => this.handleConfigDelete(cfg),
      onCompare: (cfg, comparing) => this.handleConfigCompare(cfg, comparing)
    });
    
    this.cards.set(config.id, card);
  }

  /**
   * Filters and renders cards based on current filters
   */
  filterAndRenderCards() {
    const grid = this.container.querySelector('#config-grid');
    const emptyState = this.container.querySelector('#empty-state');
    
    if (!grid) return;

    // Get all configurations
    let configs = Array.from(this.cards.values()).map(card => card.config);

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      configs = configs.filter(config => 
        config.name?.toLowerCase().includes(query) ||
        config.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      configs = configs.filter(config => {
        switch (this.filterStatus) {
          case 'active': return config.isActive;
          case 'ready': return !config.isActive && !config.hasErrors && !config.isModified;
          case 'modified': return config.isModified;
          case 'error': return config.hasErrors;
          default: return true;
        }
      });
    }

    // Sort configurations
    configs.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'date':
          comparison = new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
          break;
        case 'games':
          comparison = (a.games?.length || 0) - (b.games?.length || 0);
          break;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Clear and re-render grid
    grid.innerHTML = '';

    if (configs.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Render filtered cards
    for (const config of configs) {
      const card = this.cards.get(config.id);
      if (card) {
        grid.appendChild(card.render());
      }
    }
  }

  /**
   * Updates dashboard statistics
   */
  updateStats() {
    if (!this.configManager) return;

    const stats = this.configManager.getStats();
    const configs = this.configManager.getAllConfigs();
    
    // Count totals
    const totalGames = configs.reduce((sum, { config }) => 
      sum + (config.games?.length || 0), 0);
    
    const activeCount = configs.filter(({ id }) => 
      id === this.configManager.activeConfig).length;

    // Update stat displays
    const setStatValue = (id, value) => {
      const el = this.container.querySelector(`#${id}`);
      if (el) el.textContent = value;
    };

    setStatValue('stat-total', configs.length);
    setStatValue('stat-active', activeCount);
    setStatValue('stat-games', totalGames);
    setStatValue('stat-memory', `${stats.utilizationPercent.toFixed(1)}%`);
  }

  /**
   * Handles configuration selection
   * @param {Object} config - Selected configuration
   */
  handleConfigSelect(config) {
    // Update selected state on cards
    for (const [id, card] of this.cards) {
      card.setSelected(id === config.id);
    }

    // Switch active configuration
    if (this.configManager) {
      const result = this.configManager.switchConfig(config.id);
      
      if (result.success) {
        // Update cards to reflect new active state
        for (const [id, card] of this.cards) {
          card.config.isActive = id === config.id;
          card.update(card.config);
        }
        
        if (this.options.onConfigSelect) {
          this.options.onConfigSelect(config);
        }
      }
    }
  }

  /**
   * Handles configuration edit
   * @param {Object} config - Configuration to edit
   */
  handleConfigEdit(config) {
    console.log('Edit configuration:', config.id);
    // TODO: Implement edit dialog
  }

  /**
   * Handles configuration delete
   * @param {Object} config - Configuration to delete
   */
  handleConfigDelete(config) {
    if (confirm(`Are you sure you want to delete "${config.name}"?`)) {
      if (this.configManager) {
        this.configManager.removeConfig(config.id);
        this.cards.delete(config.id);
        this.filterAndRenderCards();
        this.updateStats();
        
        if (this.options.onConfigDelete) {
          this.options.onConfigDelete(config);
        }
      }
    }
  }

  /**
   * Handles configuration compare toggle
   * @param {Object} config - Configuration to compare
   * @param {boolean} comparing - Whether comparing is enabled
   */
  handleConfigCompare(config, comparing) {
    if (comparing) {
      if (!this.compareConfigs.includes(config.id)) {
        this.compareConfigs.push(config.id);
      }
    } else {
      this.compareConfigs = this.compareConfigs.filter(id => id !== config.id);
    }

    // If we have 2 configs, show comparison
    if (this.compareConfigs.length === 2) {
      this.showComparison();
    }
  }

  /**
   * Toggles compare mode
   */
  toggleCompareMode() {
    this.compareConfigs = [];
    for (const card of this.cards.values()) {
      card.setComparing(false);
    }
    
    const panel = this.container.querySelector('#compare-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Shows comparison results
   */
  showComparison() {
    if (!this.configManager || this.compareConfigs.length !== 2) return;

    const result = this.configManager.compareConfigs(
      this.compareConfigs[0],
      this.compareConfigs[1]
    );

    const panel = this.container.querySelector('#compare-panel');
    const content = this.container.querySelector('#compare-content');
    
    if (!panel || !content) return;

    panel.style.display = 'block';

    if (!result.success) {
      content.innerHTML = `<p class="error">Comparison failed: ${result.error}</p>`;
      return;
    }

    const config1 = this.configManager.getConfig(this.compareConfigs[0]);
    const config2 = this.configManager.getConfig(this.compareConfigs[1]);

    content.innerHTML = `
      <div class="compare-summary">
        <div class="compare-item">
          <h4>${this.escapeHTML(config1?.name)}</h4>
        </div>
        <div class="compare-vs">VS</div>
        <div class="compare-item">
          <h4>${this.escapeHTML(config2?.name)}</h4>
        </div>
      </div>
      <div class="compare-details">
        <h4>Differences: ${result.differences.length}</h4>
        <ul class="diff-list">
          ${result.differences.slice(0, 10).map(diff => `
            <li class="diff-item diff-${diff.type}">
              <span class="diff-path">${this.escapeHTML(diff.path)}</span>
              <span class="diff-type">${diff.type}</span>
            </li>
          `).join('')}
          ${result.differences.length > 10 ? `<li>...and ${result.differences.length - 10} more</li>` : ''}
        </ul>
        <h4>Shared Games: ${result.similarities.sharedGames.length}</h4>
      </div>
    `;
  }

  /**
   * Closes the compare panel
   */
  closeComparePanel() {
    this.compareConfigs = [];
    for (const card of this.cards.values()) {
      card.setComparing(false);
    }
    
    const panel = this.container.querySelector('#compare-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * Shows add configuration dialog
   */
  showAddDialog() {
    // Simple prompt-based add for now
    const name = prompt('Enter configuration name:');
    if (name) {
      const newConfig = {
        id: `config_${Date.now()}`,
        name,
        description: '',
        games: [],
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.configManager) {
        this.configManager.loadFromString(JSON.stringify(newConfig))
          .then(result => {
            if (result.success) {
              this.createCard({ ...newConfig, isActive: false });
              this.filterAndRenderCards();
              this.updateStats();
            }
          });
      }
    }
  }

  /**
   * Triggers file import dialog
   */
  triggerFileImport() {
    const fileInput = this.container.querySelector('#file-input');
    fileInput?.click();
  }

  /**
   * Handles file import
   * @param {Event} event - Change event from file input
   */
  async handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.showLoading();
    this.updateLoadingProgress(0);

    try {
      if (this.configManager) {
        const result = await this.configManager.loadFromFile(file, {
          sanitize: true,
          onProgress: (progress) => this.updateLoadingProgress(progress)
        });

        if (result.success) {
          this.createCard({
            ...result.config,
            isActive: false
          });
          this.filterAndRenderCards();
          this.updateStats();
        } else {
          this.showError(`Import failed: ${result.error}`);
        }
      }
    } catch (e) {
      this.showError(`Import error: ${e.message}`);
    } finally {
      this.hideLoading();
      // Clear the file input
      event.target.value = '';
    }
  }

  /**
   * Shows loading overlay
   */
  showLoading() {
    const overlay = this.container.querySelector('#loading-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }

  /**
   * Hides loading overlay
   */
  hideLoading() {
    const overlay = this.container.querySelector('#loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Updates loading progress bar
   * @param {number} progress - Progress percentage (0-100)
   */
  updateLoadingProgress(progress) {
    const bar = this.container.querySelector('#loading-progress-bar');
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  }

  /**
   * Shows error message as a toast notification
   * @param {string} message - Error message
   */
  showError(message) {
    console.error(message);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
      <span class="toast-icon">❌</span>
      <span class="toast-message">${this.escapeHTML(message)}</span>
      <button class="toast-close">✕</button>
    `;
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());
    
    // Auto-remove after 5 seconds
    setTimeout(() => toast.remove(), 5000);
    
    // Add to container (create if needed)
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(toast);
  }

  /**
   * Escapes HTML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Refreshes the dashboard
   */
  async refresh() {
    await this.loadConfigurations();
  }

  /**
   * Destroys the dashboard and cleans up
   */
  destroy() {
    this.cards.clear();
    this.container.innerHTML = '';
    this.isInitialized = false;
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Dashboard };
}
