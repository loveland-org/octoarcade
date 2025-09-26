const ScreenshotManager = require('../src/ScreenshotManager');
const fs = require('fs-extra');
const path = require('path');

describe('ScreenshotManager', () => {
  let screenshotManager;
  let testDir;

  beforeEach(() => {
    screenshotManager = new ScreenshotManager();
    testDir = path.join(__dirname, 'test-screenshots');
  });

  afterEach(async () => {
    // Clean up test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('validateScreenshotFilename', () => {
    test('should validate correct keyframe screenshot filename', () => {
      const validFilenames = [
        '1758538266417-screenshot_keyframe_6_14.500s.png',
        '1758287957537-screenshot_keyframe_2_5.800s.png',
        '1758538230739-screenshot_keyframe_3_14.533s.png'
      ];

      validFilenames.forEach(filename => {
        expect(screenshotManager.validateScreenshotFilename(filename)).toBe(true);
      });
    });

    test('should validate correct issue screenshot filename', () => {
      const validFilenames = [
        'screenshot-2025-09-18T16-27-05-539Z-1.png',
        'screenshot-2025-09-18T16-55-47-283Z-19.png',
        'screenshot-2025-09-18T17-13-49-604Z-3.png'
      ];

      validFilenames.forEach(filename => {
        expect(screenshotManager.validateScreenshotFilename(filename)).toBe(true);
      });
    });

    test('should reject invalid filenames', () => {
      const invalidFilenames = [
        'invalid-filename.png',
        'screenshot.jpg',
        '1758538266417-screenshot_keyframe_6.png', // missing time
        'screenshot-2025-09-18T16-27-05.png', // missing Z and number
        '', // empty string
        null, // null
        undefined, // undefined
        123 // not a string
      ];

      invalidFilenames.forEach(filename => {
        expect(screenshotManager.validateScreenshotFilename(filename)).toBe(false);
      });
    });
  });

  describe('listScreenshots', () => {
    test('should list PNG files in directory', async () => {
      // Setup test directory with files
      await fs.ensureDir(testDir);
      await fs.writeFile(path.join(testDir, '1758538266417-screenshot_keyframe_6_14.500s.png'), 'fake image');
      await fs.writeFile(path.join(testDir, 'not-a-screenshot.txt'), 'text file');
      await fs.writeFile(path.join(testDir, 'another-image.jpg'), 'jpeg file');

      const screenshots = await screenshotManager.listScreenshots(testDir);
      
      expect(screenshots).toHaveLength(1);
      expect(screenshots[0]).toBe('1758538266417-screenshot_keyframe_6_14.500s.png');
    });

    test('should handle empty directory', async () => {
      const screenshots = await screenshotManager.listScreenshots(testDir);
      expect(screenshots).toHaveLength(0);
    });

    test('should handle non-existent directory', async () => {
      const nonExistentDir = path.join(__dirname, 'does-not-exist');
      const screenshots = await screenshotManager.listScreenshots(nonExistentDir);
      expect(screenshots).toHaveLength(0);
    });
  });

  describe('validateAllScreenshots', () => {
    test('should validate multiple screenshots correctly', async () => {
      await fs.ensureDir(testDir);
      await fs.writeFile(path.join(testDir, '1758538266417-screenshot_keyframe_6_14.500s.png'), 'fake image');
      await fs.writeFile(path.join(testDir, 'invalid-name.png'), 'invalid image');
      await fs.writeFile(path.join(testDir, 'screenshot-2025-09-18T16-27-05-539Z-1.png'), 'issue screenshot');

      const result = await screenshotManager.validateAllScreenshots(testDir);

      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0]).toBe('invalid-name.png');
    });
  });

  describe('screenshotExists', () => {
    test('should return true for existing file', async () => {
      await fs.ensureDir(testDir);
      const filename = 'test-screenshot.png';
      await fs.writeFile(path.join(testDir, filename), 'fake image');

      const exists = await screenshotManager.screenshotExists(filename, testDir);
      expect(exists).toBe(true);
    });

    test('should return false for non-existing file', async () => {
      const exists = await screenshotManager.screenshotExists('does-not-exist.png', testDir);
      expect(exists).toBe(false);
    });
  });

  describe('getScreenshotStats', () => {
    test('should return correct statistics', async () => {
      await fs.ensureDir(testDir);
      await fs.writeFile(path.join(testDir, '1758538266417-screenshot_keyframe_6_14.500s.png'), 'valid');
      await fs.writeFile(path.join(testDir, 'invalid-name.png'), 'invalid');

      const stats = await screenshotManager.getScreenshotStats(testDir);

      expect(stats.totalCount).toBe(2);
      expect(stats.validCount).toBe(1);
      expect(stats.invalidCount).toBe(1);
      expect(stats.validPercentage).toBe(50);
      expect(stats.invalidFiles).toContain('invalid-name.png');
    });

    test('should handle empty directory', async () => {
      const stats = await screenshotManager.getScreenshotStats(testDir);

      expect(stats.totalCount).toBe(0);
      expect(stats.validCount).toBe(0);
      expect(stats.invalidCount).toBe(0);
      expect(stats.validPercentage).toBe(0);
      expect(stats.invalidFiles).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    test('should handle filesystem errors gracefully', async () => {
      // Try to access a path that will cause permission error in some systems
      const inaccessiblePath = '/root/restricted';
      
      await expect(screenshotManager.getScreenshotStats(inaccessiblePath))
        .rejects.toThrow('Failed to get screenshot statistics');
    });
  });
});