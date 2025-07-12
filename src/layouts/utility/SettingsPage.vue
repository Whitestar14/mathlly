<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  SearchIcon,
  CircleHelp,
  AlertTriangle,
  Palette,
  Sparkles,
} from 'lucide-vue-next';
import { filterByQuery } from '@/utils/misc/queryFilter';
import { useSettingsStore, DEFAULT_SETTINGS } from '@/stores/settings';
import { useToast } from '@/composables/useToast';
import { useTheme } from '@/composables/useTheme';
import { cloneDeep } from '@/utils/misc/objectUtils';
import BasePage from '@/components/base/BasePage.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import Select from '@/components/ui/SelectBar.vue';
import Switch from '@/components/ui/ToggleBar.vue';
import Button from '@/components/base/BaseButton.vue';
import Collapsible from '@/components/base/BaseCollapsible.vue';
import { RadioGroupRoot, RadioGroupItem } from 'radix-vue';
import { resetDatabase } from '@/data/db';
import type { Settings } from '@/data/db';

// Types
interface SettingsManifestItem {
  id: string;
  title: string;
  icon: string;
  keywords: string[];
}

interface SelectOption {
  value: string | number;
  label: string;
}

defineOptions({
  name: 'SettingsPage',
});

const router = useRouter();
const settingsStore = useSettingsStore();
const { toast } = useToast();
const { themePackConfigs } = useTheme();

// Reactive state
const searchQuery = ref<string>('');
const showUnsavedChangesModal = ref<boolean>(false);
const showResetDatabaseModal = ref<boolean>(false);
const isResettingDatabase = ref<boolean>(false);

// Updated settings manifest - removed calculator-specific sections
const settingsManifest: SettingsManifestItem[] = [
  {
    id: 'startup',
    title: 'Startup Preferences',
    icon: 'PowerIcon',
    keywords: [
      'launch',
      'open page',
      'initial screen',
      'home',
      'calculator page',
      'last visited',
      'boot',
    ],
  },
  {
    id: 'themes',
    title: 'Themes & Preferences',
    icon: 'PaletteIcon',
    keywords: [
      'color theme',
      'appearance',
      'light mode',
      'dark mode',
      'system theme',
      'animations',
      'disable transitions',
      'visuals',
      'text size',
      'theme pack',
      'classic',
      'mira',
      'vercel',
      'shadcn',
      'border radius',
      'sharp',
      'rounded',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: 'SettingsIcon',
    keywords: [
      'reset',
      'database',
      'clear',
      'troubleshoot',
      'fix',
      'issues',
      'problems',
      'data',
      'storage',
    ],
  },
];

const getThemeVisualConfig = (packKey: string) => {
  const configs = {
    classic: {
      colors: {
        primary: 'bg-indigo-500 dark:bg-indigo-400',
        secondary: 'bg-indigo-200 dark:bg-indigo-300',
        accent: 'bg-indigo-50 dark:bg-indigo-950/50',
        border: 'border-indigo-300 dark:border-indigo-600',
        selectedBorder: 'border-indigo-500 dark:border-indigo-400',
        selectedBg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
        selectedText: 'text-indigo-700 dark:text-indigo-300',
        hoverBg: 'hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20',
      },
    },
    mira: {
      colors: {
        primary: 'bg-zinc-700 dark:bg-zinc-400',
        secondary: 'bg-zinc-300 dark:bg-zinc-500',
        accent: 'bg-zinc-50 dark:bg-zinc-900/50',
        border: 'border-zinc-300 dark:border-zinc-600',
        selectedBorder: 'border-zinc-500 dark:border-zinc-400',
        selectedBg: 'bg-zinc-50/50 dark:bg-zinc-900/30',
        selectedText: 'text-zinc-700 dark:text-zinc-300',
        hoverBg: 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20',
      },
    },
  };

  return configs[packKey] || configs.classic;
};

const filteredManifest = computed(() =>
  filterByQuery(settingsManifest, searchQuery.value, ['title', 'keywords'])
);

const isRendered = (sectionId: string): boolean => {
  return filteredManifest.value.some((section) => section.id === sectionId);
};

// Single source of truth - get settings directly from the store
const localSettings = ref<Settings>(cloneDeep(DEFAULT_SETTINGS));

// Create a snapshot of the current store state (only app-wide settings)
const storeSnapshot = computed(() => ({
  display: {
    textSize:
      settingsStore.display?.textSize ?? DEFAULT_SETTINGS.display.textSize,
  },
  calculator: {
    mode: settingsStore.calculator?.mode ?? DEFAULT_SETTINGS.calculator.mode,
  },
  appearance: {
    theme: settingsStore.appearance?.theme ?? DEFAULT_SETTINGS.appearance.theme,
    themePack:
      settingsStore.appearance?.themePack ??
      DEFAULT_SETTINGS.appearance.themePack,
    animationDisabled:
      settingsStore.appearance?.animationDisabled ??
      DEFAULT_SETTINGS.appearance.animationDisabled,
    checkForUpdates:
      settingsStore.appearance?.checkForUpdates ??
      DEFAULT_SETTINGS.appearance.checkForUpdates,
    borderRadius:
      settingsStore.appearance?.borderRadius ??
      DEFAULT_SETTINGS.appearance.borderRadius,
  },
  startup: {
    navigation:
      settingsStore.startup?.navigation ?? DEFAULT_SETTINGS.startup.navigation,
  },
}));

const hasChanges = computed((): boolean => {
  try {
    return (
      JSON.stringify(localSettings.value) !==
      JSON.stringify(storeSnapshot.value)
    );
  } catch (error) {
    console.error('Error comparing settings:', error);
    return false;
  }
});

// Options arrays with proper typing
const themeOptions: SelectOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const themePackOptions: SelectOption[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'mira', label: 'Mira' },
];

const startupOptions: SelectOption[] = [
  { value: 'home', label: 'Home' },
  { value: 'calculator', label: 'Calculator Page' },
  { value: 'last-visited', label: 'Last Visited Page' },
];

const textSizeOptions: SelectOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const borderRadiusOptions: SelectOption[] = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'rounded', label: 'Rounded' },
];

onMounted(async (): Promise<void> => {
  try {
    await settingsStore.loadSettings();
    localSettings.value = cloneDeep(storeSnapshot.value);
  } catch (error) {
    console.error('Error loading settings:', error);
    toast({
      type: 'error',
      title: 'Error loading settings',
      description: 'Using default settings.',
    });
  }
});

const goBack = (): void => {
  if (hasChanges.value) {
    showUnsavedChangesModal.value = true;
  } else {
    router.go(-1);
  }
};

const confirmNavigation = (): void => {
  showUnsavedChangesModal.value = false;
  router.go(-1);
};

const cancelNavigation = (): void => {
  showUnsavedChangesModal.value = false;
};

const saveSettings = async (): Promise<void> => {
  if (!hasChanges.value) {
    toast({
      title: 'No changes',
      message: 'There are no changes to save.',
      type: 'info',
    });
    return;
  }

  try {
    await settingsStore.saveSettings(localSettings.value);

    toast({
      type: 'success',
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });

    localSettings.value = cloneDeep(storeSnapshot.value);
    router.go(-1);
  } catch (error) {
    toast({
      type: 'error',
      title: 'Error saving settings',
      description: 'There was a problem saving your preferences.',
    });
    console.error('Error saving settings:', error);
  }
};

const showResetConfirmation = (): void => {
  showResetDatabaseModal.value = true;
};

const handleResetDatabase = async (): Promise<void> => {
  isResettingDatabase.value = true;

  try {
    const success = await resetDatabase();

    if (!success) throw new Error('Failed to reset database');
  } catch (error) {
    isResettingDatabase.value = false;
    showResetDatabaseModal.value = false;

    toast({
      type: 'error',
      title: 'Reset Failed',
      description:
        'There was a problem resetting your database. Please try again.',
    });

    console.error('Error resetting database:', error);
  }
};

const cancelResetDatabase = (): void => {
  showResetDatabaseModal.value = false;
};
</script>

<template>
  <div>
    <BasePage title="Settings">
      <div class="space-y-8 mx-auto max-w-4xl">
        <div
          class="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6"
        >
          <div class="relative w-full sm:w-64">
            <BaseInput
              v-model="searchQuery"
              placeholder="Search settings..."
              :icon="SearchIcon"
              :autofocus="true"
              aria-label="Search settings"
            />
          </div>
        </div>

        <Collapsible
          v-if="isRendered('startup')"
          id="startup"
          title="Startup Preferences"
          icon="Power"
          :default-open="true"
        >
          <div>
            <label
              for="startupNavigation"
              class="text-sm font-medium text-foreground mb-1.5 block"
              >When app starts, open:</label
            >
            <Select
              v-model="localSettings.startup.navigation"
              :options="startupOptions"
            />
            <p class="text-xs text-muted-foreground mt-2">
              Choose which page to show when you first open the app
            </p>
          </div>
        </Collapsible>

        <Collapsible
          v-if="isRendered('themes')"
          id="themes"
          title="Themes & Preferences"
          icon="Palette"
          :default-open="true"
        >
          <div class="space-y-6">
            <!-- Theme Pack Selection -->
            <div>
              <label class="text-sm font-medium text-foreground mb-3 block">
                Choose a theme pack:
              </label>

              <div class="grid grid-cols-2 gap-4 mt-4">
                <label
                  v-for="(config, packKey) in themePackConfigs"
                  :key="packKey"
                  :for="`theme-${packKey}`"
                  class="cursor-pointer group"
                >
                  <div
                    class="relative p-4 rounded-xl border-2 transition-all duration-300 bg-background hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
                    :class="[
                      localSettings.appearance.themePack === packKey
                        ? `${
                            getThemeVisualConfig(packKey).colors.selectedBorder
                          } ${
                            getThemeVisualConfig(packKey).colors.selectedBg
                          } shadow-sm dark:shadow-black/10`
                        : `border-border ${
                            getThemeVisualConfig(packKey).colors.hoverBg
                          }`,
                    ]"
                  >
                    <input
                      :id="`theme-${packKey}`"
                      v-model="localSettings.appearance.themePack"
                      type="radio"
                      :value="packKey"
                      name="themePack"
                      class="sr-only"
                    />

                    <!-- Theme Preview -->
                    <div
                      class="flex items-center justify-center mb-3 relative h-12"
                    >
                      <!-- Background pattern -->
                      <div
                        class="absolute inset-0 rounded-lg overflow-hidden"
                        :class="getThemeVisualConfig(packKey).colors.accent"
                      >
                        <div
                          class="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white dark:via-white/10 to-transparent"
                        />
                      </div>

                      <!-- Color circles -->
                      <div class="relative flex items-center gap-2">
                        <div
                          class="h-4 w-4 rounded-full shadow-sm border border-white/20 dark:border-black/20"
                          :class="
                            getThemeVisualConfig(packKey).colors.secondary
                          "
                        />
                        <div
                          class="h-5 w-5 rounded-full shadow-md border-2 border-white dark:border-white/80"
                          :class="getThemeVisualConfig(packKey).colors.primary"
                        />
                        <div
                          class="h-3 w-3 rounded-full shadow-sm"
                          :class="
                            getThemeVisualConfig(packKey).colors.secondary
                          "
                        />
                      </div>
                    </div>

                    <!-- Theme Info -->
                    <div class="text-center">
                      <h4 class="font-medium text-sm text-foreground mb-1">
                        {{ config.name }}
                      </h4>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        {{ config.description }}
                      </p>
                    </div>

                    <!-- Selected Indicator -->
                    <div
                      v-if="localSettings.appearance.themePack === packKey"
                      class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary shadow-lg dark:shadow-black/30 flex items-center justify-center transform transition-transform duration-200"
                    >
                      <svg
                        class="h-3 w-3 text-primary-foreground"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>

                    <!-- Hover glow effect -->
                    <div
                      class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-primary/5 dark:from-primary/10 via-transparent to-primary/5 dark:to-primary/10"
                    />
                  </div>
                </label>
              </div>
            </div>

            <!-- Theme Mode Selection -->
            <div>
              <label
                for="theme"
                class="text-sm font-medium text-foreground mb-1.5 block"
                >Theme Mode</label
              >
              <Select
                v-model="localSettings.appearance.theme"
                :options="themeOptions"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                Choose your preferred color theme or follow system settings
              </p>
            </div>

            <!-- Text Size -->
            <div>
              <label
                for="textSize"
                class="text-sm font-medium text-foreground mb-1.5 block"
                >Text Size</label
              >
              <div class="mt-2">
                <RadioGroupRoot
                  v-model="localSettings.display.textSize"
                  class="inline-flex items-center rounded-md bg-muted p-1"
                >
                  <div class="flex space-x-1">
                    <RadioGroupItem
                      v-for="option in textSizeOptions"
                      :key="option.value"
                      :value="option.value"
                      class="rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      :class="[
                        localSettings.display.textSize === option.value
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      ]"
                    >
                      {{ option.label }}
                    </RadioGroupItem>
                  </div>
                </RadioGroupRoot>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                Adjust the size of text throughout the application
              </p>
            </div>

            <!-- Animation Toggle -->
            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <label
                    for="animationDisabled"
                    class="text-sm font-medium text-foreground"
                    >Disable Animation</label
                  >
                  <CircleHelp
                    v-tippy="{
                      content:
                        'May experience layout thrashing and flashes during transitions. Backdrops will be disabled.',
                      placement: 'top',
                      onShow() {
                        return true;
                      },
                    }"
                    class="h-4 w-4 cursor-help"
                  />
                </div>
                <p class="text-xs text-muted-foreground">
                  Turn off animations for improved performance or reduced motion
                </p>
              </div>
              <Switch v-model="localSettings.appearance.animationDisabled" />
            </div>

            <!-- Border Style -->
            <div>
              <label
                for="borderRadius"
                class="text-sm font-medium text-foreground mb-1.5 block"
                >Border Style</label
              >
              <div class="mt-2">
                <RadioGroupRoot
                  v-model="localSettings.appearance.borderRadius"
                  class="inline-flex items-center rounded-md bg-muted p-1"
                >
                  <div class="flex space-x-1">
                    <RadioGroupItem
                      v-for="option in borderRadiusOptions"
                      :key="option.value"
                      :value="option.value"
                      class="rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200"
                      :class="[
                        localSettings.appearance.borderRadius === option.value
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      ]"
                    >
                      {{ option.label }}
                    </RadioGroupItem>
                  </div>
                </RadioGroupRoot>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                Choose between sharp modern edges or rounded friendly corners
              </p>
            </div>

            <!-- Check for Updates -->
            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <label
                    for="checkForUpdates"
                    class="text-sm font-medium text-foreground"
                    >Check for Updates</label
                  >
                </div>
                <p class="text-xs text-muted-foreground">
                  Automatically check for new updates in the background
                </p>
              </div>
              <Switch v-model="localSettings.appearance.checkForUpdates" />
            </div>
          </div>
        </Collapsible>

        <Collapsible
          v-if="isRendered('advanced')"
          id="advanced"
          title="Advanced Settings"
          icon="Settings"
          :default-open="false"
        >
          <div class="space-y-6">
            <div
              class="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
            >
              <h3
                class="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
              >
                <AlertTriangle class="h-4 w-4" />
                Database Management
              </h3>

              <p class="text-sm text-muted-foreground mb-3">
                If you're experiencing issues with the app, you can reset the
                database to default settings. This will delete all your
                calculation history, tool settings, and restore default settings.
              </p>

              <div class="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  @click="showResetConfirmation"
                >
                  Reset Database
                </Button>
              </div>
            </div>
          </div>
        </Collapsible>

        <div
          v-if="filteredManifest.length === 0 && searchQuery"
          class="text-center py-10"
        >
                    <p class="text-foreground text-lg">
            No settings found for "{{ searchQuery }}".
          </p>
          <p class="text-sm text-muted-foreground">
            Try a different search term or check tool-specific options in the menu.
          </p>
        </div>

        <div
          class="flex justify-end space-x-4 bg-muted/30 py-4 border-t border-border"
        >
          <Button variant="ghost" @click="goBack"> Cancel </Button>
          <Button
            variant="primary"
            :disabled="!hasChanges"
            @click="saveSettings"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </BasePage>

    <!-- Unsaved Changes Modal -->
    <BaseModal v-model:open="showUnsavedChangesModal">
      <template #title> Unsaved Changes </template>
      <p class="text-sm text-muted-foreground mb-4">
        You have unsaved changes. Are you sure you want to leave this page? Your
        changes will be lost.
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
        <div
          class="p-4 bg-destructive/5 border border-destructive/20 rounded-lg"
        >
          <p class="text-sm font-medium text-foreground mb-3">
            This action will permanently delete your data and cannot be undone.
          </p>

          <div class="space-y-3">
            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
              >
                <span class="text-xs font-bold">1</span>
              </div>
              <p class="text-sm text-foreground">
                All calculation history will be permanently deleted
              </p>
            </div>

            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
              >
                <span class="text-xs font-bold">2</span>
              </div>
              <p class="text-sm text-foreground">
                All settings and tool preferences will be restored to their default values
              </p>
            </div>

            <div class="flex items-start gap-2.5">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
              >
                <span class="text-xs font-bold">3</span>
              </div>
              <p class="text-sm text-foreground">
                The application will reload automatically
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-3 bg-accent/50 border border-border rounded-lg"
        >
          <div class="text-muted-foreground mt-0.5">
            <CircleHelp class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm text-foreground">
              <span class="font-medium">When to use this:</span> If you're
              experiencing persistent issues with the application such as
              incorrect calculations, settings not saving, or other unexpected
              behavior.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          variant="outline"
          class="w-full sm:w-auto order-2 sm:order-1"
          :disabled="isResettingDatabase"
          @click="cancelResetDatabase"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          class="w-full sm:w-auto order-1 sm:order-2"
          :loading="isResettingDatabase"
          @click="handleResetDatabase"
        >
          <template v-if="!isResettingDatabase">
            <span class="flex items-center gap-1.5">
              <AlertTriangle class="h-4 w-4" />
              Reset Database
            </span>
          </template>
          <template v-else> Resetting... </template>
        </Button>
      </div>
    </BaseModal>
  </div>
</template>

