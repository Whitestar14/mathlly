<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { filterByQuery } from '@utils/string/queryFilter';
import { useSettingsStore, DEFAULT_SETTINGS } from '@stores/settings';
import { useToast } from '@composables/ui/useToast';
import { cloneDeep } from '@utils/object/objectUtils';
import { BasePage } from '@components/ui'
import SettingsSearch from '@settings/components/SettingsSearch.vue';
import StartupSection from '@settings/components/StartupSection.vue';
import AppearanceSection from '@settings/components/AppearanceSection.vue';
import AdvancedSection from '@settings/components/AdvancedSection.vue';
import SettingsActions from '@settings/components/SettingsActions.vue';
import UnsavedChangesModal from '@settings/components/UnsavedChangesModal.vue';
import { settingsManifest } from '@settings/composables/settingsManifest';
import type { Settings } from '@services/storage/db';

defineOptions({
  name: 'SettingsPage',
});

const router = useRouter();
const settingsStore = useSettingsStore();
const { toast } = useToast();

// Reactive state
const searchQuery = ref<string>('');
const showUnsavedChangesModal = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const filteredManifest = computed(() =>
  filterByQuery(settingsManifest, searchQuery.value, ['title', 'keywords'])
);

const isRendered = (sectionId: string): boolean => {
  return filteredManifest.value.some((section) => section.id === sectionId);
};

// Single source of truth - get settings directly from the store
const localSettings = ref<Settings>(cloneDeep(DEFAULT_SETTINGS));

// Create a snapshot of the current store state
const storeSnapshot = computed(() => ({
  id: settingsStore.id ?? DEFAULT_SETTINGS.id,
  display: {
    textSize:
      settingsStore.display?.textSize ?? DEFAULT_SETTINGS.display.textSize,
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

  isSaving.value = true;

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
  } finally {
    isSaving.value = false;
  }
};

const updateSettings = (newSettings: Settings): void => {
  localSettings.value = newSettings;
};
</script>

<template>
  <div>
    <BasePage title="Settings">
      <div class="space-y-8 mx-auto max-w-4xl">
        <SettingsSearch v-model="searchQuery" />

        <StartupSection
          :settings="localSettings"
          :is-visible="isRendered('startup')"
          @update:settings="updateSettings"
        />

        <AppearanceSection
          :settings="localSettings"
          :is-visible="isRendered('themes')"
          @update:settings="updateSettings"
        />

        <AdvancedSection :is-visible="isRendered('advanced')" />

        <div
          v-if="filteredManifest.length === 0 && searchQuery"
          class="text-center py-10"
        >
          <p class="text-foreground text-lg">
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
          @save="saveSettings"
        />
      </div>
    </BasePage>

    <!-- Unsaved Changes Modal -->
    <UnsavedChangesModal
      v-model:open="showUnsavedChangesModal"
      @confirm="confirmNavigation"
      @cancel="cancelNavigation"
    />
  </div>
</template>
