/**
 * Main application logic for Arcade Cabinet Management Dashboard
 */

let configManager;
let currentEditingId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    configManager = new ConfigurationManager();
    initializeEventListeners();
    renderConfigurations();
    updateStats();
    
    // Add some sample configurations if none exist
    if (configManager.getAllConfigurations().length === 0) {
        initializeSampleConfigurations();
    }
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Add configuration button
    document.getElementById('addConfigBtn').addEventListener('click', () => {
        openModal();
    });
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', () => {
        closeModal();
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal();
    });
    
    // Form submission
    document.getElementById('configForm').addEventListener('submit', handleFormSubmit);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Close modal on outside click
    document.getElementById('configModal').addEventListener('click', (e) => {
        if (e.target.id === 'configModal') {
            closeModal();
        }
    });
}

/**
 * Open modal for adding/editing configuration
 */
function openModal(configId = null) {
    const modal = document.getElementById('configModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('configForm');
    
    form.reset();
    currentEditingId = configId;
    
    if (configId) {
        // Edit mode
        modalTitle.textContent = 'Edit Configuration';
        const config = configManager.getConfiguration(configId);
        if (config) {
            document.getElementById('configName').value = config.name;
            document.getElementById('configDescription').value = config.description;
            document.getElementById('configGames').value = config.games.join(', ');
            document.getElementById('configSettings').value = JSON.stringify(config.settings, null, 2);
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Configuration';
        // Set default settings template
        document.getElementById('configSettings').value = JSON.stringify({
            controls: {
                player1: { up: "W", down: "S", left: "A", right: "D", action1: "Space", action2: "LShift" },
                player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", action1: "Enter", action2: "RShift" }
            },
            display: {
                resolution: "1920x1080",
                fullscreen: true,
                vsync: true
            },
            audio: {
                volume: 80,
                soundEffects: true,
                music: true
            }
        }, null, 2);
    }
    
    modal.style.display = 'block';
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('configModal').style.display = 'none';
    currentEditingId = null;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    showLoading(true);
    
    const configData = {
        id: currentEditingId,
        name: document.getElementById('configName').value,
        description: document.getElementById('configDescription').value,
        games: document.getElementById('configGames').value,
        settings: document.getElementById('configSettings').value
    };
    
    try {
        const result = await configManager.addConfiguration(configData);
        
        closeModal();
        renderConfigurations();
        updateStats();
        
        showNotification(`Configuration saved successfully in ${result.loadTime}ms`, 'success');
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Handle search input
 */
function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (query) {
        const results = configManager.searchConfigurations(query);
        renderConfigurations(results);
    } else {
        renderConfigurations();
    }
}

/**
 * Render configuration cards
 */
function renderConfigurations(configurations = null) {
    const grid = document.getElementById('configGrid');
    const configs = configurations || configManager.getAllConfigurations();
    const activeConfig = configManager.getActiveConfiguration();
    
    if (configs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>No configurations found</h3>
                <p>Add your first arcade cabinet configuration to get started!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = configs.map(config => {
        const isActive = activeConfig && activeConfig.id === config.id;
        return `
            <div class="config-card ${isActive ? 'active' : ''}" data-id="${config.id}">
                <h3>${escapeHtml(config.name)}</h3>
                <p>${escapeHtml(config.description) || 'No description'}</p>
                <div class="config-meta">
                    <span>🎮 ${config.games.length} games</span>
                    <span>💾 ${configManager.formatBytes(config.size)}</span>
                </div>
                <div class="config-meta">
                    <span>📅 ${formatDate(config.updatedAt)}</span>
                </div>
                <div class="config-actions">
                    ${!isActive ? `<button class="btn btn-success" onclick="activateConfig('${config.id}')">Activate</button>` : ''}
                    <button class="btn btn-secondary" onclick="editConfig('${config.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteConfig('${config.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update statistics
 */
function updateStats() {
    const configs = configManager.getAllConfigurations();
    const activeConfig = configManager.getActiveConfiguration();
    const memStats = configManager.getMemoryStats();
    
    document.getElementById('totalConfigs').textContent = configs.length;
    document.getElementById('activeConfig').textContent = activeConfig ? activeConfig.name : 'None';
    
    // Calculate average load time (simulated for display)
    const avgLoadTime = configs.length > 0 ? Math.round(50 + (configs.length * 5)) : 0;
    document.getElementById('loadTime').textContent = avgLoadTime + 'ms';
}

/**
 * Activate configuration
 */
function activateConfig(id) {
    showLoading(true);
    
    // Simulate activation delay
    setTimeout(() => {
        configManager.setActiveConfiguration(id);
        renderConfigurations();
        updateStats();
        showNotification('Configuration activated successfully', 'success');
        showLoading(false);
    }, 300);
}

/**
 * Edit configuration
 */
function editConfig(id) {
    openModal(id);
}

/**
 * Delete configuration
 */
function deleteConfig(id) {
    const config = configManager.getConfiguration(id);
    if (!config) return;
    
    if (confirm(`Are you sure you want to delete "${config.name}"?`)) {
        configManager.deleteConfiguration(id);
        renderConfigurations();
        updateStats();
        showNotification('Configuration deleted', 'success');
    }
}

/**
 * Show loading indicator
 */
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#22c55e' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize sample configurations
 */
async function initializeSampleConfigurations() {
    const samples = [
        {
            name: "Classic Arcade Pack",
            description: "Golden age arcade classics from the 80s",
            games: ["Pac-Man", "Space Invaders", "Donkey Kong", "Galaga", "Frogger"],
            settings: JSON.stringify({
                controls: {
                    player1: { up: "W", down: "S", left: "A", right: "D", action1: "Space" }
                },
                display: { resolution: "1920x1080", fullscreen: true },
                audio: { volume: 80 }
            })
        },
        {
            name: "Fighting Games Collection",
            description: "Best fighting games for competitive play",
            games: ["Street Fighter II", "Mortal Kombat", "King of Fighters", "Tekken", "Soul Calibur"],
            settings: JSON.stringify({
                controls: {
                    player1: { up: "W", down: "S", left: "A", right: "D", action1: "J", action2: "K", action3: "L" },
                    player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", action1: "1", action2: "2", action3: "3" }
                },
                display: { resolution: "1920x1080", fullscreen: true },
                audio: { volume: 90 }
            })
        },
        {
            name: "Retro Racing",
            description: "Classic racing games collection",
            games: ["Out Run", "Daytona USA", "Pole Position", "Rad Racer"],
            settings: JSON.stringify({
                controls: {
                    player1: { up: "W", down: "S", left: "A", right: "D", action1: "Space", action2: "LShift" }
                },
                display: { resolution: "1920x1080", fullscreen: true, vsync: true },
                audio: { volume: 75, music: true }
            })
        }
    ];
    
    showLoading(true);
    
    for (const sample of samples) {
        try {
            await configManager.addConfiguration(sample);
        } catch (e) {
            console.error('Failed to add sample configuration:', e);
        }
    }
    
    renderConfigurations();
    updateStats();
    showLoading(false);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
