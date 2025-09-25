/**
 * OctoArcade Main Application
 * 
 * Manages the UI and user interactions for the arcade cabinet configuration manager
 */

class OctoArcadeApp {
    constructor() {
        this.currentConfig = null;
        this.loadedGames = [];
        this.initializeEventListeners();
        this.loadSettings();
        
        // Show empty state initially
        this.showEmptyState();
    }

    initializeEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => this.showSettingsModal());

        // File selection for new config
        const fileInput = document.getElementById('configFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Settings save button
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Import button
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showModal('import-modal'));
        }

        // New config button
        const newConfigBtn = document.getElementById('new-config-btn');
        if (newConfigBtn) {
            newConfigBtn.addEventListener('click', () => this.showModal('new-config-modal'));
        }
    }

    showSettingsModal() {
        this.showModal('settings-modal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('fade-in');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
        }
    }

    loadSettings() {
        // Load settings from localStorage or set defaults
        const settings = JSON.parse(localStorage.getItem('octoarcade-settings') || '{}');
        
        // Apply settings to UI elements
        const autoSave = document.getElementById('auto-save');
        const themeSelect = document.getElementById('theme-select');
        const showAssignee = document.getElementById('show-assignee');
        const showLabels = document.getElementById('show-labels');
        const showMilestone = document.getElementById('show-milestone');
        const showProjects = document.getElementById('show-projects');
        const maxConfigs = document.getElementById('max-configs');
        const backupInterval = document.getElementById('backup-interval');

        if (autoSave) autoSave.checked = settings.autoSave !== false;
        if (themeSelect) themeSelect.value = settings.theme || 'default';
        if (showAssignee) showAssignee.checked = settings.showAssignee !== false;
        if (showLabels) showLabels.checked = settings.showLabels !== false;
        if (showMilestone) showMilestone.checked = settings.showMilestone || false;
        if (showProjects) showProjects.checked = settings.showProjects || false;
        if (maxConfigs) maxConfigs.value = settings.maxConfigs || 50;
        if (backupInterval) backupInterval.value = settings.backupInterval || 7;
    }

    saveSettings() {
        // Gather settings from UI elements
        const settings = {
            autoSave: document.getElementById('auto-save')?.checked || false,
            theme: document.getElementById('theme-select')?.value || 'default',
            showAssignee: document.getElementById('show-assignee')?.checked || false,
            showLabels: document.getElementById('show-labels')?.checked || false,
            showMilestone: document.getElementById('show-milestone')?.checked || false,
            showProjects: document.getElementById('show-projects')?.checked || false,
            maxConfigs: parseInt(document.getElementById('max-configs')?.value) || 50,
            backupInterval: parseInt(document.getElementById('backup-interval')?.value) || 7
        };

        // Save to localStorage
        localStorage.setItem('octoarcade-settings', JSON.stringify(settings));

        // Show success message
        this.showAlert('Settings saved successfully!', 'success');

        // Close modal
        this.closeModal('settings-modal');
    }

    showAlert(message, type = 'info') {
        // Create and show alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.textContent = message;
        
        const main = document.querySelector('.main');
        main.insertBefore(alertDiv, main.firstChild);

        // Remove alert after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.displayFileInfo(file);
        }
    }

    displayFileInfo(file) {
        // Display file information
        console.log('Selected file:', file.name, file.size);
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

// Global functions for modal management (called from HTML)
function showNewConfigModal() {
    if (window.octoArcade) {
        window.octoArcade.showModal('new-config-modal');
    }
}

function closeModal(modalId) {
    if (window.octoArcade) {
        window.octoArcade.closeModal(modalId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.octoArcade = new OctoArcadeApp();
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        if (window.octoArcade && modalId) {
            window.octoArcade.closeModal(modalId);
        }
    }
});