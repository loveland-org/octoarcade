#!/usr/bin/env node

const { OctoArcade } = require('./src/index');
const path = require('path');

/**
 * CLI tool for octoarcade screenshot validation
 */
async function main() {
  try {
    const octoArcade = new OctoArcade();
    
    console.log('🎮 OctoArcade Screenshot Validator');
    console.log('=====================================');
    
    console.log('Initializing and validating screenshots...\n');
    
    const result = await octoArcade.validate();
    
    console.log('📊 Validation Results:');
    console.log('----------------------');
    
    // Screenshots directory
    const { screenshots, issueScreenshots } = result;
    
    console.log(`📁 screenshots/ directory:`);
    console.log(`   Total files: ${screenshots.totalCount}`);
    console.log(`   ✅ Valid: ${screenshots.validCount} (${screenshots.validPercentage}%)`);
    console.log(`   ❌ Invalid: ${screenshots.invalidCount}`);
    if (screenshots.invalidCount > 0) {
      console.log(`   Invalid files: ${screenshots.invalidFiles.join(', ')}`);
    }
    
    console.log(`\n📁 issue-screenshots/ directory:`);
    console.log(`   Total files: ${issueScreenshots.totalCount}`);
    console.log(`   ✅ Valid: ${issueScreenshots.validCount} (${issueScreenshots.validPercentage}%)`);
    console.log(`   ❌ Invalid: ${issueScreenshots.invalidCount}`);
    if (issueScreenshots.invalidCount > 0) {
      console.log(`   Invalid files: ${issueScreenshots.invalidFiles.join(', ')}`);
    }
    
    console.log('\n🎯 Overall Status:');
    console.log('------------------');
    if (result.valid) {
      console.log('✅ All screenshot files have valid names!');
    } else {
      console.log('⚠️  Some screenshot files have invalid names.');
      console.log('   Expected formats:');
      console.log('   - Keyframe: TIMESTAMP-screenshot_keyframe_N_TIMEs.png');
      console.log('   - Issue: screenshot-YYYY-MM-DDTHH-MM-SS-sssZ-N.png');
    }
    
    // Exit with appropriate code
    process.exit(result.valid ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}