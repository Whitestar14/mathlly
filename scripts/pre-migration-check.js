#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const { execSync } = require('child_process');

function checkPrerequisites() {
  console.log('🔍 Pre-migration checklist...\n');
  
  const checks = [];
  
  // Check if git is clean
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      checks.push({
        name: 'Git working directory',
        status: 'warning',
        message: 'You have uncommitted changes. Consider committing before migration.'
      });
    } else {
      checks.push({
        name: 'Git working directory',
        status: 'pass',
        message: 'Clean working directory'
      });
    }
  } catch (error) {
    checks.push({
      name: 'Git working directory',
      status: 'warning',
      message: 'Could not check git status'
    });
  }
  
  // Check if theme composable exists
  const themeComposablePath = 'src/composables/useTheme.ts';
  if (fs.existsSync(themeComposablePath)) {
    checks.push({
      name: 'Theme composable',
      status: 'pass',
      message: 'useTheme composable found'
    });
  } else {
    checks.push({
      name: 'Theme composable',
      status: 'fail',
      message: 'useTheme composable not found. Please create it first.'
    });
  }
  
  // Check CSS custom properties
  const mainCssPath = 'src/assets/css/main.css';
  if (fs.existsSync(mainCssPath)) {
    const cssContent = fs.readFileSync(mainCssPath, 'utf8');
    if (cssContent.includes('--color-background')) {
      checks.push({
        name: 'CSS custom properties',
        status: 'pass',
        message: 'CSS custom properties found'
      });
    } else {
      checks.push({
        name: 'CSS custom properties',
        status: 'fail',
        message: 'CSS custom properties not found. Please update main.css first.'
      });
    }
  } else {
    checks.push({
      name: 'CSS custom properties',
      status: 'fail',
      message: 'main.css not found'
    });
  }
  
  // Count Vue files
  const vueFiles = glob.sync('src/**/*.vue');
  checks.push({
    name: 'Vue files',
    status: 'info',
    message: `Found ${vueFiles.length} Vue files to process`
  });
  
  // Check for existing backups
  const backupFiles = glob.sync('src/**/*.vue.backup');
  if (backupFiles.length > 0) {
    checks.push({
      name: 'Existing backups',
      status: 'warning',
      message: `Found ${backupFiles.length} existing backup files. Consider cleaning them first.`
    });
  } else {
    checks.push({
      name: 'Existing backups',
      status: 'pass',
      message: 'No existing backup files'
    });
  }
  
  // Display results
  checks.forEach(check => {
    const icon = {
      pass: '✅',
      fail: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[check.status];
    
    console.log(`${icon} ${check.name}: ${check.message}`);
  });
  
  const hasFailures = checks.some(check => check.status === 'fail');
  const hasWarnings = checks.some(check => check.status === 'warning');
  
    console.log('\n📋 Summary:');
  
  if (hasFailures) {
    console.log('❌ Migration cannot proceed. Please fix the failed checks above.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Migration can proceed, but please review the warnings above.');
    console.log('💡 Recommended: Commit your changes before running migration.');
  } else {
    console.log('✅ All checks passed! Ready for migration.');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run migrate-styles:dry-run (to preview changes)');
  console.log('   2. Run: npm run migrate-styles (to apply changes)');
  console.log('   3. Test your application');
  console.log('   4. Commit the changes');
}

if (require.main === module) {
  checkPrerequisites();
}
