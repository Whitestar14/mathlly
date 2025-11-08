<template>
  <BasePanel id="menu" type="side" title="Menu" position="right" :max-height-ratio="0.85">

    <div class="flex-1 overflow-hidden flex flex-col h-full">

      <div v-if="showToolOptions" class="flex-1 overflow-auto">

        <div v-if="isLoadingOptions" class="p-3 space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-border">
            <div class="w-8 h-8 bg-muted animate-pulse rounded-md"></div>
            <div class="h-4 w-16 bg-muted animate-pulse rounded"></div>
          </div>
          <div class="space-y-3">
            <div class="h-3 w-20 bg-muted animate-pulse rounded"></div>
            <div class="space-y-2">
              <div class="h-4 w-32 bg-muted animate-pulse rounded"></div>
              <div class="h-2 w-full bg-muted animate-pulse rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 w-28 bg-muted animate-pulse rounded"></div>
              <div class="h-2 w-full bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        <ToolOptions
          v-else-if="currentToolOptions" :tool-options="currentToolOptions"
          @close="showToolOptions = false">

          <template #header>
            <div
              class="sticky top-0 z-20 -p-3 bg-backdrop-surface/95 backdrop-blur-md border-b border-border">
              <div class="flex items-center gap-2 p-2">
                <BaseButton
                  variant="ghost" size="icon" class="shrink-0 transition-colors duration-200"
                  @click="showToolOptions = false">
                  <ArrowLeft class="h-4 w-4" />
                </BaseButton>
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold text-foreground">
                    Tool Options
                  </h3>
                </div>
              </div>
            </div>
          </template>
        </ToolOptions>
      </div>

      <div v-else-if="showTroubleshooting" class="flex-1 overflow-auto">
        <div class="space-y-2">
          <div class="sticky top-0 z-20 -p-3 bg-backdrop-surface/95 backdrop-blur-md border-b border-border">
            <div class="flex items-center gap-2 p-2 py-1 md:py-2">
              <BaseButton
                variant="ghost" size="icon" class="shrink-0 transition-colors duration-200"
                @click="showTroubleshooting = false">
                <ArrowLeft class="h-4 w-4" />
              </BaseButton>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-foreground">
                  Troubleshooting
                </h3>
              </div>
            </div>
          </div>

          <div class="px-3 py-1 flex flex-col gap-2">
            <div>
              <p class="text-xs leading-tight text-muted-foreground">If you're encountering issues with application load or facing latent issues, try these options to rectify the issue</p>
            </div>
            <BaseButton
              variant="outline" class="w-full justify-start"
              @click="reloadApplication()">
              <RefreshCw class="size-4" />
              <span>Clear Cache</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col overflow-hidden">

        <div v-if="hasToolOptions || isCheckingOptions" class="flex-shrink-0 p-3 pb-0">
          <BaseButton
            variant="ghost"
            class="w-full justify-start px-3 py-2 h-auto text-muted-foreground rounded-lg border border-border/50 hover:border-border"
            :disabled="isCheckingOptions" @click="handleShowOptions">
            <div
              v-if="isCheckingOptions"
              class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent">
            </div>
            <Settings v-else class="h-4 w-4" />
            <span class="text-sm font-medium">Tool Options</span>
          </BaseButton>
        </div>

        <div class="flex-1"></div>
        <div class="flex-shrink-0 p-3 flex flex-col gap-2 pt-0">
          <BaseButton
            variant="ghost"
            class="w-full flex flex-row justify-between px-3 py-2 h-auto text-muted-foreground rounded-lg border border-border/50 hover:border-border"
            @click="showTroubleshooting = true">
            <span class="flex flex-row items-center gap-2">
              <Wrench class="size-4" />
              <span class="text-sm font-medium">Having Issues?</span>
            </span>

            <span
              class="size-5 flex justify-center items-center bg-secondary p-1 rounded-md"
              aria-label="Open theme settings">
              <ArrowRight class="size-4" />
            </span>
          </BaseButton>

          <div class="flex flex-row md:flex-col gap-2">
            <a
              v-for="link in externalLinks" :key="link.url" :href="link.url" target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-sm flex-1 md:flex-none min-w-0">
              <div
                class="flex-shrink-0 p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200">
                <component
                  :is="link.icon"
                  class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <div class="flex-1 min-w-0 text-center md:text-left">
                <span
                  class="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 block truncate">
                  {{ link.text }}
                </span>
                <span
                  class="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200 hidden md:block">
                  {{ link.description }}
                </span>
              </div>
              <ExternalLinkIcon
                class="h-3 w-3 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-200 flex-shrink-0 hidden md:block" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <BaseButton
            variant="ghost"
            class="px-2 pl-3 py-2 w-full text-sm justify-between flex-row font-medium rounded-lg border border-border/50"
            @click="showThemeModal = true">
            <span class="flex flex-row justify-center items-center">
              <span>Themes</span>

              <div
                class="mx-1 h-[10px] md:hidden w-px bg-border/60 transition-colors duration-200 hover:bg-border/80">
              </div>

              <span class="text-xs text-foreground/40 md:hidden">{{ selectedThemePack }}-{{
                schemeLabel }}</span>
            </span>

            <span
              class="size-5 flex justify-center items-center bg-secondary p-1 rounded-md"
              aria-label="Open theme settings" @click="showThemeModal = true">
              <ArrowRight class="size-4" />
            </span>
          </BaseButton>

          <BaseModal :id="'theme-pack-modal'" v-model:open="showThemeModal">
            <template #title>
              Theme Settings
            </template>

            <section class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">
                Theme Mode
              </h4>
              <SelectBar v-model="selectedTheme" :options="themeOptions" />
              <p class="text-xs text-muted-foreground">
                System mode follows your device preference automatically.
              </p>
            </section>

            <div class="border-t border-border/60 mt-4 pt-4"></div>

            <section class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">
                Theme Pack
              </h4>
              <KeepAlive>
                <ThemePackSelector v-model="selectedThemePack" />
              </KeepAlive>
              <p class="text-xs text-muted-foreground">
                Theme packs change the personality of the interface.
              </p>
            </section>
          </BaseModal>
        </div>
      </div>
    </template>
  </BasePanel>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import {
  AtSign,
  GithubIcon,
  Settings,
  ExternalLinkIcon,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Wrench,
  type LucideIcon
} from 'lucide-vue-next'
import { useTheme } from '@composables/core/useTheme'
import { themeOptions } from '@composables/core/themeConfig'
import { useToolSettingsStore } from '@stores/toolSettings'
import { BasePanel, BaseButton, BaseModal, SelectBar } from '@components/ui'
import ToolOptions from './ToolOptions.vue'
import { ThemePackSelector } from '@settings/components'

interface ExternalLink {
  url: string
  text: string
  description: string
  icon: LucideIcon
}

const { selectedTheme, selectedThemePack, isDark } = useTheme()
const toolStore = useToolSettingsStore()

const showToolOptions = ref(false)
const showTroubleshooting = ref(false)
const isCheckingOptions = ref(false)
const isLoadingOptions = ref(false)

const showThemeModal = ref(false)

const schemeLabel = computed(() => {
  const s = selectedTheme.value as string
  if (s === 'system') {
    return isDark.value ? 'dark' : 'light'
  }
  return s || 'system'
})

const reloadApplication = () => {
  return window.location.reload(true)
}

const hasToolOptions = computed(() => toolStore.hasCurrentToolOptions)
const currentToolOptions = computed(() => toolStore.currentToolConfig)
const currentTool = computed(() => toolStore.currentToolId)

const externalLinks: ExternalLink[] = [
  {
    url: 'https://github.com/Whitestar14/mathlly',
    text: 'Star on GitHub',
    description: 'View source code',
    icon: GithubIcon
  },
  {
    url: 'https://x.com/@xijibomi',
    text: 'Follow on X',
    description: 'Latest updates',
    icon: AtSign
  }
]

const handleShowOptions = async() => {
  if (!currentToolOptions.value) return

  isLoadingOptions.value = true
  showToolOptions.value = true

  await nextTick()
  setTimeout(() => {
    isLoadingOptions.value = false
  }, 150)
}

watch(
  () => currentTool.value,
  (newTool, oldTool) => {
    showToolOptions.value = false
    showTroubleshooting.value = false
    isLoadingOptions.value = false

    if (newTool !== oldTool && newTool) {
      isCheckingOptions.value = true

      nextTick(() => {
        setTimeout(() => {
          isCheckingOptions.value = false
        }, 300)
      })
    } else {
      isCheckingOptions.value = false
    }
  }
)

watch(
  () => hasToolOptions.value,
  hasOptions => {
    if (!hasOptions && showToolOptions.value) {
      showToolOptions.value = false
      showTroubleshooting.value = false
      isLoadingOptions.value = false
    }

    if (hasOptions) {
      isCheckingOptions.value = false
    }
  }
)
</script>
