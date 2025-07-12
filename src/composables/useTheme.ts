import { computed, watch, onMounted, nextTick, type ComputedRef } from 'vue';
import { useDark, usePreferredDark, type RemovableRef } from '@vueuse/core';
import { useSettingsStore } from '@/stores/settings';

/**
 * Theme options available in the application
 */
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

/**
 * Theme pack options available in the application
 */
const THEME_PACK_OPTIONS = {
  CLASSIC: 'classic',
  MIRA: 'mira'
} as const;

// Create types from the theme options
export type ThemeOption = typeof THEME_OPTIONS[keyof typeof THEME_OPTIONS];
export type ThemePackOption = typeof THEME_PACK_OPTIONS[keyof typeof THEME_PACK_OPTIONS];

/**
 * Theme pack configuration interface
 */
export interface ThemePackConfig {
  id: ThemePackOption;
  name: string;
  description: string;
  preview?: {
    light: string;
    dark: string;
  };
}

/**
 * Theme composable return type
 */
export interface UseThemeReturn {
  isDark: RemovableRef<boolean>;
  selectedTheme: ComputedRef<ThemeOption>;
  selectedThemePack: ComputedRef<ThemePackOption>;
  isSystemTheme: ComputedRef<boolean>;
  toggleTheme: () => Promise<void>;
  setTheme: (newTheme: ThemeOption) => Promise<void>;
  setThemePack: (newThemePack: ThemePackOption) => Promise<void>;
  themeOptions: typeof THEME_OPTIONS;
  themePackOptions: typeof THEME_PACK_OPTIONS;
  themePackConfigs: Record<ThemePackOption, ThemePackConfig>;
}

/**
 * Theme pack configurations
 */
const THEME_PACK_CONFIGS: Record<ThemePackOption, ThemePackConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional design with warm colors and familiar patterns',
    preview: {
      light: '#4f46e5',
      dark: '#818cf8'
    }
  },
  mira: {
    id: 'mira',
    name: 'Mira',
    description: 'Modern minimalist design with clean lines and neutral tones',
    preview: {
      light: '#18181b',
      dark: '#fafafa'
    }
  }
};

/**
 * Apply theme pack to document
 */
function applyThemePack(themePack: ThemePackOption): void {
  const html = document.documentElement;
  
  // Remove existing theme pack classes
  Object.values(THEME_PACK_OPTIONS).forEach(pack => {
    html.removeAttribute('data-theme-pack');
  });
  
  // Apply new theme pack
  html.setAttribute('data-theme-pack', themePack);
}

/**
 * Composable for managing application theme with system preference detection and theme pack support
 * 
 * @returns {UseThemeReturn} Theme management API
 */
export function useTheme(): UseThemeReturn {
  // Get settings store for persistence
  const settings = useSettingsStore();
  
  // Use VueUse's dark mode composable
  const isDark = useDark();
  
  // Detect system preference
  const prefersDark = usePreferredDark();

  /**
   * Current theme with getter/setter for two-way binding
   */
  const selectedTheme: ComputedRef<ThemeOption> = computed({
    get: (): ThemeOption => {
      return settings.appearance?.theme || THEME_OPTIONS.SYSTEM;
    },
    set: async (newTheme: ThemeOption): Promise<void> => {
      await settings.updateSetting('appearance.theme', newTheme);
    },
  });

  /**
   * Current theme pack with getter/setter for two-way binding
   */
  const selectedThemePack: ComputedRef<ThemePackOption> = computed({
    get: (): ThemePackOption => {
      return settings.appearance?.themePack || THEME_PACK_OPTIONS.CLASSIC;
    },
    set: async (newThemePack: ThemePackOption): Promise<void> => {
      await settings.updateSetting('appearance.themePack', newThemePack);
    },
  });

  /**
   * Whether the current theme is system-based
   */
  const isSystemTheme: ComputedRef<boolean> = computed(() => 
    selectedTheme.value === THEME_OPTIONS.SYSTEM
  );

  /**
   * Apply theme changes when settings change
   */
  watch(selectedTheme, (newTheme: ThemeOption) => {
    if (newTheme === THEME_OPTIONS.DARK) {
      isDark.value = true;
    } else if (newTheme === THEME_OPTIONS.LIGHT) {
      isDark.value = false;
    } else if (newTheme === THEME_OPTIONS.SYSTEM) {
      isDark.value = prefersDark.value;
    }
  }, { immediate: true });

  /**
   * Apply theme pack changes when settings change
   */
  watch(selectedThemePack, (newThemePack: ThemePackOption) => {
    nextTick(() => {
      applyThemePack(newThemePack);
    });
  }, { immediate: true });

  /**
   * Update theme when system preference changes (if using system theme)
   */
  watch(prefersDark, (newPrefersDark: boolean) => {
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      isDark.value = newPrefersDark;
    }
  });

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = async (): Promise<void> => {
    const newTheme: ThemeOption = isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    await settings.updateSetting('appearance.theme', newTheme);
  };

  /**
   * Set a specific theme
   */
  const setTheme = async (newTheme: ThemeOption): Promise<void> => {
    if (Object.values(THEME_OPTIONS).includes(newTheme)) {
      await settings.updateSetting('appearance.theme', newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}. Valid options are: ${Object.values(THEME_OPTIONS).join(', ')}`);
    }
  };

  /**
   * Set a specific theme pack
   */
  const setThemePack = async (newThemePack: ThemePackOption): Promise<void> => {
    if (Object.values(THEME_PACK_OPTIONS).includes(newThemePack)) {
      await settings.updateSetting('appearance.themePack', newThemePack);
    } else {
      console.warn(`Invalid theme pack: ${newThemePack}. Valid options are: ${Object.values(THEME_PACK_OPTIONS).join(', ')}`);
    }
  };

  // Initialize theme and theme pack on mount
  onMounted(async () => {
    // Wait for settings to load
    await settings.loadSettings();
    
    // Apply initial theme
    const theme = selectedTheme.value;
    if (theme === THEME_OPTIONS.SYSTEM) {
      isDark.value = prefersDark.value;
    } else {
      isDark.value = theme === THEME_OPTIONS.DARK;
    }

    // Apply initial theme pack
    const themePack = selectedThemePack.value;
    applyThemePack(themePack);
  });

  return {
    isDark,
    selectedTheme,
    selectedThemePack,
    isSystemTheme,
    toggleTheme,
    setTheme,
    setThemePack,
    themeOptions: THEME_OPTIONS,
    themePackOptions: THEME_PACK_OPTIONS,
    themePackConfigs: THEME_PACK_CONFIGS,
  };
}
