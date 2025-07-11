#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { migrateFileContent } = require('./migrate-styles');
const { detectComponentType, applyComponentSpecificMigrations } = require('./component-specific-migrations');

// Additional complex patterns that need special handling
const COMPLEX_PATTERNS = [
  // Focus ring patterns
  {
    pattern: /focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500/g,
    replacement: 'focus-colors'
  },
  {
    pattern: /dark:focus:ring-offset-gray-800 dark:focus:ring-indigo-300/g,
    replacement: '' // Already handled by focus-colors
  },
  
  // Gradient patterns
  {
    pattern: /from-gray-50 to-gray-100/g,
    replacement: 'from-muted/50 to-muted'
  },
  {
    pattern: /dark:from-gray-800 dark:to-gray-900/g,
    replacement: 'dark:from-muted/50 dark:to-muted'
  },
  
  // Shadow patterns with gray backgrounds
  {
    pattern: /shadow-lg bg-white/g,
    replacement: 'shadow-lg bg-background'
  },
  {
    pattern: /dark:shadow-lg dark:bg-gray-800/g,
    replacement: 'dark:shadow-lg dark:bg-background'
  }
];

function applyComplexPatterns(content) {
  let migratedContent = content;
  const changes = [];
  
  COMPLEX_PATTERNS.forEach(({ pattern, replacement }) => {
    if (pattern.test(migratedContent)) {
      migratedContent = migratedContent.replace(pattern, replacement);
      changes.push(`Complex pattern: ${pattern.source} → ${replacement}`);
    }
  });
  
  return { content: migratedContent, changes };
}

function runCompleteMigration(filePath, options = {}) {
  const { dryRun = false, verbose = false } = options;
  
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let currentContent = originalContent;
    let allChanges = [];
    
    // Step 1: Basic style migrations
    const basicMigration = migrateFileContent(currentContent, filePath);
    currentContent = basicMigration.content;
    allChanges.push(...basicMigration.changes);
    
    // Step 2: Component-specific migrations
    const componentType = detectComponentType(filePath, currentContent);
    if (componentType) {
      const componentMigration = applyComponentSpecificMigrations(currentContent, componentType);
      currentContent = componentMigration.content;
      allChanges.push(...componentMigration.changes);
    }
    
    // Step 3: Complex pattern migrations
    const complexMigration = applyComplexPatterns(currentContent);
    currentContent = complexMigration.content;
    allChanges.push(...complexMigration.changes);
    
    // Step 4: Apply changes if not dry run
    if (!dryRun && allChanges.length > 0) {
      // Create backup
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, originalContent);
      
      // Write migrated content
      fs.writeFileSync(filePath, currentContent);
      
      if (verbose) {
        console.log(`✅ Migrated: ${filePath}`);
        console.log(`   Component type: ${componentType?.type || 'Generic'}`);
        console.log(`   Changes: ${allChanges.length}`);
        allChanges.forEach(change => console.log(`   - ${change}`));
        console.log(`   Backup: ${backupPath}`);
        console.log('');
      }
      
      return { migrated: true, changes: allChanges.length, componentType: componentType?.type };
    } else if (dryRun && allChanges.length > 0) {
      console.log(`📝 Would migrate: ${filePath}`);
      console.log(`   Component type: ${componentType?.type || 'Generic'}`);
      console.log(`   Potential changes: ${allChanges.length}`);
      if (verbose) {
        allChanges.forEach(change => console.log(`   - ${change}`));
      }
      console.log('');
      
      return { migrated: false, changes: allChanges.length, componentType: componentType?.type };
    }
    
    return { migrated: false, changes: 0, componentType: componentType?.type };
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { migrated: false, changes: 0, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const specificPath = args.find(arg => !arg.startsWith('--'));
  
  console.log(`🚀 Starting ${dryRun ? 'dry run' : 'complete migration'}...\n`);
  
  // Find files to process
  const pattern = specificPath || 'src/**/*.vue';
  const vueFiles = glob.sync(pattern);
  
  if (vueFiles.length === 0) {
    console.log('❌ No Vue files found matching pattern:', pattern);
    return;
  }
  
  let totalFiles = 0;
  let migratedFiles = 0;
  let totalChanges = 0;
  let errors = [];
  let componentTypes = {};

  vueFiles.forEach(filePath => {
    totalFiles++;
    const result = runCompleteMigration(filePath, { dryRun, verbose });
    
    if (result.changes > 0) {
      migratedFiles++;
      totalChanges += result.changes;
    }
    
    if (result.componentType) {
      componentTypes[result.componentType] = (componentTypes[result.componentType] || 0) + 1;
    }
    
    if (result.error) {
      errors.push({ file: filePath, error: result.error });
    }
  });

  console.log('📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files ${dryRun ? 'that would be' : ''} migrated: ${migratedFiles}`);
  console.log(`   Total changes ${dryRun ? 'potential' : 'made'}: ${totalChanges}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (Object.keys(componentTypes).length > 0) {
    console.log('\n🏷️  Component types processed:');
    Object.entries(componentTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} files`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
  }
  
  if (!dryRun) {
    console.log('\n✨ Migration complete!');
    console.log('💡 Tips:');
    console.log('   - Test your application thoroughly');
    console.log('   - Review changes in git diff');
    console.log('   - Run "npm run migrate-styles:restore" to restore backups if needed');
    console.log('   - Remove .backup files when satisfied: find src -name "*.backup" -delete');
  } else {
    console.log('\n💡 To apply these changes, run: npm run migrate-styles');
  }
}

if (require.main === module) {
  main();
}
