const ScreenshotManager = require('./ScreenshotManager');

/**
 * Main entry point for octoarcade screenshot utilities
 */
class OctoArcade {
  constructor() {
    this.screenshotManager = new ScreenshotManager();
  }

  /**
   * Initializes and validates the octoarcade screenshot directories
   * @returns {Promise<Object>} - Validation results for both directories
   */
  async initialize() {
    try {
      const screenshotStats = await this.screenshotManager.getScreenshotStats(this.screenshotManager.screenshotDir);
      const issueScreenshotStats = await this.screenshotManager.getScreenshotStats(this.screenshotManager.issueScreenshotDir);

      return {
        screenshots: screenshotStats,
        issueScreenshots: issueScreenshotStats,
        initialized: true
      };
    } catch (error) {
      throw new Error(`Failed to initialize octoarcade: ${error.message}`);
    }
  }

  /**
   * Validates the entire project structure
   * @returns {Promise<Object>} - Complete validation report
   */
  async validate() {
    try {
      const initResults = await this.initialize();
      const hasIssues = initResults.screenshots.invalidCount > 0 || initResults.issueScreenshots.invalidCount > 0;
      
      return {
        ...initResults,
        hasIssues,
        valid: !hasIssues
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }
}

module.exports = { OctoArcade, ScreenshotManager };