import { computed, watch, type ComputedRef } from 'vue'
import { useDark, usePreferredDark, useStorage, type RemovableRef } from '@vueuse/core'
import {
  THEME_OPTIONS,
  themeOptions,
  themePackConfigs,
  getThemeVisualConfig,
  getThemeColor,
  themePackOptions,
  DEFAULT_THEME_PACK,
  type ThemeOption,
  type ThemePackOption
} from './themeConfig'

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
  selectedTheme: ReturnType<typeof useStorage<ThemeOption>>
  selectedThemePack: ReturnType<typeof useStorage<ThemePackOption>>
  isSystemTheme: ComputedRef<boolean>
  toggleTheme: () => void
  setTheme: (newTheme: ThemeOption) => void
  setThemePack: (newThemePack: ThemePackOption) => void
  getThemeVisualConfig: (packKey: ThemePackOption) => ThemeVisualConfig
  themeOptions: typeof themeOptions
  themePackOptions: typeof themePackOptions
  themePackConfigs: typeof themePackConfigs
  themeVariants: ReturnType<typeof useStorage<Partial<Record<ThemePackOption, Record<string, boolean>>>>>
  getThemeVariant: (key: string) => boolean
  setThemeVariant: (key: string, value: boolean) => void
}

const K = {
  THEME: 'app:theme',
  PACK: 'app:theme-pack',
  VARIANTS: 'app:theme-variants'
} as const

function resolveEffective(selected: ThemeOption, prefersDark: boolean): 'light' | 'dark' {
  return selected === THEME_OPTIONS.SYSTEM ? (prefersDark ? 'dark' : 'light') : (selected as 'light' | 'dark')
}

function applyMode(mode: 'light' | 'dark', isDarkRef: RemovableRef<boolean>): void {
  isDarkRef.value = mode === 'dark'
  document.documentElement.style.colorScheme = mode
}

function applyPack(pack: ThemePackOption, variants: Record<string, boolean> = {}): void {
  const html = document.documentElement
  html.setAttribute('data-theme-pack', pack)

  Array.from(html.attributes)
    .filter(a => a.name.startsWith('data-variant-'))
    .forEach(a => html.removeAttribute(a.name))

  for (const [key, val] of Object.entries(variants)) {
    html.setAttribute(`data-variant-${key}`, String(val))
  }
}

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
 * Single authoritative commit for DOM + meta updates.
 * Idempotent and safe to call from init, watches, or storage events.
 */
function commitTheme(
  theme: ThemeOption,
  pack: ThemePackOption,
  variantsByPack: Partial<Record<ThemePackOption, Record<string, boolean>>>,
  prefersDark: boolean,
  isDarkRef: RemovableRef<boolean>
): void {
  const mode = resolveEffective(theme, prefersDark)
  applyMode(mode, isDarkRef)
  const variants = variantsByPack[pack] ?? {}
  applyPack(pack, variants)
  const color = getThemeColor(pack, mode === 'dark')
  updateThemeElements(color, mode === 'dark')
}

export function useTheme(): UseThemeReturn {
  const isDark = useDark()
  const prefersDark = usePreferredDark()

  const selectedTheme = useStorage<ThemeOption>(K.THEME, THEME_OPTIONS.SYSTEM)
  const selectedThemePack = useStorage<ThemePackOption>(K.PACK, DEFAULT_THEME_PACK)
  const themeVariants = useStorage<Partial<Record<ThemePackOption, Record<string, boolean>>>>(K.VARIANTS, {})

  commitTheme(selectedTheme.value, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)

  watch([selectedTheme, selectedThemePack, prefersDark], () => {
    commitTheme(selectedTheme.value, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)
  })

  watch(themeVariants, () => {
    commitTheme(selectedTheme.value, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)
  }, { deep: true })

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (!e.key) return
      if (e.key === K.THEME && e.newValue) selectedTheme.value = e.newValue as ThemeOption
      if (e.key === K.PACK && e.newValue) selectedThemePack.value = e.newValue as ThemePackOption
      if (e.key === K.VARIANTS) {
        try {
          themeVariants.value = JSON.parse(e.newValue || '{}')
        } catch(err) {
          console.warn('Passive variants sync error', err)
        }
      }
      commitTheme(selectedTheme.value, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)
    })
  }

  const isSystemTheme = computed(() => selectedTheme.value === THEME_OPTIONS.SYSTEM)

  const toggleTheme = (): void => {
    const current = selectedTheme.value
    const next =
      current === THEME_OPTIONS.SYSTEM ?
        (isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK) :
        current === THEME_OPTIONS.DARK ?
          THEME_OPTIONS.LIGHT :
          THEME_OPTIONS.DARK
    selectedTheme.value = next
    commitTheme(next, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)
  }

  const setTheme = (newTheme: ThemeOption): void => {
    if (Object.values(THEME_OPTIONS).includes(newTheme)) {
      selectedTheme.value = newTheme
      commitTheme(newTheme, selectedThemePack.value, themeVariants.value, prefersDark.value, isDark)
    } else {
      console.warn(`Invalid theme: ${newTheme}.`)
    }
  }

  const setThemePack = (newPack: ThemePackOption): void => {
    if (newPack in themePackConfigs) {
      selectedThemePack.value = newPack
      commitTheme(selectedTheme.value, newPack, themeVariants.value, prefersDark.value, isDark)
    } else {
      console.warn(`Invalid theme pack: ${newPack}.`)
    }
  }

  function setThemeVariant(key: string, value: boolean) {
    const pack = selectedThemePack.value
    const existing = themeVariants.value[pack] ?? {}
    themeVariants.value = { ...themeVariants.value, [pack]: { ...existing, [key]: value } }
    commitTheme(selectedTheme.value, pack, themeVariants.value, prefersDark.value, isDark)
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
    getThemeVariant
  }
}
