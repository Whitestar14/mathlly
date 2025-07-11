#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const { migrateFileContent } = require('./migrate-styles');

function dryRun() {
  console.log('🔍 Dry run - analyzing potential changes...\n');
  
  const vueFiles = glob.sync('src/**/*.vue');
  
  let totalFiles = 0;
  let filesWithChanges = 0;
  let totalChanges = 0;

  vueFiles.forEach(filePath => {
    totalFiles++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { changes } = migrateFileContent(content, filePath);
      
      if (changes.length > 0) {
        filesWithChanges++;
        totalChanges += changes.length;
        
        console.log(`📝 ${filePath}:`);
        changes.forEach(change => console.log(`   - ${change}`));
        console.log('');
      }
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  });

  console.log('📊 Dry Run Summary:');
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   Files that would be changed: ${filesWithChanges}`);
  console.log(`   Total changes: ${totalChanges}`);
  console.log('\n💡 Run "npm run migrate-styles" to apply these changes.');
}

if (require.main === module) {
  dryRun();
}
