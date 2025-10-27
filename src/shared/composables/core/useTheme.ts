import { computed, watch, ref, type ComputedRef, type Ref } from 'vue';
import { useDark, usePreferredDark, type RemovableRef } from '@vueuse/core';
import {
  THEME_OPTIONS,
  themeOptions,
  themePackConfigs,
  getThemeVisualConfig,
  getThemeColor,
  themePackOptions,
  DEFAULT_THEME_PACK,
} from './themeConfig';
import type { ThemeOption, ThemePackOption } from './themeConfig';

/**
 * Theme visual configuration for UI components
 */
export interface ThemeVisualConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    selectedBorder: string;
    selectedBg: string;
    selectedText: string;
    hoverBg: string;
  };
}

export interface ThemePackConfig {
  id: ThemePackOption;
  name: string;
  description: string;
  preview?: { light: string; dark: string };
}

export interface UseThemeReturn {
  isDark: RemovableRef<boolean>;
  selectedTheme: Ref<ThemeOption>;
  selectedThemePack: Ref<ThemePackOption>;
  isSystemTheme: ComputedRef<boolean>;
  toggleTheme: () => void;
  setTheme: (newTheme: ThemeOption) => void;
  setThemePack: (newThemePack: ThemePackOption) => void;
  getThemeVisualConfig: (packKey: ThemePackOption) => ThemeVisualConfig;
  themeOptions: typeof themeOptions;
  themePackOptions: typeof themePackOptions;
  themePackConfigs: typeof themePackConfigs;
}

function applyThemePack(themePack: ThemePackOption): void {
  const html = document.documentElement;
  html.setAttribute('data-theme-pack', themePack);
}

function resolveEffective(selected: ThemeOption, prefersDark: boolean): 'light' | 'dark' {
  if (selected === THEME_OPTIONS.SYSTEM) return prefersDark ? 'dark' : 'light';
  return selected as 'light' | 'dark';
}

/**
 * Ensure UA color-scheme aligns to avoid scrollbar/UI mismatch
 */
function applyColorScheme(effective: 'light' | 'dark'): void {
  document.documentElement.style.colorScheme = effective;
}

/**
 * Apply theme-color meta and Apple status bar updates for PWAs
 */
function updateThemeElements(color: string, isDark: boolean): void {
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', color);

  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
  if (!appleStatusBar) {
    appleStatusBar = document.createElement('meta');
    appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    document.head.appendChild(appleStatusBar);
  }
  appleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
}

export function useTheme(): UseThemeReturn {
  const isDark = useDark();
  const prefersDark = usePreferredDark();

  const selectedTheme = ref<ThemeOption>(THEME_OPTIONS.SYSTEM);
  const selectedThemePack = ref<ThemePackOption>(DEFAULT_THEME_PACK);

  function applyTheme(theme: ThemeOption, pack: ThemePackOption) {
    const effective = resolveEffective(theme, prefersDark.value);
    isDark.value = effective === 'dark';
    applyColorScheme(effective);
    applyThemePack(pack);
    try {
      const color = getThemeColor(pack as ThemePackOption, effective === 'dark');
      updateThemeElements(color, effective === 'dark');
    } catch (e) {}
  }

  function syncThemeState(): void {
    const storedTheme = localStorage.getItem('app:theme') as ThemeOption || THEME_OPTIONS.SYSTEM;
    const storedPack = localStorage.getItem('app:theme-pack') as ThemePackOption || DEFAULT_THEME_PACK;
    selectedTheme.value = storedTheme;
    selectedThemePack.value = storedPack;
  }

  try {
    const cachedTheme = (localStorage.getItem('app:theme') as ThemeOption) || THEME_OPTIONS.SYSTEM;
    const cachedPack = (localStorage.getItem('app:theme-pack') as ThemePackOption) || DEFAULT_THEME_PACK;
    selectedTheme.value = cachedTheme;
    selectedThemePack.value = cachedPack;
    applyTheme(cachedTheme, cachedPack);
  } catch {}

  watch(selectedTheme, (newTheme) => {
    try { localStorage.setItem('app:theme', newTheme); } catch {}
    // Critical fix: Ensure selectedThemePack is synced before applying
    const currentPack = localStorage.getItem('app:theme-pack') as ThemePackOption || DEFAULT_THEME_PACK;
    if (selectedThemePack.value !== currentPack) {
      selectedThemePack.value = currentPack;
    }
    applyTheme(newTheme, selectedThemePack.value);
  });

  watch(selectedThemePack, (newPack) => {
    try { localStorage.setItem('app:theme-pack', newPack); } catch {}
    // Ensure selectedTheme is synced before applying
    const currentTheme = localStorage.getItem('app:theme') as ThemeOption || THEME_OPTIONS.SYSTEM;
    if (selectedTheme.value !== currentTheme) {
      selectedTheme.value = currentTheme;
    }
    applyTheme(selectedTheme.value, newPack);
  });

  watch(prefersDark, () => {
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      applyTheme(selectedTheme.value, selectedThemePack.value);
    }
  });

  const isSystemTheme: ComputedRef<boolean> = computed(() => selectedTheme.value === THEME_OPTIONS.SYSTEM);

  const toggleTheme = (): void => {
    syncThemeState();

    let newTheme: ThemeOption;
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      newTheme = isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    } else {
      newTheme = selectedTheme.value === THEME_OPTIONS.DARK ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    }

    try { localStorage.setItem('app:theme', newTheme); } catch (e) {}
    applyTheme(newTheme, selectedThemePack.value);

    selectedTheme.value = newTheme;  };

  const setTheme = (newTheme: ThemeOption): void => {
    if (Object.values(THEME_OPTIONS).includes(newTheme)) {
      selectedTheme.value = newTheme;
    } else {
      console.warn(`Invalid theme: ${newTheme}.`);
    }
  };

  const setThemePack = (newThemePack: ThemePackOption): void => {
    if (newThemePack in themePackConfigs) {
      selectedThemePack.value = newThemePack;
    } else {
      console.warn(`Invalid theme pack: ${newThemePack}.`);
    }
  };

  return {
    isDark,
    selectedTheme,
    selectedThemePack,
    isSystemTheme,
    toggleTheme,
    setTheme,
    setThemePack,
    getThemeVisualConfig,
    themeOptions,
    themePackOptions,
    themePackConfigs,
  };
}