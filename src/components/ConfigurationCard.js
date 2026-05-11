/**
 * Configuration Card Component
 * 
 * Displays a single arcade cabinet configuration as a card
 * with preview, actions, and status information.
 */

class ConfigurationCard {
  /**
   * Creates a configuration card component
   * @param {Object} config - Configuration data
   * @param {Object} options - Card options
   * @param {Function} options.onSelect - Callback when card is selected
   * @param {Function} options.onEdit - Callback when edit is clicked
   * @param {Function} options.onDelete - Callback when delete is clicked
   * @param {Function} options.onCompare - Callback when compare is initiated
   */
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.element = null;
    this.isSelected = false;
    this.isComparing = false;
  }

  /**
   * Renders the card element
   * @returns {HTMLElement} The card element
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'config-card';
    this.element.dataset.configId = this.config.id;
    
    this.element.innerHTML = this.getCardHTML();
    this.attachEventListeners();
    
    return this.element;
  }

  /**
   * Generates the card HTML
   * @returns {string} Card HTML
   */
  getCardHTML() {
    const gameCount = this.config.games?.length || 0;
    const lastUpdated = this.config.updatedAt 
      ? new Date(this.config.updatedAt).toLocaleDateString()
      : 'Unknown';
    
    return `
      <div class="card-header">
        <div class="card-thumbnail">
          ${this.getThumbnailHTML()}
        </div>
        <div class="card-status ${this.getStatusClass()}">
          ${this.getStatusText()}
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title" title="${this.escapeHTML(this.config.name)}">
          ${this.escapeHTML(this.config.name)}
        </h3>
        <p class="card-description">
          ${this.escapeHTML(this.config.description || 'No description')}
        </p>
        <div class="card-meta">
          <span class="meta-item">
            <span class="meta-icon">🎮</span>
            <span class="meta-value">${gameCount} game${gameCount !== 1 ? 's' : ''}</span>
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-value">${lastUpdated}</span>
          </span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-select" title="Select this configuration">
          Select
        </button>
        <button class="btn btn-secondary btn-edit" title="Edit configuration">
          ✏️
        </button>
        <button class="btn btn-secondary btn-compare" title="Compare with another">
          🔄
        </button>
        <button class="btn btn-danger btn-delete" title="Delete configuration">
          🗑️
        </button>
      </div>
    `;
  }

  /**
   * Gets thumbnail HTML
   * @returns {string} Thumbnail HTML
   */
  getThumbnailHTML() {
    if (this.config.thumbnail) {
      return `<img src="${this.escapeHTML(this.config.thumbnail)}" alt="${this.escapeHTML(this.config.name)}" />`;
    }
    
    // Default arcade cabinet icon
    return `
      <div class="default-thumbnail">
        <svg viewBox="0 0 100 100" class="arcade-icon">
          <rect x="20" y="10" width="60" height="80" rx="5" fill="#333" />
          <rect x="25" y="15" width="50" height="30" rx="3" fill="#4a9eff" />
          <circle cx="35" cy="60" r="8" fill="#ff4444" />
          <circle cx="55" cy="60" r="5" fill="#44ff44" />
          <circle cx="70" cy="60" r="5" fill="#ffff44" />
          <rect x="30" y="75" width="40" height="10" rx="2" fill="#666" />
        </svg>
      </div>
    `;
  }

  /**
   * Gets status class based on configuration state
   * @returns {string} Status CSS class
   */
  getStatusClass() {
    if (this.config.isActive) return 'status-active';
    if (this.config.hasErrors) return 'status-error';
    if (this.config.isModified) return 'status-modified';
    return 'status-normal';
  }

  /**
   * Gets status text
   * @returns {string} Status text
   */
  getStatusText() {
    if (this.config.isActive) return 'Active';
    if (this.config.hasErrors) return 'Error';
    if (this.config.isModified) return 'Modified';
    return 'Ready';
  }

  /**
   * Attaches event listeners to card elements
   */
  attachEventListeners() {
    // Select button
    const selectBtn = this.element.querySelector('.btn-select');
    selectBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onSelect) {
        this.options.onSelect(this.config);
      }
    });

    // Edit button
    const editBtn = this.element.querySelector('.btn-edit');
    editBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onEdit) {
        this.options.onEdit(this.config);
      }
    });

    // Compare button
    const compareBtn = this.element.querySelector('.btn-compare');
    compareBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCompare();
      if (this.options.onCompare) {
        this.options.onCompare(this.config, this.isComparing);
      }
    });

    // Delete button
    const deleteBtn = this.element.querySelector('.btn-delete');
    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onDelete) {
        this.options.onDelete(this.config);
      }
    });

    // Card click for selection
    this.element.addEventListener('click', () => {
      if (this.options.onSelect) {
        this.options.onSelect(this.config);
      }
    });
  }

  /**
   * Sets the selected state
   * @param {boolean} selected - Whether card is selected
   */
  setSelected(selected) {
    this.isSelected = selected;
    if (this.element) {
      this.element.classList.toggle('selected', selected);
    }
  }

  /**
   * Toggles compare mode
   */
  toggleCompare() {
    this.isComparing = !this.isComparing;
    if (this.element) {
      this.element.classList.toggle('comparing', this.isComparing);
    }
  }

  /**
   * Sets compare mode
   * @param {boolean} comparing - Whether in compare mode
   */
  setComparing(comparing) {
    this.isComparing = comparing;
    if (this.element) {
      this.element.classList.toggle('comparing', comparing);
    }
  }

  /**
   * Updates the card with new configuration data
   * @param {Object} config - New configuration data
   */
  update(config) {
    this.config = config;
    if (this.element) {
      this.element.innerHTML = this.getCardHTML();
      this.attachEventListeners();
    }
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
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfigurationCard };
}
