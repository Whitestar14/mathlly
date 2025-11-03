<template>
  <Teleport to="body">
    <!-- Floating Trigger Button -->
     <div class="fixed bottom-0 right-0 z-50">
    <div 
    v-if="settings.experimental?.commandPaletteEnabled && !isOpen">
      <button
          class="bg-background/95 backdrop-blur-xl rounded-t-2xl border border-border/50 border-b-0 shadow-2xl px-4 py-2 flex items-center gap-2 hover:bg-background/95 transition-colors"
          @click="openPalette"
          @touchstart="openPalette"
          aria-label="Open command palette"
        >
            <SearchIcon class="h-5 w-5" />
          </button>
    </div>
  </div>

    <!-- Command Palette Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen && settings.experimental?.commandPaletteEnabled"
        class="fixed inset-0 z-50 flex items-start justify-center pt-16"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        />

        <!-- Command Palette -->
        <div
          ref="paletteRef"
          class="relative w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 pb-3 border-b border-border">
            <h2 class="text-lg font-semibold text-foreground">
              Command Palette
            </h2>
            <BaseButton
              variant="ghost"
              size="icon"
              :aria-label="'Close command palette'"
              @click="close"
            >
              <XIcon class="h-4 w-4" />
            </BaseButton>
          </div>

          <!-- Search Input -->
          <div class="flex items-center px-4 py-3 border-b border-border flex-shrink-0">
            <SearchIcon class="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search commands..."
              class="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground min-w-0"
              :style="{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                WebkitBoxShadow: 'none'
              }"
              @input="handleSearch"
              @focus="handleInputFocus"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              inputmode="search"
            />
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto min-h-0" ref="resultsRef">
            <!-- Recent Commands (when no search) -->
            <div v-if="!searchQuery.trim() && recentCommands.length > 0" class="px-4 py-2 border-b border-border/50">
              <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent</div>
              <div
                v-for="commandId in recentCommands.slice(0, 3)"
                :key="`recent-${commandId}`"
                class="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded hover:bg-muted/50 transition-colors"
                @click="executeRecentCommand(commandId)"
              >
                {{ getCommandById(commandId)?.title }}
              </div>
            </div>

            <!-- No Results -->
            <div v-if="filteredCommands.length === 0" class="px-4 py-8 text-center">
              <p class="text-muted-foreground mb-2">No commands found</p>
              <p class="text-sm text-muted-foreground">{{ searchQuery.trim() ? 'Try adjusting your search' : 'Start typing to search...' }}</p>
            </div>

            <!-- Command Results -->
            <div v-else>
              <div
                v-for="(command, index) in filteredCommands"
                :key="command.id"
                :class="[
                  'px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors select-none',
                  index === selectedIndex ? 'bg-muted' : ''
                ]"
                @click="executeCommand(command)"
                @mouseenter="selectedIndex = index"
                role="option"
                :aria-selected="index === selectedIndex"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="command.icon"
                    class="h-4 w-4 text-muted-foreground flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-foreground">{{ command.title }}</div>
                    <div class="text-sm text-muted-foreground">{{ command.description }}</div>
                  </div>
                  <div v-if="command.shortcut" class="flex gap-1 flex-shrink-0">
                    <kbd
                      v-for="key in command.shortcut.split('+')"
                      :key="key"
                      class="px-2 py-1 text-xs bg-muted rounded border border-border text-muted-foreground"
                    >
                      {{ key }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer with hints -->
          <div class="px-4 py-2 border-t border-border/50 flex-shrink-0">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                  Navigate
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
                  Select
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                  Close
                </span>
              </div>
              <div class="hidden sm:block">
                {{ filteredCommands.length }} command{{ filteredCommands.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventListener, useLocalStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { SearchIcon, XIcon, CalculatorIcon, BinaryIcon, PaletteIcon, HomeIcon, SettingsIcon } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { useSettingsStore } from '@stores/settings'

export interface Command {
  id: string
  title: string
  description: string
  icon: any
  shortcut?: string
  action: () => void
  keywords?: string[]
  category?: string
}

const searchQuery = ref('')
const selectedIndex = ref(0)
const paletteRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const resultsRef = ref<HTMLElement>()

const isOpen = ref(false)

// Recent commands storage
const recentCommands = useLocalStorage<string[]>('command-palette-recent', [])

// Settings store for experimental features
const settings = useSettingsStore()

// Router instance
const router = useRouter()

// Built-in commands
const availableCommands = computed((): Command[] => [
  // Navigation
  {
    id: 'calculator',
    title: 'Open Calculator',
    description: 'Switch to calculator mode',
    icon: CalculatorIcon,
    shortcut: 'Ctrl+K',
    category: 'Navigation',
    action: () => router.push('/calculator')
  },
  {
    id: 'base64',
    title: 'Base64 Tool',
    description: 'Encode and decode Base64 strings',
    icon: BinaryIcon,
    category: 'Tools',
    action: () => router.push('/tools/base64')
  },
  {
    id: 'color',
    title: 'Color Tools',
    description: 'Color manipulation and accessibility tools',
    icon: PaletteIcon,
    category: 'Tools',
    action: () => router.push('/tools/color')
  },
  {
    id: 'home',
    title: 'Home',
    description: 'Go to home page',
    icon: HomeIcon,
    category: 'Navigation',
    action: () => router.push('/')
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Application preferences and configuration',
    icon: SettingsIcon,
    category: 'Navigation',
    action: () => router.push('/settings')
  }
])

const filteredCommands = computed(() => {
  if (!searchQuery.value.trim()) {
    return availableCommands.value
  }

  const query = searchQuery.value.toLowerCase()
  return availableCommands.value.filter(command => {
    const searchableText = [
      command.title,
      command.description,
      command.category || '',
      ...(command.keywords || [])
    ].join(' ').toLowerCase()

    return searchableText.includes(query)
  })
})

const getCommandById = (id: string) => {
  return availableCommands.value.find(cmd => cmd.id === id)
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
}

const executeCommand = (command: typeof availableCommands.value[0]) => {
  command.action()

  // Add to recent commands
  const recentIndex = recentCommands.value.indexOf(command.id)
  if (recentIndex > -1) {
    recentCommands.value.splice(recentIndex, 1)
  }
  recentCommands.value.unshift(command.id)
  recentCommands.value = recentCommands.value.slice(0, 10) // Keep only 10 recent

  close()
}

const executeRecentCommand = (commandId: string) => {
  const command = getCommandById(commandId)
  if (command) {
    executeCommand(command)
  }
}

const handleSearch = () => {
  selectedIndex.value = 0
}

const handleInputFocus = () => {
  // Scroll to top when focusing input on mobile
  if (resultsRef.value) {
    resultsRef.value.scrollTop = 0
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Don't handle if input is focused and user is typing
  if (event.target === searchInputRef.value && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
    case 'Enter':
      event.preventDefault()
      if (filteredCommands.value[selectedIndex.value]) {
        executeCommand(filteredCommands.value[selectedIndex.value])
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        filteredCommands.value.length - 1
      )
      scrollToSelected()
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      scrollToSelected()
      break
    case 'Home':
      event.preventDefault()
      selectedIndex.value = 0
      scrollToSelected()
      break
    case 'End':
      event.preventDefault()
      selectedIndex.value = filteredCommands.value.length - 1
      scrollToSelected()
      break
  }
}

const scrollToSelected = () => {
  if (!resultsRef.value) return

  const selectedElement = resultsRef.value.children[selectedIndex.value] as HTMLElement
  if (selectedElement) {
    selectedElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
}

const openPalette = () => {
  if (settings.experimental?.commandPaletteEnabled) {
    isOpen.value = true
  }
}

// Global keyboard shortcut (only when feature is enabled)
onMounted(() => {
  useEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      if (settings.experimental?.commandPaletteEnabled) {
        isOpen.value = true
      }
    }
  })

  // Handle mobile viewport adjustments
  useEventListener('resize', () => {
    if (isOpen.value && window.innerHeight < 600) {
      // Adjust position for small screens
      if (paletteRef.value) {
        paletteRef.value.style.maxHeight = `${window.innerHeight - 32}px`
      }
    }
  })
})
</script>

<style scoped>
kbd {
  font-family: inherit;
  font-size: inherit;
  font-weight: 500;
}

/* Hide scrollbars but keep functionality */
.overflow-y-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
</style>