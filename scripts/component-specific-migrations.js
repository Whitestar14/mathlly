#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Component-specific migration patterns
const COMPONENT_PATTERNS = {
  // Button components
  'Button': {
    patterns: [
      {
        from: /bg-white.*?border-gray-200.*?text-gray-900/g,
        to: 'bg-background border-border text-foreground'
      },
      {
        from: /hover:bg-gray-50/g,
        to: 'hover:bg-accent'
      }
    ]
  },
  
  // Input components
  'Input': {
    patterns: [
      {
        from: /border-gray-300.*?focus:border-indigo-500/g,
        to: 'border-input focus:border-ring'
      },
      {
        from: /placeholder-gray-400/g,
        to: 'placeholder-muted-foreground'
      }
    ]
  },
  
  // Modal/Dialog components
  'Modal|Dialog': {
    patterns: [
      {
        from: /bg-white.*?shadow-xl/g,
        to: 'bg-background shadow-xl'
      },
      {
        from: /bg-gray-500\/75/g,
        to: 'bg-background/80'
      }
    ]
  },
  
  // Card components
  'Card': {
    patterns: [
      {
        from: /bg-white.*?border.*?border-gray-200/g,
        to: 'bg-card border border-border'
      }
    ]
  }
};

function detectComponentType(filePath, content) {
  const fileName = path.basename(filePath, '.vue');
  
  // Check for component patterns
  for (const [pattern, config] of Object.entries(COMPONENT_PATTERNS)) {
    if (new RegExp(pattern, 'i').test(fileName) || new RegExp(pattern, 'i').test(content)) {
      return { type: pattern, config };
    }
  }
  
  return null;
}

function applyComponentSpecificMigrations(content, componentType) {
  let migratedContent = content;
  const changes = [];
  
  if (componentType && COMPONENT_PATTERNS[componentType.type]) {
    const patterns = COMPONENT_PATTERNS[componentType.type].patterns;
    
    patterns.forEach(({ from, to }) => {
      if (from.test(migratedContent)) {
        migratedContent = migratedContent.replace(from, to);
        changes.push(`Component-specific: ${from.source} → ${to}`);
      }
    });
  }
  
  return { content: migratedContent, changes };
}

module.exports = { detectComponentType, applyComponentSpecificMigrations, COMPONENT_PATTERNS };
