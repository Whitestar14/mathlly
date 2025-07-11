#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Style mapping from old Tailwind classes to new semantic classes
const STYLE_MAPPINGS = {
  // Text colors
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-100': 'text-foreground',
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  
  // Dark mode text colors
  'dark:text-gray-100': 'dark:text-foreground',
  'dark:text-gray-200': 'dark:text-foreground',
  'dark:text-gray-300': 'dark:text-foreground',
  'dark:text-gray-400': 'dark:text-muted-foreground',
  'dark:text-gray-500': 'dark:text-muted-foreground',
  'dark:text-gray-600': 'dark:text-muted-foreground',
  'dark:text-white': 'dark:text-foreground',
  
  // Background colors
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-800': 'bg-background',
  'bg-gray-900': 'bg-background',
  'bg-black': 'bg-background',
  
  // Dark mode backgrounds
  'dark:bg-gray-800': 'dark:bg-background',
  'dark:bg-gray-900': 'dark:bg-background',
  'dark:bg-gray-700': 'dark:bg-muted',
  'dark:bg-gray-600': 'dark:bg-muted',
  'dark:bg-black': 'dark:bg-background',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border',
  'border-gray-600': 'border-border',
  'border-gray-700': 'border-border',
  'dark:border-gray-600': 'dark:border-border',
  'dark:border-gray-700': 'dark:border-border',
  'dark:border-gray-800': 'dark:border-border',
  
  // Hover states
  'hover:bg-gray-50': 'hover:bg-accent',
  'hover:bg-gray-100': 'hover:bg-accent',
  'hover:bg-gray-200': 'hover:bg-accent',
  'hover:bg-gray-700': 'hover:bg-accent',
  'hover:bg-gray-800': 'hover:bg-accent',
  'dark:hover:bg-gray-700': 'dark:hover:bg-accent',
  'dark:hover:bg-gray-800': 'dark:hover:bg-accent',
  
  'hover:text-gray-900': 'hover:text-accent-foreground',
  'hover:text-gray-800': 'hover:text-accent-foreground',
  'hover:text-gray-100': 'hover:text-accent-foreground',
  'dark:hover:text-gray-100': 'dark:hover:text-accent-foreground',
  'dark:hover:text-gray-300': 'dark:hover:text-accent-foreground',
  
  // Primary colors (keep indigo as primary)
  'text-indigo-600': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-400': 'text-primary',
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-500': 'bg-primary',
  'border-indigo-500': 'border-primary',
  'ring-indigo-500': 'ring-ring',
  'focus:ring-indigo-500': 'focus:ring-ring',
  
  // Dark mode primary
  'dark:text-indigo-400': 'dark:text-primary',
  'dark:text-indigo-300': 'dark:text-primary',
  'dark:bg-indigo-500': 'dark:bg-primary',
  'dark:border-indigo-400': 'dark:border-primary',
  'dark:ring-indigo-300': 'dark:ring-ring',
  'dark:focus:ring-indigo-300': 'dark:focus:ring-ring',
  
  // Destructive colors (keep red)
  'text-red-600': 'text-destructive',
  'text-red-500': 'text-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-red-500': 'bg-destructive',
  'bg-red-50': 'bg-destructive/5',
  'border-red-200': 'border-destructive/20',
  'border-red-600': 'border-destructive',
  
  // Dark mode destructive
  'dark:text-red-400': 'dark:text-destructive',
  'dark:bg-red-500': 'dark:bg-destructive',
  'dark:bg-red-900/20': 'dark:bg-destructive/5',
  'dark:border-red-800': 'dark:border-destructive/20',
};

// Complex pattern mappings that need regex
const PATTERN_MAPPINGS = [
  // Opacity variations
  {
    pattern: /text-gray-(\d+)\/(\d+)/g,
    replacement: (match, shade, opacity) => {
      const baseClass = shade >= 500 ? 'text-muted-foreground' : 'text-foreground';
      return `${baseClass}/${opacity}`;
    }
  },
  {
    pattern: /bg-gray-(\d+)\/(\d+)/g,
    replacement: (match, shade, opacity) => {
      const baseClass = shade >= 500 ? 'bg-muted' : 'bg-background';
      return `${baseClass}/${opacity}`;
    }
  },
  {
    pattern: /dark:text-gray-(\d+)\/(\d+)/g,
    replacement: (match, shade, opacity) => {
      const baseClass = shade >= 500 ? 'dark:text-muted-foreground' : 'dark:text-foreground';
      return `${baseClass}/${opacity}`;
    }
  },
  {
    pattern: /dark:bg-gray-(\d+)\/(\d+)/g,
    replacement: (match, shade, opacity) => {
      const baseClass = shade >= 500 ? 'dark:bg-muted' : 'dark:bg-background';
      return `${baseClass}/${opacity}`;
    }
  }
];

function migrateFileContent(content, filePath) {
  let migratedContent = content;
  let changesMade = [];

  // Apply simple mappings
  Object.entries(STYLE_MAPPINGS).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    if (regex.test(migratedContent)) {
      migratedContent = migratedContent.replace(regex, newClass);
      changesMade.push(`${oldClass} → ${newClass}`);
    }
  });

  // Apply pattern mappings
  PATTERN_MAPPINGS.forEach(({ pattern, replacement }) => {
    if (pattern.test(migratedContent)) {
      migratedContent = migratedContent.replace(pattern, replacement);
      changesMade.push(`Applied pattern: ${pattern.source}`);
    }
  });

  return { content: migratedContent, changes: changesMade };
}

function migrateFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const { content: migratedContent, changes } = migrateFileContent(originalContent, filePath);
    
    if (changes.length > 0) {
      // Create backup
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, originalContent);
      
      // Write migrated content
      fs.writeFileSync(filePath, migratedContent);
      
      console.log(`✅ Migrated: ${filePath}`);
      console.log(`   Changes: ${changes.length}`);
      changes.forEach(change => console.log(`   - ${change}`));
      console.log(`   Backup: ${backupPath}`);
      console.log('');
      
      return { migrated: true, changes: changes.length };
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
      return { migrated: false, changes: 0 };
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return { migrated: false, changes: 0, error: error.message };
  }
}

function main() {
  console.log('🚀 Starting style migration...\n');
  
  // Find all Vue files
  const vueFiles = glob.sync('src/**/*.vue');
  
  let totalFiles = 0;
  let migratedFiles = 0;
  let totalChanges = 0;
  let errors = [];

  vueFiles.forEach(filePath => {
    totalFiles++;
    const result = migrateFile(filePath);
    
    if (result.migrated) {
      migratedFiles++;
      totalChanges += result.changes;
    }
    
    if (result.error) {
      errors.push({ file: filePath, error: result.error });
    }
  });

  console.log('📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files migrated: ${migratedFiles}`);
  console.log(`   Total changes made: ${totalChanges}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
  }
  
  console.log('\n✨ Migration complete!');
  console.log('💡 Tip: Review the changes and remove .backup files when satisfied.');
}

if (require.main === module) {
  main();
}

module.exports = { migrateFileContent, STYLE_MAPPINGS, PATTERN_MAPPINGS };
