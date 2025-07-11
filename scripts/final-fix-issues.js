#!/usr/bin/env node

const fs = require('fs');

function fixFeatureCard() {
  const filePath = 'src/components/cards/FeatureCard.vue';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ FeatureCard.vue not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the remaining hardcoded colors
  content = content.replace(/bg-background dark:bg-background/g, 'bg-card dark:bg-card');
  content = content.replace(/border-border dark:border-border/g, 'border-border dark:border-border');
  content = content.replace(/bg-indigo-100 dark:bg-indigo-900\/50/g, 'bg-primary/10 dark:bg-primary/20');
  content = content.replace(/text-lg(?!\w)/g, 'text-lg text-card-foreground dark:text-card-foreground');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed FeatureCard.vue');
}

function fixButtonContrast() {
  const filePath = 'src/assets/css/buttons.css';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ buttons.css not found');
    return;
  }
  
  // The button fixes are already provided above - just log that it needs manual update
  console.log('⚠️  Please update buttons.css with the provided contrast fixes');
}

function addBorderRadiusToKeyComponents() {
  const files = [
    'src/components/cards/FeatureCard.vue',
    'src/components/base/BasePanel.vue',
    'src/components/base/BaseModal.vue',
    'src/components/base/BaseInput.vue',
    'src/components/base/BaseButton.vue'
  ];
  
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filePath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Add rounded classes where missing
    const patterns = [
      // Cards and panels without rounded
      {
        pattern: /class="([^"]*(?:bg-card|bg-background|bg-muted|border)[^"]*)"(?![^>]*rounded)/g,
        replacement: (match) => {
          if (!match.includes('rounded')) {
            return match.replace('class="', 'class="rounded-lg ');
          }
          return match;
        }
      },
      // Buttons without rounded
      {
        pattern: /class="([^"]*btn[^"]*)"(?![^>]*rounded)/g,
        replacement: (match) => {
          if (!match.includes('rounded')) {
            return match.replace('class="', 'class="rounded-md ');
          }
          return match;
        }
      }
    ];
    
    patterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, (match) => {
        const result = replacement(match);
        if (result !== match) changes++;
        return result;
      });
      content = newContent;
    });
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added border radius to ${filePath} (${changes} changes)`);
    }
  });
}

function main() {
  console.log('🔧 Fixing final design issues...\n');
  
  // Fix FeatureCard
  fixFeatureCard();
  
  // Note about button contrast
  fixButtonContrast();
  
  // Add border radius to key components
  addBorderRadiusToKeyComponents();
  
  console.log('\n✨ Final fixes complete!');
  console.log('\n📋 Manual steps needed:');
  console.log('1. Update src/assets/css/buttons.css with the provided contrast fixes');
  console.log('2. Test button contrast in both Classic and Mira themes');
  console.log('3. Decide if you want border-radius globally (currently sharp corners by design)');
}

if (require.main === module) {
  main();
}
