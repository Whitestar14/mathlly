<script setup lang="ts">
import { ref, onMounted, computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, DEFAULT_SETTINGS } from '@stores/settings'
import { useKeyboardStore } from '@stores/keyboard'
import { useDeviceStore } from '@stores/device'
import { BasePage, BaseButton } from '@components/ui'
import { useToast } from '@composables/ui/useToast'
import { usePWAInstallPrompt } from '@composables/core/usePWAInstallPrompt'
import type { Settings } from '@services/storage/db'
import { filterByQuery } from '@utils/string/queryFilter'
import { cloneDeep } from '@utils/object/objectUtils'
import { settingsManifest } from '@settings/composables/settingsManifest'
import {
  SettingsSearch,
  StartupSection,
  AppearanceSection,
  AdvancedSection,
  KeyboardSection,
  SettingsActions,
  UnsavedChangesModal,
  ExperimentalSection,
  PrivacySection
} from '@settings/components'

defineProps<Props>()

defineOptions({
  name: 'SettingsPage'
})

interface Props {
  isMobile?: boolean
}

const router = useRouter()
const settingsStore = useSettingsStore()
const keyboardStore = useKeyboardStore()
const { toast } = useToast()
const { dismissedInstall, promptInstall, installPromptSeen, isInstalled, resetDismissal, canInstall } = usePWAInstallPrompt()
const deviceStore = useDeviceStore()

const searchQuery = ref<string>('')
const showUnsavedChangesModal = ref<boolean>(false)
const isSaving = ref<boolean>(false)
const localSettings = ref<Settings>(cloneDeep(DEFAULT_SETTINGS))

const sectionComponents: Record<string, Component> = {
  startup: StartupSection,
  themes: AppearanceSection,
  privacy: PrivacySection,
  keyboard: KeyboardSection,
  experimental: ExperimentalSection,
  advanced: AdvancedSection
}

const visibleSections = computed(() => {
  const filtered = filterByQuery(settingsManifest, searchQuery.value, ['title', 'keywords'])

  return filtered.filter(section => {
    if (section.id === 'keyboard' && deviceStore.isMobile) return false

    return !!sectionComponents[section.id]
  })
})

const storeSnapshot = computed((): Settings => ({
  id: settingsStore.id ?? DEFAULT_SETTINGS.id,
  display: {
    textSize: settingsStore.display?.textSize ?? DEFAULT_SETTINGS.display.textSize
  },
  appearance: {
    animationDisabled:
   settingsStore.appearance?.animationDisabled ??
   DEFAULT_SETTINGS.appearance.animationDisabled,
    checkForUpdates:
   settingsStore.appearance?.checkForUpdates ??
   DEFAULT_SETTINGS.appearance.checkForUpdates,
    borderRadius:
   settingsStore.appearance?.borderRadius ??
   DEFAULT_SETTINGS.appearance.borderRadius
  },
  startup: {
    navigation: settingsStore.startup?.navigation ?? DEFAULT_SETTINGS.startup.navigation
  },
  keyboard: {
    shortcutsEnabled: settingsStore.keyboard?.shortcutsEnabled ?? DEFAULT_SETTINGS.keyboard.shortcutsEnabled
  },
  experimental: {
    commandPaletteEnabled: settingsStore.experimental?.commandPaletteEnabled ?? DEFAULT_SETTINGS.experimental.commandPaletteEnabled,
    devDockEnabled: settingsStore.experimental?.devDockEnabled ?? DEFAULT_SETTINGS.experimental.devDockEnabled,
    homeLayout: settingsStore.experimental?.homeLayout ?? DEFAULT_SETTINGS.experimental.homeLayout
  },
  privacy: {
    crashReportingEnabled: settingsStore.privacy?.crashReportingEnabled ?? DEFAULT_SETTINGS.privacy.crashReportingEnabled
  }
}))

const hasChanges = computed((): boolean => {
  try {
    return (
      JSON.stringify(localSettings.value) !==
   JSON.stringify(storeSnapshot.value)
    )
  } catch(error) {
    console.error('Error comparing settings:', error)
    return false
  }
})

onMounted(async(): Promise<void> => {
  try {
    await settingsStore.loadSettings()
    localSettings.value = cloneDeep(storeSnapshot.value)
  } catch(error) {
    console.error('Error loading settings:', error)
    toast({
      type: 'error',
      title: 'Error loading settings',
      description: 'Using default settings.'
    })
  }
})

const goBack = (): void => {
  if (hasChanges.value) {
    showUnsavedChangesModal.value = true
  }
  router.go(-1)
}

const confirmNavigation = (): void => {
  showUnsavedChangesModal.value = false
}

const cancelNavigation = (): void => {
  showUnsavedChangesModal.value = false
}

const saveSettings = async(): Promise<void> => {
  if (!hasChanges.value) {
    toast({
      title: 'No changes',
      message: 'There are no changes to save.',
      type: 'info'
    })
    return
  }

  isSaving.value = true

  try {
    await settingsStore.saveSettings(localSettings.value)

    toast({
      type: 'success',
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.'
    })

    keyboardStore.syncWithSettings()

    localSettings.value = cloneDeep(storeSnapshot.value)
    router.go(-1)
  } catch(error) {
    toast({
      type: 'error',
      title: 'Error saving settings',
      description: 'There was a problem saving your preferences.'
    })
    console.error('Error saving settings:', error)
  } finally {
    isSaving.value = false
  }
}

const updateSettings = (newSettings: Settings): void => {
  localSettings.value = newSettings
}

const handleManualPWAInstall = async() => {
  if (dismissedInstall.value) {
    resetDismissal()
  }
  await promptInstall()
}

</script>

<template>
  <div>
    <BasePage
      title="Settings"
      :breadcrumbs="[ { label: 'Settings' } ]">
      <div class="space-y-8 mx-auto max-w-4xl">
        <SettingsSearch v-model="searchQuery" />

        <!-- PWA Install Banner -->
        <div
          v-if="(dismissedInstall || installPromptSeen || canInstall) && !isInstalled"
          class="bg-primary/5 border border-primary/5 rounded-md p-3 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-semibold">
              Install Prism App
            </h4>
            <p class="text-xs text-muted-foreground">
              Add the app to your device for quick access and offline support.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton
              variant="primary"
              size="sm"
              @click="handleManualPWAInstall">
              Install
            </BaseButton>
          </div>
        </div>

        <!-- Dynamic Section Loop -->
        <div class="space-y-6">
          <TransitionGroup name="list">
            <component
              :is="sectionComponents[item.id]"
              v-for="item in visibleSections"
              :key="item.id"
              :settings="localSettings"
              :is-visible="true"
              @update:settings="updateSettings" />
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div
          v-if="visibleSections.length === 0 && searchQuery"
          class="text-center py-10">
          <p class="text-foreground text-md">
            No settings found for "{{ searchQuery }}".
          </p>
          <p class="text-sm text-muted-foreground">
            Try a different search term or check tool-specific options in the
            menu.
          </p>
        </div>

        <SettingsActions
          :has-changes="hasChanges"
          :is-loading="isSaving"
          @cancel="goBack"
          @save="saveSettings" />
      </div>
    </BasePage>

    <UnsavedChangesModal
      v-model:open="showUnsavedChangesModal"
      @confirm="confirmNavigation"
      @cancel="cancelNavigation" />
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
