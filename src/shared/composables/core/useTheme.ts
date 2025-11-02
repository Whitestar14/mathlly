import { computed, watch, ref, type ComputedRef, type Ref } from 'vue'
import { useDark, usePreferredDark, type RemovableRef } from '@vueuse/core'
import {
  THEME_OPTIONS,
  themeOptions,
  themePackConfigs,
  getThemeVisualConfig,
  getThemeColor,
  themePackOptions,
  DEFAULT_THEME_PACK,
  type ThemeOption,
  type ThemePackOption,
} from './themeConfig'

// Visual config type (existing)
export interface ThemeVisualConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    border: string
    selectedBorder: string
    selectedBg: string
    selectedText: string
    hoverBg: string
  }
}

export interface UseThemeReturn {
  isDark: RemovableRef<boolean>
  selectedTheme: Ref<ThemeOption>
  selectedThemePack: Ref<ThemePackOption>
  isSystemTheme: ComputedRef<boolean>
  toggleTheme: () => void
  setTheme: (newTheme: ThemeOption) => void
  setThemePack: (newThemePack: ThemePackOption) => void
  getThemeVisualConfig: (packKey: ThemePackOption) => ThemeVisualConfig
  themeOptions: typeof themeOptions
  themePackOptions: typeof themePackOptions
  themePackConfigs: typeof themePackConfigs

  // Generic variants targeting the current pack
  themeVariants: Ref<Partial<Record<ThemePackOption, Record<string, boolean>>>>
  getThemeVariant: (key: string) => boolean
  setThemeVariant: (key: string, value: boolean) => void
}

const themeVariants = ref<Partial<Record<ThemePackOption, Record<string, boolean>>>>({})

function resolveEffective(selected: ThemeOption, prefersDark: boolean): 'light' | 'dark' {
  if (selected === THEME_OPTIONS.SYSTEM) return prefersDark ? 'dark' : 'light'
  return selected as 'light' | 'dark'
}

/**
 * Apply only the mode (light/dark) related UI, without touching pack/variants.
 * Important: This prevents variant toggles from flipping the mode.
 */
function applyMode(theme: ThemeOption, prefersDark: boolean, isDarkRef: RemovableRef<boolean>): 'light' | 'dark' {
  const effective = resolveEffective(theme, prefersDark)
  isDarkRef.value = effective === 'dark'
  document.documentElement.style.colorScheme = effective
  return effective
}

/**
 * Apply only the pack and its variants as data attributes.
 */
function applyPack(themePack: ThemePackOption, variants: Record<string, boolean> = {}): void {
  const html = document.documentElement
  html.setAttribute('data-theme-pack', themePack)

  // Clear previous variant attrs
  Array.from(html.attributes)
    .filter(attr => attr.name.startsWith('data-variant-'))
    .forEach(attr => html.removeAttribute(attr.name))

  // Apply current variants
  Object.entries(variants).forEach(([key, value]) => {
    html.setAttribute(`data-variant-${key}`, value.toString())
  })
}

/**
 * Update meta theme-color and Apple status bar based on current pack and mode.
 */
function updateThemeElements(color: string, isDark: boolean): void {
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta')
    themeColorMeta.setAttribute('name', 'theme-color')
    document.head.appendChild(themeColorMeta)
  }
  themeColorMeta.setAttribute('content', color)

  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null
  if (!appleStatusBar) {
    appleStatusBar = document.createElement('meta')
    appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
    document.head.appendChild(appleStatusBar)
  }
  appleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default')
}

/**
 * Apply everything coherently (mode + pack + meta), used on true theme changes.
 */
function applyAll(theme: ThemeOption, pack: ThemePackOption, prefersDark: boolean, isDarkRef: RemovableRef<boolean>) {
  const effective = applyMode(theme, prefersDark, isDarkRef)
  const variants = themeVariants.value[pack] ?? {}
  applyPack(pack, variants)
  const color = getThemeColor(pack, effective === 'dark')
  updateThemeElements(color, effective === 'dark')
}

export function useTheme(): UseThemeReturn {
  const isDark = useDark()
  const prefersDark = usePreferredDark()

  const selectedTheme = ref<ThemeOption>(THEME_OPTIONS.SYSTEM)
  const selectedThemePack = ref<ThemePackOption>(DEFAULT_THEME_PACK)

  // Load persisted variants
  try {
    const cachedVariants = JSON.parse(localStorage.getItem('app:theme-variants') || '{}')
    if (cachedVariants && typeof cachedVariants === 'object') {
      themeVariants.value = cachedVariants
    }
  } catch {}

  // Initial apply using both mode and pack
  try {
    const cachedTheme = (localStorage.getItem('app:theme') as ThemeOption) || THEME_OPTIONS.SYSTEM
    const cachedPack = (localStorage.getItem('app:theme-pack') as ThemePackOption) || DEFAULT_THEME_PACK
    selectedTheme.value = cachedTheme
    selectedThemePack.value = cachedPack
    applyAll(selectedTheme.value, selectedThemePack.value, prefersDark.value, isDark)
  } catch {}

  // Persist variants and apply ONLY pack when variants change
  watch(themeVariants, (newVariants) => {
    try { localStorage.setItem('app:theme-variants', JSON.stringify(newVariants)) } catch {}
    const pack = selectedThemePack.value
    const variants = themeVariants.value[pack] ?? {}
    applyPack(pack, variants)
    // Do NOT touch mode or meta color here to avoid flipping light/dark
    const effective = resolveEffective(selectedTheme.value, prefersDark.value)
    const color = getThemeColor(pack, effective === 'dark')
    updateThemeElements(color, effective === 'dark')
  }, { deep: true })

  // Theme option changes (light/dark/system) → apply mode + pack coherently
  watch(selectedTheme, (newTheme) => {
    try { localStorage.setItem('app:theme', newTheme) } catch {}

    // Keep pack synced from storage if needed
    const currentPack = (localStorage.getItem('app:theme-pack') as ThemePackOption) || DEFAULT_THEME_PACK
    if (selectedThemePack.value !== currentPack) {
      selectedThemePack.value = currentPack
    }

    applyAll(newTheme, selectedThemePack.value, prefersDark.value, isDark)
  })

  // Pack changes → apply mode + new pack coherently
  watch(selectedThemePack, (newPack) => {
    try { localStorage.setItem('app:theme-pack', newPack) } catch {}

    const currentTheme = (localStorage.getItem('app:theme') as ThemeOption) || THEME_OPTIONS.SYSTEM
    if (selectedTheme.value !== currentTheme) {
      selectedTheme.value = currentTheme
    }

    applyAll(selectedTheme.value, newPack, prefersDark.value, isDark)
  })

  // System preference changes → only matters when using system
  watch(prefersDark, () => {
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      applyAll(selectedTheme.value, selectedThemePack.value, prefersDark.value, isDark)
    }
  })

  const isSystemTheme: ComputedRef<boolean> = computed(() => selectedTheme.value === THEME_OPTIONS.SYSTEM)

  const toggleTheme = (): void => {
    let newTheme: ThemeOption

    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      // If system, flip relative to current effective mode
      newTheme = isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK
    } else {
      newTheme = selectedTheme.value === THEME_OPTIONS.DARK
        ? THEME_OPTIONS.LIGHT
        : THEME_OPTIONS.DARK
    }

    selectedTheme.value = newTheme
    try { localStorage.setItem('app:theme', newTheme) } catch {}

    // Apply everything coherently
    applyAll(newTheme, selectedThemePack.value, prefersDark.value, isDark)
  }

  const setTheme = (newTheme: ThemeOption): void => {
    if (Object.values(THEME_OPTIONS).includes(newTheme)) {
      selectedTheme.value = newTheme
    } else {
      console.warn(`Invalid theme: ${newTheme}.`)
    }
  }

  const setThemePack = (newThemePack: ThemePackOption): void => {
    if (newThemePack in themePackConfigs) {
      selectedThemePack.value = newThemePack
    } else {
      console.warn(`Invalid theme pack: ${newThemePack}.`)
    }
  }

  /**
   * Variant API: implicitly targets the current pack.
   * This does not change theme mode; it only updates attributes + persists.
   */
  function setThemeVariant(key: string, value: boolean) {
    const pack = selectedThemePack.value
    const existing = themeVariants.value[pack] ?? {}
    themeVariants.value[pack] = { ...existing, [key]: value }
    try { localStorage.setItem('app:theme-variants', JSON.stringify(themeVariants.value)) } catch {}
    // Apply only pack/variants, keep mode intact
    applyPack(pack, themeVariants.value[pack]!)
    const effective = resolveEffective(selectedTheme.value, prefersDark.value)
    const color = getThemeColor(pack, effective === 'dark')
    updateThemeElements(color, effective === 'dark')
  }

  function getThemeVariant(key: string): boolean {
    const pack = selectedThemePack.value
    return themeVariants.value[pack]?.[key] ?? false
  }

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

    themeVariants,
    setThemeVariant,
    getThemeVariant,
  }
}
