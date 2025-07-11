<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { SearchIcon, CircleHelp, AlertTriangle, Palette, Sparkles } from "lucide-vue-next"
import { filterByQuery } from "@/utils/misc/queryFilter"
import { useSettingsStore, DEFAULT_SETTINGS } from "@/stores/settings.ts"
import { useToast } from "@/composables/useToast"
import { useTheme } from "@/composables/useTheme"
import { cloneDeep } from "@/utils/misc/objectUtils.ts"
import BasePage from "@/components/base/BasePage.vue"
import BaseInput from "@/components/base/BaseInput.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import Select from "@/components/ui/SelectBar.vue"
import Switch from "@/components/ui/ToggleBar.vue"
import Button from "@/components/base/BaseButton.vue"
import Collapsible from '@/components/base/BaseCollapsible.vue'
import { RadioGroupRoot, RadioGroupItem } from 'radix-vue'
import { resetDatabase } from "@/data/db"

defineOptions({
  name: "SettingsPage"
})

const router = useRouter()
const settingsStore = useSettingsStore()
const { toast } = useToast()
const { themePackConfigs } = useTheme()
const searchQuery = ref('')
const showUnsavedChangesModal = ref(false)
const showResetDatabaseModal = ref(false)
const isResettingDatabase = ref(false)

const settingsManifest = [
  { id: 'display', title: 'Display Settings', icon: 'MonitorIcon', keywords: ['precision', 'decimal places', 'fractions', 'syntax highlighting', 'number formatting', 'thousands separator', 'comma', 'binary', 'hexadecimal', 'octal', 'font', 'appearance', 'text size'] },
  { id: 'calculator', title: 'Calculator Mode', icon: 'CalculatorIcon', keywords: ['mode', 'standard', 'programmer', 'scientific', 'default calculator'] },
  { id: 'startup', title: 'Startup Preferences', icon: 'PowerIcon', keywords: ['launch', 'open page', 'initial screen', 'home', 'calculator page', 'last visited', 'boot'] },
  { id: 'themes', title: 'Themes & Preferences', icon: 'PaletteIcon', keywords: ['color theme', 'appearance', 'light mode', 'dark mode', 'system theme', 'animations', 'disable transitions', 'visuals', 'text size', 'theme pack', 'classic', 'mira', 'vercel', 'shadcn'] },
  { id: 'advanced', title: 'Advanced Settings', icon: 'SettingsIcon', keywords: ['reset', 'database', 'clear', 'troubleshoot', 'fix', 'issues', 'problems', 'data', 'storage'] }
]

const filteredManifest = computed(() =>
  filterByQuery(settingsManifest, searchQuery.value, ['title', 'keywords'])
)

const isRendered = (sectionId) => {
  return filteredManifest.value.some(section => section.id === sectionId)
}

// Single source of truth - get settings directly from the store
const localSettings = ref(cloneDeep(DEFAULT_SETTINGS))

// Create a snapshot of the current store state
const storeSnapshot = computed(() => ({
  display: {
    precision: settingsStore.display?.precision ?? DEFAULT_SETTINGS.display.precision,
    useFractions: settingsStore.display?.useFractions ?? DEFAULT_SETTINGS.display.useFractions,
    formatting: {
      useThousandsSeparator: settingsStore.display?.formatting?.useThousandsSeparator ?? DEFAULT_SETTINGS.display.formatting.useThousandsSeparator,
      formatBinary: settingsStore.display?.formatting?.formatBinary ?? DEFAULT_SETTINGS.display.formatting.formatBinary,
      formatHexadecimal: settingsStore.display?.formatting?.formatHexadecimal ?? DEFAULT_SETTINGS.display.formatting.formatHexadecimal,
      formatOctal: settingsStore.display?.formatting?.formatOctal ?? DEFAULT_SETTINGS.display.formatting.formatOctal,
    },
    syntaxHighlighting: settingsStore.display?.syntaxHighlighting ?? DEFAULT_SETTINGS.display.syntaxHighlighting,
    textSize: settingsStore.display?.textSize ?? DEFAULT_SETTINGS.display.textSize
  },
  calculator: {
    mode: settingsStore.calculator?.mode ?? DEFAULT_SETTINGS.calculator.mode,
  },
  appearance: {
    theme: settingsStore.appearance?.theme ?? DEFAULT_SETTINGS.appearance.theme,
    themePack: settingsStore.appearance?.themePack ?? DEFAULT_SETTINGS.appearance.themePack,
    animationDisabled: settingsStore.appearance?.animationDisabled ?? DEFAULT_SETTINGS.appearance.animationDisabled,
    checkForUpdates: settingsStore.appearance?.checkForUpdates ?? DEFAULT_SETTINGS.appearance.checkForUpdates,
  },
  startup: {
    navigation: settingsStore.startup?.navigation ?? DEFAULT_SETTINGS.startup.navigation,
  }
}))

const hasChanges = computed(() => {
  try {
    return JSON.stringify(localSettings.value) !== JSON.stringify(storeSnapshot.value)
  } catch (error) {
    console.error('Error comparing settings:', error)
    return false
  }
})

const precisionOptions = Array.from({ length: 11 }, (_, i) => ({ value: i, label: i.toString() }))
const modeOptions = [
  { value: "Standard", label: "Standard" },
  { value: "Scientific", label: "Scientific" },
  { value: "Programmer", label: "Programmer" }
]
const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" }
]
const themePackOptions = [
  { value: "classic", label: "Classic" },
  { value: "mira", label: "Mira" }
]
const startupOptions = [
  { value: 'home', label: 'Home' },
  { value: 'calculator', label: 'Calculator Page' },
  { value: 'last-visited', label: 'Last Visited Page' }
]
const textSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
]

onMounted(async () => {
  try {
    await settingsStore.loadSettings()
    localSettings.value = cloneDeep(storeSnapshot.value)
  } catch (error) {
    console.error('Error loading settings:', error)
    toast({
      type: "error",
      title: "Error loading settings",
      description: "Using default settings."
    })
  }
})

const goBack = () => {
  if (hasChanges.value) {
    showUnsavedChangesModal.value = true
  } else {
    router.go(-1)
  }
}

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false
  router.go(-1)
}

const cancelNavigation = () => {
  showUnsavedChangesModal.value = false
}

const saveSettings = async () => {
  if (!hasChanges.value) {
    toast({ title: "No changes", message: "There are no changes to save.", type: "info" })
    return
  }

  try {
    await settingsStore.saveSettings(localSettings.value)

    toast({
      type: "success",
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    })

    localSettings.value = cloneDeep(storeSnapshot.value)
    router.go(-1)
  } catch (error) {
    toast({
      type: "error",
      title: "Error saving settings",
      description: "There was a problem saving your preferences."
    })
    console.error("Error saving settings:", error)
  }
}

const showResetConfirmation = () => {
  showResetDatabaseModal.value = true
}

const handleResetDatabase = async () => {
  isResettingDatabase.value = true

  try {
    const success = await resetDatabase()

    if (!success) throw new Error("Failed to reset database")
  } catch (error) {
    isResettingDatabase.value = false
    showResetDatabaseModal.value = false

    toast({
      type: "error",
      title: "Reset Failed",
      description: "There was a problem resetting your database. Please try again."
    })

    console.error("Error resetting database:", error)
  }
}

const cancelResetDatabase = () => {
  showResetDatabaseModal.value = false
}
</script>

<template>
  <div>
    <BasePage title="Settings">
      <div class="space-y-8 mx-auto max-w-4xl">
        <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6">
          <div class="relative w-full sm:w-64">
            <BaseInput v-model="searchQuery" placeholder="Search settings..." :icon="SearchIcon" :autofocus="true"
              aria-label="Search settings" />
          </div>
        </div>

        <Collapsible v-if="isRendered('display')" id="display" title="Display Settings" icon="Monitor"
          :default-open="true">
          <div class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="precision" class="text-sm font-medium text-foreground mb-1.5 block">Precision</label>
                <Select v-model="localSettings.display.precision" :options="precisionOptions" />
                <p class="mt-1 text-xs text-muted-foreground">
                  Set the number of decimal places to display in calculation results
                </p>
              </div>

              <div>
                <label for="textSize" class="text-sm font-medium text-foreground mb-1.5 block">Text Size</label>
                <div class="mt-2">
                  <RadioGroupRoot v-model="localSettings.display.textSize"
                    class="inline-flex items-center rounded-md bg-muted p-1">
                    <div class="flex space-x-1">
                      <RadioGroupItem v-for="option in textSizeOptions" :key="option.value" :value="option.value"
                        class="rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        :class="[
                          localSettings.display.textSize === option.value
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        ]">
                        {{ option.label }}
                      </RadioGroupItem>
                    </div>
                  </RadioGroupRoot>
                </div>
                <p class="mt-1 text-xs text-muted-foreground">
                  Adjust the size of text throughout the application
                </p>
              </div>

              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <label for="useFractions" class="text-sm font-medium text-foreground">Use Fractions</label>
                  <p class="text-xs text-muted-foreground">
                    Display results as fractions when possible
                  </p>
                </div>
                <Switch v-model="localSettings.display.useFractions" />
              </div>

              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <div class="flex items-center gap-2">
                    <label for="syntaxHighlighting" class="text-sm font-medium text-foreground">Syntax
                      Highlighting</label>
                    <CircleHelp
                      v-tippy="{ content: 'Experimental feature. Performance may be affected on complex calculations', placement: 'top', onShow() { return true } }"
                      class="h-4 w-4 cursor-help" />
                  </div>
                  <p class="text-xs text-muted-foreground">
                    Highlight numbers, operators, and functions with different colors
                  </p>
                </div>
                <Switch v-model="localSettings.display.syntaxHighlighting" />
              </div>

              <div class="space-y-2 pt-3 border-t border-border">
                <h3 class="text-sm font-medium text-foreground">
                  Number Formatting
                </h3>
                <div class="flex items-center justify-between py-2">
                  <div class="max-w-[80%]">
                    <label for="useThousandsSeparator" class="text-sm text-foreground">Use Thousands Separator</label>
                    <p class="text-xs text-muted-foreground">
                      Add commas to separate thousands in large numbers
                    </p>
                  </div>
                  <Switch v-model="localSettings.display.formatting.useThousandsSeparator" />
                </div>

                <div class="flex items-center justify-between py-2">
                  <div class="max-w-[80%]">
                    <label class="text-sm text-foreground">Binary Numbers</label>
                    <p class="text-xs text-muted-foreground">
                      Format binary numbers for better readability
                    </p>
                  </div>
                  <Switch v-model="localSettings.display.formatting.formatBinary" />
                </div>

                <div class="flex items-center justify-between py-2">
                  <div class="max-w-[80%]">
                    <label class="text-sm text-foreground">Hexadecimal Numbers</label>
                    <p class="text-xs text-muted-foreground">
                      Format hexadecimal numbers for better readability
                    </p>
                  </div>
                  <Switch v-model="localSettings.display.formatting.formatHexadecimal" />
                </div>

                <div class="flex items-center justify-between py-2">
                  <div class="max-w-[80%]">
                    <label class="text-sm text-foreground">Octal Numbers</label>
                    <p class="text-xs text-muted-foreground">
                      Format octal numbers for better readability
                    </p>
                  </div>
                  <Switch v-model="localSettings.display.formatting.formatOctal" />
                </div>
              </div>
            </div>
          </div>
        </Collapsible>

        <Collapsible v-if="isRendered('calculator')" id="calculator" title="Calculator Mode" icon="Calculator"
          :default-open="true">
          <div>
            <label for="mode" class="text-sm font-medium text-foreground mb-1.5 block">Default Mode</label>
            <Select v-model="localSettings.calculator.mode" :options="modeOptions" />
            <p class="mt-1 text-xs text-muted-foreground">
              Choose which calculator mode to use by default when opening the app
            </p>
          </div>
        </Collapsible>

        <Collapsible v-if="isRendered('startup')" id="startup" title="Startup Preferences" icon="Power"
          :default-open="true">
          <div>
            <label for="startupNavigation" class="text-sm font-medium text-foreground mb-1.5 block">When app starts,
              open:</label>
            <Select v-model="localSettings.startup.navigation" :options="startupOptions" />
            <p class="text-xs text-muted-foreground mt-2">
              Choose which page to show when you first open the app
            </p>
          </div>
        </Collapsible>

        <Collapsible v-if="isRendered('themes')" id="themes" title="Themes & Preferences" icon="Palette"
          :default-open="true">
          <div class="space-y-6">
            <!-- Theme Pack Selection -->
            <div>
              <label for="themePack" class="text-sm font-medium text-foreground mb-1.5 block">Theme Pack</label>
              <div class="space-y-3">
                <RadioGroupRoot v-model="localSettings.appearance.themePack" class="space-y-2">
                  <div v-for="pack in themePackOptions" :key="pack.value"
                    class="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem :value="pack.value"
                      class="mt-1 h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <component :is="pack.value === 'classic' ? Palette : Sparkles"
                          class="h-4 w-4 text-muted-foreground" />
                        <label class="text-sm font-medium text-foreground cursor-pointer">
                          {{ pack.label }}
                        </label>
                      </div>
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ themePackConfigs[pack.value]?.description || 'Theme pack description' }}
                      </p>
                    </div>
                  </div>
                </RadioGroupRoot>
              </div>
              <p class="mt-2 text-xs text-muted-foreground">
                Choose your preferred design system and color palette
              </p>
            </div>

            <!-- Theme Mode Selection -->
            <div>
              <label for="theme" class="text-sm font-medium text-foreground mb-1.5 block">Theme Mode</label>
              <Select v-model="localSettings.appearance.theme" :options="themeOptions" />
              <p class="mt-1 text-xs text-muted-foreground">
                Choose your preferred color theme or follow system settings
              </p>
            </div>

            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <label for="animationDisabled" class="text-sm font-medium text-foreground">Disable Animation</label>
                  <CircleHelp
                    v-tippy="{ content: 'May experience layout thrashing and flashes during transitions. Backdrops will be disabled.', placement: 'top', onShow() { return true } }"
                    class="h-4 w-4 cursor-help" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Turn off animations for improved performance or reduced motion
                </p>
              </div>
              <Switch v-model="localSettings.appearance.animationDisabled" />
            </div>

            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <label for="checkForUpdates" class="text-sm font-medium text-foreground">Check for Updates</label>
                </div>
                <p class="text-xs text-muted-foreground">
                  Automatically check for new updates in the background
                </p>
              </div>
              <Switch v-model="localSettings.appearance.checkForUpdates" />
            </div>
          </div>
        </Collapsible>

        <Collapsible v-if="isRendered('advanced')" id="advanced" title="Advanced Settings" icon="Settings"
          :default-open="false">
          <div class="space-y-6">
            <div class="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <h3 class="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <AlertTriangle class="h-4 w-4" />
                Database Management
              </h3>

              <p class="text-sm text-muted-foreground mb-3">
                If you're experiencing issues with the app, you can reset the database to default settings.
                This will delete all your calculation history and restore default settings.
              </p>

              <div class="flex justify-end">
                <Button variant="destructive" size="sm" @click="showResetConfirmation">
                  Reset Database
                </Button>
              </div>
            </div>
          </div>
        </Collapsible>

        <div v-if="filteredManifest.length === 0 && searchQuery" class="text-center py-10">
          <p class="text-foreground text-lg">
            No settings found for "{{ searchQuery }}".
          </p>
          <p class="text-sm text-muted-foreground">
            Try a different search term.
          </p>
        </div>

        <div class="flex justify-end space-x-4 bg-muted/30 py-4 border-t border-border">
          <Button variant="ghost" @click="goBack">
            Cancel
          </Button>
          <Button variant="primary" :disabled="!hasChanges" @click="saveSettings">
            Save Changes
          </Button>
        </div>
      </div>
    </BasePage>

    <!-- Unsaved Changes Modal -->
    <BaseModal v-model:open="showUnsavedChangesModal">
      <template #title>
        Unsaved Changes
      </template>
      <p class="text-sm text-muted-foreground mb-4">
        You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
      </p>

      <div class="flex justify-end space-x-3">
        <Button variant="outline" @click="cancelNavigation">
          Stay on Page
        </Button>
        <Button variant="destructive" @click="confirmNavigation">
          Discard Changes
        </Button>
      </div>
    </BaseModal>

    <!-- Reset Database Confirmation Modal -->
    <BaseModal v-model:open="showResetDatabaseModal">
      <template #title>
        <div class="flex items-center gap-2 text-foreground">
          <AlertTriangle class="h-5 w-5" />
          Reset Database
        </div>
      </template>

      <div class="space-y-5">
        <div class="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <p class="text-sm font-medium text-foreground mb-3">
            This action will permanently delete your data and cannot be undone.
          </p>

          <div class="space-y-3">
            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold">1</span>
              </div>
              <p class="text-sm text-foreground">
                All calculation history will be permanently deleted
              </p>
            </div>

            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold">2</span>
              </div>
              <p class="text-sm text-foreground">
                All settings will be restored to their default values
              </p>
            </div>

            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold">3</span>
              </div>
              <p class="text-sm text-foreground">
                The application will reload automatically
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-accent/50 border border-border rounded-lg">
          <div class="text-muted-foreground mt-0.5">
            <CircleHelp class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm text-foreground">
              <span class="font-medium">When to use this:</span> If you're experiencing persistent issues with the
              application such as incorrect calculations, settings not saving, or other unexpected behavior.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button variant="outline" class="w-full sm:w-auto order-2 sm:order-1" :disabled="isResettingDatabase"
          @click="cancelResetDatabase">
          Cancel
        </Button>
        <Button variant="destructive" class="w-full sm:w-auto order-1 sm:order-2" :loading="isResettingDatabase"
          @click="handleResetDatabase">
          <template v-if="!isResettingDatabase">
            <span class="flex items-center gap-1.5">
              <AlertTriangle class="h-4 w-4" />
              Reset Database
            </span>
          </template>
          <template v-else>
            Resetting...
          </template>
        </Button>
      </div>
    </BaseModal>
  </div>
</template>
