#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

// Additional patterns that were missed in the first pass
const ADDITIONAL_MAPPINGS = {
  // Specific gray shades that need context-aware mapping
  'border-gray-100': 'border-border',
  'border-gray-500': 'border-border',
  'border-gray-900': 'border-border',
  'dark:border-gray-900': 'dark:border-border',
  
  'text-gray-200': 'text-muted-foreground',
  
  'bg-gray-300': 'bg-muted',
  'bg-gray-600': 'bg-muted',
  'bg-gray-700': 'bg-muted',
  
  'hover:bg-gray-600': 'hover:bg-accent',
  'hover:text-gray-200': 'hover:text-accent-foreground',
  
  // Focus ring fix
  'focus:ring-offset-white': '', // Remove this as it's handled by focus-colors
};

// Context-aware replacements for specific components
const CONTEXT_AWARE_FIXES = {
  // Dev components often use darker grays for contrast
  'dev/': {
    'bg-gray-700': 'bg-muted/80',
    'bg-gray-600': 'bg-muted/60',
    'text-gray-200': 'text-muted-foreground',
    'hover:bg-gray-600': 'hover:bg-accent/80',
    'hover:text-gray-200': 'hover:text-accent-foreground',
  },
  
  // Activity panels might need different contrast
  'ActivityPanel': {
    'bg-gray-300': 'bg-muted/50',
  },
  
  // History items need good contrast for readability
  'HistoryItem': {
    'bg-gray-600': 'bg-muted/60',
    'bg-gray-300': 'bg-muted/30',
    'hover:bg-gray-600': 'hover:bg-accent/60',
  }
};

function getContextualMapping(filePath, className) {
  // Check for context-specific mappings
  for (const [context, mappings] of Object.entries(CONTEXT_AWARE_FIXES)) {
    if (filePath.includes(context)) {
      if (mappings[className]) {
        return mappings[className];
      }
    }
  }
  
  // Fall back to general mapping
  return ADDITIONAL_MAPPINGS[className];
}

function fixRemainingPatterns(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const changes = [];
    
    // Apply additional mappings with context awareness
    Object.keys(ADDITIONAL_MAPPINGS).forEach(oldClass => {
      const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(fixedContent)) {
        const newClass = getContextualMapping(filePath, oldClass);
        
        if (newClass === '') {
          // Remove the class entirely
          fixedContent = fixedContent.replace(regex, '');
          // Clean up any double spaces
          fixedContent = fixedContent.replace(/\s+/g, ' ');
          changes.push(`Removed: ${oldClass}`);
        } else {
          fixedContent = fixedContent.replace(regex, newClass);
          changes.push(`${oldClass} → ${newClass}`);
        }
      }
    });
    
    // Special handling for focus ring patterns
    const focusRingPattern = /focus:ring-2\s+focus:ring-offset-2\s+focus:ring-offset-white\s+focus:ring-indigo-500/g;
    if (focusRingPattern.test(fixedContent)) {
      fixedContent = fixedContent.replace(focusRingPattern, 'focus-colors');
      changes.push('Replaced complex focus pattern with focus-colors');
    }
    
    // Clean up any remaining focus:ring-offset-white
    const offsetWhitePattern = /focus:ring-offset-white\s*/g;
    if (offsetWhitePattern.test(fixedContent)) {
      fixedContent = fixedContent.replace(offsetWhitePattern, '');
      changes.push('Removed focus:ring-offset-white');
    }
    
    if (changes.length > 0) {
      // Create backup if it doesn't exist
      const backupPath = `${filePath}.backup2`;
      if (!fs.existsSync(`${filePath}.backup`) && !fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
      }
      
      fs.writeFileSync(filePath, fixedContent);
      
      console.log(`✅ Fixed: ${filePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
      console.log('');
      
      return { fixed: true, changes: changes.length };
    }
    
    return { fixed: false, changes: 0 };
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return { fixed: false, changes: 0, error: error.message };
  }
}

function main() {
  console.log('🔧 Fixing remaining deprecated patterns...\n');
  
  // Target the specific files that had issues
  const problematicFiles = [
    'src/layouts/navigation/HomePage.vue',
    'src/layouts/navigation/ErrorFallback.vue',
    'src/layouts/info/UpdatePage.vue',
    'src/layouts/calculators/main/ActivityPanel.vue',
    'src/components/ui/UpdateNotification.vue',
    'src/components/ui/ToggleBar.vue',
    'src/components/ui/OfflineIndicator.vue',
    'src/components/ui/HistoryItem.vue',
    'src/components/ui/ControlButtons.vue',
    'src/components/panel/BottomPanel.vue',
    'src/components/dev/StatePanel.vue',
    'src/components/dev/MobileDevDock.vue',
    'src/components/dev/KeyboardShortcuts.vue',
    'src/components/dev/DockToolbar.vue',
    'src/components/dev/DockItem.vue',
    'src/components/dev/DevPanel.vue',
    'src/components/dev/DesktopDevDock.vue',
    'src/components/base/BaseDropdownItem.vue'
  ];
  
  let totalFiles = 0;
  let fixedFiles = 0;
  let totalChanges = 0;
  let errors = [];
  
  problematicFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      totalFiles++;
      const result = fixRemainingPatterns(filePath);
      
      if (result.fixed) {
        fixedFiles++;
        totalChanges += result.changes;
      }
      
      if (result.error) {
        errors.push({ file: filePath, error: result.error });
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log('📊 Fix Summary:');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Total changes: ${totalChanges}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
  }
  
  console.log('\n✨ Remaining patterns fix complete!');
}

if (require.main === module) {
  main();
}
