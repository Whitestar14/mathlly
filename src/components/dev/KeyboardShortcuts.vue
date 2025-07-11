<template>
  <div class="space-y-4">
    <!-- Shortcuts Overview -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Shortcuts Overview</span>
        <div class="flex items-center gap-2">
          <BaseBadge
            variant="success"
            :text="`${getTotalShortcuts()} shortcuts`"
            size="xs"
          />
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            :disabled="isTestingShortcut"
            @click="testShortcut"
          >
            <ZapIcon 
              class="h-3 w-3"
              :class="{ 'animate-pulse text-yellow-500': isTestingShortcut }"
            />
          </BaseButton>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Categories</span>
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ Object.keys(shortcutCategories).length }}</span>
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Active Listeners</span>
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ activeListeners }}</span>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Filter by Category</span>
        <BaseButton
          v-if="selectedCategory !== 'all'"
          variant="ghost"
          size="sm"
          class="text-xs"
          @click="clearFilter"
        >
          <XIcon class="h-3 w-3 mr-1" />
          Clear
        </BaseButton>
      </div>
      
      <div class="flex flex-wrap gap-1">
        <button
          v-for="category in ['all', ...Object.keys(shortcutCategories)]"
          :key="category"
          class="px-2 py-1 text-xs rounded-md transition-colors"
          :class="[
            selectedCategory === category
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-primary border border-indigo-200 dark:border-indigo-800'
              : 'bg-muted dark:bg-background text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-accent border border-border dark:border-border'
          ]"
          @click="selectedCategory = category"
        >
          {{ category === 'all' ? 'All' : category }}
          <span class="ml-1 opacity-60">
            ({{ category === 'all' ? getTotalShortcuts() : Object.keys(shortcutCategories[category] || {}).length }})
          </span>
        </button>
      </div>
    </div>

    <!-- Shortcuts List -->
    <div class="space-y-2">
      <div
        v-for="(shortcuts, categoryName) in filteredCategories"
        :key="categoryName"
        class="bg-background dark:bg-background border border-border dark:border-border rounded-lg overflow-hidden"
      >
        <!-- Category Header -->
        <div class="p-3 border-b border-border dark:border-border bg-muted dark:bg-background/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component 
                :is="getCategoryIcon(categoryName)" 
                class="h-4 w-4 text-primary dark:text-primary" 
              />
              <h4 class="text-sm font-medium text-foreground dark:text-foreground">
                {{ categoryName }}
              </h4>
              <BaseBadge
                variant="info"
                :text="`${Object.keys(shortcuts).length} shortcuts`"
                size="xs"
              />
            </div>
            
            <div class="flex items-center gap-1">
              <BaseButton
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                @click="copyCategory(categoryName, shortcuts)"
              >
                <CopyIcon class="h-3 w-3" />
              </BaseButton>
              
              <BaseButton
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                @click="toggleCategory(categoryName)"
              >
                <ChevronDownIcon 
                  class="h-3 w-3 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedCategories[categoryName] }"
                />
              </BaseButton>
            </div>
          </div>
        </div>
        
        <!-- Shortcuts Content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div
            v-if="expandedCategories[categoryName]"
            class="overflow-hidden"
          >
            <div class="p-3 space-y-2">
              <div
                v-for="(shortcut, keys) in shortcuts"
                :key="keys"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-muted dark:hover:bg-background/50 transition-colors group"
                @click="highlightShortcut(keys)"
              >
                <div class="flex-1 min-w-0">
                  <span class="text-sm text-foreground dark:text-muted-foreground">{{ shortcut.description }}</span>
                  <div
                    v-if="shortcut.note"
                    class="text-xs text-muted-foreground dark:text-muted-foreground mt-1"
                  >
                    {{ shortcut.note }}
                  </div>
                </div>
                
                <div class="flex items-center gap-2 ml-4">
                  <!-- Test button -->
                  <BaseButton
                    v-if="shortcut.testable"
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    :disabled="isTestingShortcut"
                    @click.stop="testSpecificShortcut(keys)"
                  >
                    <PlayIcon class="h-3 w-3" />
                  </BaseButton>
                  
                  <!-- Copy button -->
                  <BaseButton
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="copyShortcut(keys, shortcut.description)"
                  >
                    <CopyIcon class="h-3 w-3" />
                  </BaseButton>
                  
                  <!-- Keyboard combination -->
                  <div class="flex items-center gap-1">
                    <kbd
                      v-for="(key, index) in formatKeyboardShortcut(keys)"
                      :key="index"
                      class="px-2 py-1 text-xs font-medium bg-background dark:bg-background text-foreground dark:text-muted-foreground rounded border border-border dark:border-border shadow-sm font-mono"
                      :class="{ 
                        'animate-pulse bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700': 
                          highlightedShortcut === keys 
                      }"
                    >
                      {{ key }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center gap-2 mb-2">
        <SearchIcon class="h-4 w-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search shortcuts..."
          class="flex-1 text-sm bg-transparent border-none outline-none text-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400"
        >
        <BaseButton
          v-if="searchQuery"
          variant="ghost"
          size="icon"
          class="h-5 w-5"
          @click="searchQuery = ''"
        >
          <XIcon class="h-3 w-3" />
        </BaseButton>
      </div>
      
      <!-- Search Results -->
      <div
        v-if="searchQuery && searchResults.length > 0"
        class="space-y-1 max-h-32 overflow-y-auto"
      >
        <div
          v-for="result in searchResults"
          :key="`${result.category}-${result.keys}`"
          class="flex items-center justify-between p-2 bg-muted dark:bg-background rounded text-xs"
        >
          <div>
            <span class="text-foreground dark:text-foreground">{{ result.description }}</span>
            <span class="text-muted-foreground dark:text-muted-foreground ml-2">({{ result.category }})</span>
          </div>
          <kbd class="px-1.5 py-0.5 bg-background dark:bg-muted rounded border text-xs font-mono">
            {{ result.keys }}
          </kbd>
        </div>
      </div>
      
      <div
        v-else-if="searchQuery && searchResults.length === 0"
        class="text-xs text-muted-foreground dark:text-muted-foreground text-center py-2"
      >
        No shortcuts found for "{{ searchQuery }}"
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-2">
      <div class="flex gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          @click="expandAll"
        >
          <ExpandIcon class="h-3 w-3 mr-1.5" />
          Expand All
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          @click="collapseAll"
        >
          <ShrinkIcon class="h-3 w-3 mr-1.5" />
          Collapse All
        </BaseButton>
      </div>
      
      <BaseButton
        variant="outline"
        size="sm"
        class="w-full text-xs"
        @click="printShortcutGuide"
      >
        <PrinterIcon class="h-3 w-3 mr-1.5" />
        Print Shortcut Guide
      </BaseButton>
    </div>

    <!-- Export Actions -->
    <div class="pt-3 border-t border-border dark:border-border">
      <div class="flex gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="exportShortcuts"
        >
          <DownloadIcon class="h-3 w-3 mr-1.5" />
          Export All
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="logShortcuts"
        >
          <TerminalIcon class="h-3 w-3 mr-1.5" />
          Log to Console
        </BaseButton>
      </div>
    </div>

    <!-- Development Note -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
      <div class="flex items-start gap-2">
        <InfoIcon class="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div class="text-xs text-amber-700 dark:text-amber-300">
          <p class="font-medium mb-1">
            Development Mode Only
          </p>
          <p>These shortcuts are only available in development mode and on desktop devices. Some shortcuts may require specific contexts to work properly.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  ChevronDownIcon,
  CopyIcon,
  SearchIcon,
  XIcon,
  ZapIcon,
  PlayIcon,
  ExpandIcon,
  ShrinkIcon,
  PrinterIcon,
  DownloadIcon,
  TerminalIcon,
  InfoIcon,
  KeyboardIcon,
  MouseIcon,
  MonitorIcon,
  SettingsIcon,
  CalculatorIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

interface ShortcutInfo {
  description: string
  note?: string
  testable?: boolean
}

interface SearchResult {
  category: string
  keys: string
  description: string
}

const selectedCategory = ref('all')
const searchQuery = ref('')
const expandedCategories = reactive<Record<string, boolean>>({})
const highlightedShortcut = ref('')
const isTestingShortcut = ref(false)
const activeListeners = ref(12) // Mock value - would be dynamic in real implementation

// Enhanced shortcut categories with more details
const shortcutCategories: Record<string, Record<string, ShortcutInfo>> = {
  'Developer Dock': {
    'Ctrl+Shift+D': { 
      description: 'Toggle Developer Dock',
            note: 'Opens/closes the developer tools panel',
      testable: true
    },
    'Ctrl+Shift+P': { 
      description: 'Toggle Performance Panel',
      note: 'Monitor app performance metrics',
      testable: true
    },
    'Ctrl+Shift+S': { 
      description: 'Toggle State Panel',
      note: 'View Pinia store states',
      testable: true
    },
    'Ctrl+Shift+K': { 
      description: 'Toggle Keyboard Shortcuts Panel',
      note: 'View this shortcuts guide',
      testable: true
    }
  },
  'Calculator Navigation': {
    'Ctrl+1': { 
      description: 'Switch to Standard Mode',
      note: 'Basic arithmetic operations',
      testable: true
    },
    'Ctrl+2': { 
      description: 'Switch to Programmer Mode',
      note: 'Binary, hex, and bitwise operations',
      testable: true
    },
    'Ctrl+H': { 
      description: 'Toggle History Panel',
      note: 'Show/hide calculation history',
      testable: true
    },
    'Ctrl+M': { 
      description: 'Toggle Memory Panel',
      note: 'Access memory operations',
      testable: true
    }
  },
  'Calculator Operations': {
    'Enter': { 
      description: 'Calculate Result',
      note: 'Execute the current expression',
      testable: false
    },
    'Escape': { 
      description: 'Clear All',
      note: 'Reset calculator state',
      testable: false
    },
    'Backspace': { 
      description: 'Delete Last Character',
      note: 'Remove the last entered character',
      testable: false
    },
    'Ctrl+C': { 
      description: 'Copy Result',
      note: 'Copy current result to clipboard',
      testable: false
    },
    'Ctrl+V': { 
      description: 'Paste Value',
      note: 'Paste clipboard content',
      testable: false
    }
  },
  'Memory Operations': {
    'Ctrl+Shift+M': { 
      description: 'Memory Store',
      note: 'Store current result in memory',
      testable: false
    },
    'Ctrl+R': { 
      description: 'Memory Recall',
      note: 'Recall value from memory',
      testable: false
    },
    'Ctrl+L': { 
      description: 'Memory Clear',
      note: 'Clear all memory slots',
      testable: false
    },
    'Ctrl+Plus': { 
      description: 'Memory Add',
      note: 'Add current result to memory',
      testable: false
    }
  },
  'Application Navigation': {
    'Ctrl+/': { 
      description: 'Toggle Sidebar',
      note: 'Show/hide main navigation',
      testable: true
    },
    'Ctrl+,': { 
      description: 'Open Settings',
      note: 'Access application settings',
      testable: true
    },
    'Ctrl+Shift+?': { 
      description: 'Show Keyboard Shortcuts',
      note: 'Display this help dialog',
      testable: true
    },
    'Alt+Home': { 
      description: 'Go to Home',
      note: 'Navigate to home page',
      testable: true
    }
  },
  'Theme & Display': {
    'Ctrl+Shift+T': { 
      description: 'Toggle Theme',
      note: 'Switch between light and dark mode',
      testable: true
    },
    'Ctrl+0': { 
      description: 'Reset Zoom',
      note: 'Reset display zoom to default',
      testable: false
    },
    'Ctrl+Plus': { 
      description: 'Zoom In',
      note: 'Increase display zoom',
      testable: false
    },
    'Ctrl+Minus': { 
      description: 'Zoom Out',
      note: 'Decrease display zoom',
      testable: false
    }
  }
}

// Initialize expanded state
Object.keys(shortcutCategories).forEach(category => {
  expandedCategories[category] = true
})

const filteredCategories = computed(() => {
  if (selectedCategory.value === 'all') {
    return shortcutCategories
  }
  return {
    [selectedCategory.value]: shortcutCategories[selectedCategory.value]
  }
})

const searchResults = computed((): SearchResult[] => {
  if (!searchQuery.value) return []
  
  const results: SearchResult[] = []
  const query = searchQuery.value.toLowerCase()
  
  Object.entries(shortcutCategories).forEach(([category, shortcuts]) => {
    Object.entries(shortcuts).forEach(([keys, shortcut]) => {
      if (
        shortcut.description.toLowerCase().includes(query) ||
        keys.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      ) {
        results.push({
          category,
          keys,
          description: shortcut.description
        })
      }
    })
  })
  
  return results.slice(0, 10) // Limit results
})

const getTotalShortcuts = (): number => {
  return Object.values(shortcutCategories).reduce(
    (total, shortcuts) => total + Object.keys(shortcuts).length,
    0
  )
}

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    'Developer Dock': MonitorIcon,
    'Calculator Navigation': CalculatorIcon,
    'Calculator Operations': KeyboardIcon,
    'Memory Operations': SettingsIcon,
    'Application Navigation': MouseIcon,
    'Theme & Display': SettingsIcon
  }
  return iconMap[categoryName] || KeyboardIcon
}

const formatKeyboardShortcut = (keys: string): string[] => {
  return keys.split('+').map(key => {
    // Format special keys
    const keyMap: Record<string, string> = {
      'Ctrl': '⌃',
      'Shift': '⇧',
      'Alt': '⌥',
      'Meta': '⌘',
      'Enter': '↵',
      'Escape': 'Esc',
      'Backspace': '⌫',
      'Plus': '+',
      'Minus': '-'
    }
    return keyMap[key] || key
  })
}

const toggleCategory = (categoryName: string): void => {
  expandedCategories[categoryName] = !expandedCategories[categoryName]
}

const expandAll = (): void => {
  Object.keys(shortcutCategories).forEach(category => {
    expandedCategories[category] = true
  })
}

const collapseAll = (): void => {
  Object.keys(shortcutCategories).forEach(category => {
    expandedCategories[category] = false
  })
}

const clearFilter = (): void => {
  selectedCategory.value = 'all'
}

const highlightShortcut = (keys: string): void => {
  highlightedShortcut.value = keys
  setTimeout(() => {
    highlightedShortcut.value = ''
  }, 2000)
}

const testShortcut = async (): Promise<void> => {
  isTestingShortcut.value = true
  
  // Simulate testing a random shortcut
  const allShortcuts = Object.entries(shortcutCategories).flatMap(([, shortcuts]) => 
    Object.keys(shortcuts)
  )
  const randomShortcut = allShortcuts[Math.floor(Math.random() * allShortcuts.length)]
  
  highlightShortcut(randomShortcut)
  console.log('[Shortcuts] Testing shortcut:', randomShortcut)
  
  setTimeout(() => {
    isTestingShortcut.value = false
  }, 2000)
}

const testSpecificShortcut = async (keys: string): Promise<void> => {
  isTestingShortcut.value = true
  highlightShortcut(keys)
  
  console.log('[Shortcuts] Testing specific shortcut:', keys)
  
  // Simulate shortcut execution
  setTimeout(() => {
    isTestingShortcut.value = false
  }, 1000)
}

const copyShortcut = async (keys: string, description: string): Promise<void> => {
  try {
    const text = `${keys}: ${description}`
    await navigator.clipboard.writeText(text)
    console.log('[Shortcuts] Copied shortcut:', text)
  } catch (err) {
    console.error('[Shortcuts] Failed to copy shortcut:', err)
  }
}

const copyCategory = async (categoryName: string, shortcuts: Record<string, ShortcutInfo>): Promise<void> => {
  try {
    const text = Object.entries(shortcuts)
      .map(([keys, shortcut]) => `${keys}: ${shortcut.description}`)
      .join('\n')
    
    await navigator.clipboard.writeText(`${categoryName}:\n${text}`)
    console.log('[Shortcuts] Copied category:', categoryName)
  } catch (err) {
    console.error('[Shortcuts] Failed to copy category:', err)
  }
}

const exportShortcuts = async (): Promise<void> => {
  try {
    const exportData = {
      shortcuts: shortcutCategories,
      totalShortcuts: getTotalShortcuts(),
      categories: Object.keys(shortcutCategories).length,
      timestamp: new Date().toISOString(),
      platform: navigator.platform,
      userAgent: navigator.userAgent
    }
    
    const text = JSON.stringify(exportData, null, 2)
    await navigator.clipboard.writeText(text)
    console.log('[Shortcuts] All shortcuts exported to clipboard')
  } catch (err) {
    console.error('[Shortcuts] Failed to export shortcuts:', err)
  }
}

const logShortcuts = (): void => {
  console.group('[Shortcuts] All Keyboard Shortcuts')
  Object.entries(shortcutCategories).forEach(([category, shortcuts]) => {
    console.group(`Category: ${category}`)
    Object.entries(shortcuts).forEach(([keys, shortcut]) => {
      console.log(`${keys}: ${shortcut.description}${shortcut.note ? ` (${shortcut.note})` : ''}`)
    })
    console.groupEnd()
  })
  console.groupEnd()
}

const printShortcutGuide = (): void => {
  // Create a printable version
  const printContent = Object.entries(shortcutCategories)
    .map(([category, shortcuts]) => {
      const shortcutList = Object.entries(shortcuts)
        .map(([keys, shortcut]) => `  ${keys}: ${shortcut.description}`)
        .join('\n')
      return `${category}:\n${shortcutList}`
    })
    .join('\n\n')
  
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Mathlly - Keyboard Shortcuts</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            h1 { color: #4f46e5; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Mathlly - Keyboard Shortcuts</h1>
          <pre>${printContent}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}
</script>
