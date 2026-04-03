const fs = require('fs-extra');
const path = require('path');

/**
 * Screenshot Manager utility for octoarcade
 * Handles screenshot file operations and validation
 */
class ScreenshotManager {
  constructor(screenshotDir = 'screenshots', issueScreenshotDir = 'issue-screenshots') {
    this.screenshotDir = screenshotDir;
    this.issueScreenshotDir = issueScreenshotDir;
  }

  /**
   * Validates screenshot filename format
   * Expected formats:
   * - TIMESTAMP-screenshot_keyframe_N_TIMEs.png
   * - screenshot-YYYY-MM-DDTHH-MM-SS-sssZ-N.png
   * @param {string} filename - The filename to validate
   * @returns {boolean} - True if valid format
   */
  validateScreenshotFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return false;
    }

    // Pattern for screenshots: TIMESTAMP-screenshot_keyframe_N_TIMEs.png
    const keyframePattern = /^\d+-screenshot_keyframe_\d+_[\d.]+s\.png$/;
    
    // Pattern for issue screenshots: screenshot-YYYY-MM-DDTHH-MM-SS-sssZ-N.png
    const issuePattern = /^screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-\d+\.png$/;

    return keyframePattern.test(filename) || issuePattern.test(filename);
  }

  /**
   * Lists all screenshots in a directory
   * @param {string} directory - Directory to scan
   * @returns {Promise<string[]>} - Array of screenshot filenames
   */
  async listScreenshots(directory) {
    try {
      const dirPath = path.resolve(directory || this.screenshotDir);
      await fs.ensureDir(dirPath);
      const files = await fs.readdir(dirPath);
      return files.filter(file => file.endsWith('.png'));
    } catch (error) {
      throw new Error(`Failed to list screenshots: ${error.message}`);
    }
  }

  /**
   * Validates all screenshots in a directory
   * @param {string} directory - Directory to validate
   * @returns {Promise<{valid: string[], invalid: string[]}>} - Validation results
   */
  async validateAllScreenshots(directory) {
    try {
      const screenshots = await this.listScreenshots(directory);
      const valid = [];
      const invalid = [];

      for (const screenshot of screenshots) {
        if (this.validateScreenshotFilename(screenshot)) {
          valid.push(screenshot);
        } else {
          invalid.push(screenshot);
        }
      }

      return { valid, invalid };
    } catch (error) {
      throw new Error(`Failed to validate screenshots: ${error.message}`);
    }
  }

  /**
   * Checks if a screenshot file exists
   * @param {string} filename - Screenshot filename
   * @param {string} directory - Directory to check (optional)
   * @returns {Promise<boolean>} - True if file exists
   */
  async screenshotExists(filename, directory) {
    try {
      const dirPath = path.resolve(directory || this.screenshotDir);
      const filePath = path.join(dirPath, filename);
      return await fs.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets screenshot file statistics
   * @param {string} directory - Directory to analyze (optional)
   * @returns {Promise<Object>} - Statistics object
   */
  async getScreenshotStats(directory) {
    try {
      const screenshots = await this.listScreenshots(directory);
      const validation = await this.validateAllScreenshots(directory);
      
      return {
        totalCount: screenshots.length,
        validCount: validation.valid.length,
        invalidCount: validation.invalid.length,
        validPercentage: screenshots.length > 0 ? Math.round((validation.valid.length / screenshots.length) * 100) : 0,
        invalidFiles: validation.invalid
      };
    } catch (error) {
      throw new Error(`Failed to get screenshot statistics: ${error.message}`);
    }
  }
}

module.exports = ScreenshotManager;