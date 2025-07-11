#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

// Patterns that should NOT exist after migration
const DEPRECATED_PATTERNS = [
  /text-gray-[0-9]+(?![0-9])/g,
  /bg-gray-[0-9]+(?![0-9])/g,
  /border-gray-[0-9]+(?![0-9])/g,
  /hover:bg-gray-[0-9]+/g,
  /hover:text-gray-[0-9]+/g,
  /dark:text-gray-[0-9]+/g,
  /dark:bg-gray-[0-9]+/g,
  /dark:border-gray-[0-9]+/g,
  /focus:ring-indigo-500/g,
  /focus:ring-offset-white/g,
];

// Patterns that SHOULD exist after migration
const EXPECTED_PATTERNS = [
  /text-foreground/,
  /text-muted-foreground/,
  /bg-background/,
  /bg-muted/,
  /border-border/,
  /focus-colors/,
];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const goods = [];
  
  // Check for deprecated patterns
  DEPRECATED_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'deprecated',
        pattern: pattern.source,
        matches: matches,
        count: matches.length
      });
    }
  });
  
  // Check for expected patterns
  EXPECTED_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      goods.push({
        type: 'expected',
        pattern: pattern.source
      });
    }
  });
  
  return { issues, goods };
}

function runValidation() {
  console.log('🔍 Post-migration validation...\n');
  
  const vueFiles = glob.sync('src/**/*.vue');
  let totalFiles = 0;
  let filesWithIssues = 0;
  let totalIssues = 0;
  let filesWithNewPatterns = 0;
  
  const allIssues = [];
  
  vueFiles.forEach(filePath => {
    totalFiles++;
    const { issues, goods } = validateFile(filePath);
    
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.reduce((sum, issue) => sum + issue.count, 0);
      allIssues.push({ file: filePath, issues });
      
      console.log(`⚠️  ${filePath}:`);
      issues.forEach(issue => {
        console.log(`   - Found ${issue.count} instances of deprecated pattern: ${issue.pattern}`);
        issue.matches.forEach(match => console.log(`     • ${match}`));
      });
      console.log('');
    }
    
    if (goods.length > 0) {
      filesWithNewPatterns++;
    }
  });
  
  console.log('📊 Validation Summary:');
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files with deprecated patterns: ${filesWithIssues}`);
  console.log(`   Total deprecated pattern instances: ${totalIssues}`);
  console.log(`   Files using new semantic classes: ${filesWithNewPatterns}`);
  
  if (filesWithIssues === 0) {
    console.log('\n✅ Validation passed! No deprecated patterns found.');
  } else {
    console.log('\n⚠️  Validation found issues. Consider running migration again or fixing manually.');
    
    // Suggest fixes
    console.log('\n💡 Quick fixes:');
    console.log('   - Run migration again: npm run migrate-styles');
    console.log('   - Check specific files listed above');
    console.log('   - Some patterns might need manual adjustment');
  }
  
  return { totalFiles, filesWithIssues, totalIssues, filesWithNewPatterns };
}

if (require.main === module) {
  runValidation();
}
