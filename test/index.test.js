const { OctoArcade, ScreenshotManager } = require('../src/index');
const fs = require('fs-extra');
const path = require('path');

describe('OctoArcade', () => {
  let octoArcade;
  let testScreenshotsDir;
  let testIssueScreenshotsDir;

  beforeEach(() => {
    octoArcade = new OctoArcade();
    testScreenshotsDir = path.join(__dirname, 'test-screenshots-main');
    testIssueScreenshotsDir = path.join(__dirname, 'test-issue-screenshots-main');
  });

  afterEach(async () => {
    // Clean up test directories
    for (const dir of [testScreenshotsDir, testIssueScreenshotsDir]) {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
      }
    }
  });

  describe('initialization', () => {
    test('should initialize with both screenshot directories', async () => {
      // Create test directories with sample files
      await fs.ensureDir(testScreenshotsDir);
      await fs.ensureDir(testIssueScreenshotsDir);
      await fs.writeFile(path.join(testScreenshotsDir, '1758538266417-screenshot_keyframe_6_14.500s.png'), 'test');
      await fs.writeFile(path.join(testIssueScreenshotsDir, 'screenshot-2025-09-18T16-27-05-539Z-1.png'), 'test');

      // Mock the directories for testing
      octoArcade.screenshotManager = new ScreenshotManager(testScreenshotsDir, testIssueScreenshotsDir);
      
      const result = await octoArcade.initialize();

      expect(result.initialized).toBe(true);
      expect(result.screenshots).toBeDefined();
      expect(result.issueScreenshots).toBeDefined();
      expect(result.screenshots.totalCount).toBeGreaterThan(0);
      expect(result.issueScreenshots.totalCount).toBeGreaterThan(0);
    });

    test('should handle missing directories gracefully', async () => {
      // Test with non-existent directories by creating unique paths
      const nonExistentDir1 = path.join(__dirname, 'definitely-does-not-exist-1');
      const nonExistentDir2 = path.join(__dirname, 'definitely-does-not-exist-2');
      
      octoArcade.screenshotManager = new ScreenshotManager(nonExistentDir1, nonExistentDir2);
      
      const result = await octoArcade.initialize();

      expect(result.initialized).toBe(true);
      expect(result.screenshots.totalCount).toBe(0);
      expect(result.issueScreenshots.totalCount).toBe(0);
    });
  });

  describe('validation', () => {
    test('should validate project with no issues', async () => {
      await fs.ensureDir(testScreenshotsDir);
      await fs.ensureDir(testIssueScreenshotsDir);
      await fs.writeFile(path.join(testScreenshotsDir, '1758538266417-screenshot_keyframe_6_14.500s.png'), 'valid');
      await fs.writeFile(path.join(testIssueScreenshotsDir, 'screenshot-2025-09-18T16-27-05-539Z-1.png'), 'valid');

      octoArcade.screenshotManager = new ScreenshotManager(testScreenshotsDir, testIssueScreenshotsDir);
      
      const result = await octoArcade.validate();

      expect(result.valid).toBe(true);
      expect(result.hasIssues).toBe(false);
      expect(result.screenshots.invalidCount).toBe(0);
      expect(result.issueScreenshots.invalidCount).toBe(0);
    });

    test('should detect validation issues', async () => {
      await fs.ensureDir(testScreenshotsDir);
      await fs.ensureDir(testIssueScreenshotsDir);
      await fs.writeFile(path.join(testScreenshotsDir, 'invalid-filename.png'), 'invalid');
      await fs.writeFile(path.join(testIssueScreenshotsDir, 'screenshot-2025-09-18T16-27-05-539Z-1.png'), 'valid');

      octoArcade.screenshotManager = new ScreenshotManager(testScreenshotsDir, testIssueScreenshotsDir);
      
      const result = await octoArcade.validate();

      expect(result.valid).toBe(false);
      expect(result.hasIssues).toBe(true);
      expect(result.screenshots.invalidCount).toBeGreaterThan(0);
    });
  });

  describe('exports', () => {
    test('should export OctoArcade class', () => {
      expect(OctoArcade).toBeDefined();
      expect(typeof OctoArcade).toBe('function');
    });

    test('should export ScreenshotManager class', () => {
      expect(ScreenshotManager).toBeDefined();
      expect(typeof ScreenshotManager).toBe('function');
    });

    test('should create instances correctly', () => {
      const arcade = new OctoArcade();
      const manager = new ScreenshotManager();

      expect(arcade).toBeInstanceOf(OctoArcade);
      expect(manager).toBeInstanceOf(ScreenshotManager);
    });
  });
});