import { watch, ref } from 'vue'
import { useTheme, type ThemePackOption } from './useTheme'

/**
 * Theme color mappings for different theme packs and modes
 */
const THEME_COLORS = {
  classic: {
    light: '#5a00ff',
    dark: '#6e89ff'
  },
  mira: {
    light: '#18181b',
    dark: '#fafafa'
  }
} as const

// Single function to handle all theme updates
function updateThemeElements(color: string, isDark: boolean): void {
  // Update theme-color meta tag
  let themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta')
    themeColorMeta.setAttribute('name', 'theme-color')
    document.head.appendChild(themeColorMeta)
  }
  themeColorMeta.setAttribute('content', color)
  
  // Update Apple status bar
  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (!appleStatusBar) {
    appleStatusBar = document.createElement('meta')
    appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
    document.head.appendChild(appleStatusBar)
  }
  appleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default')
}

export function usePWATheme() {
  const { isDark, selectedThemePack } = useTheme()
  const isInitialized = ref(false)

  const getThemeColor = (themePack: ThemePackOption, darkMode: boolean): string => {
    return THEME_COLORS[themePack][darkMode ? 'dark' : 'light']
  }

  /**
   * Updates all PWA-related theme elements
   */
  const updatePWATheme = (): void => {
    const color = getThemeColor(selectedThemePack.value, isDark.value)
    updateThemeElements(color, isDark.value)
    
    if (!isInitialized.value) {
      console.log('PWA theme initialized:', selectedThemePack.value, isDark.value ? 'dark' : 'light')
      isInitialized.value = true
    }
  }

  // Synchronous initialization
  if (typeof document !== 'undefined') {
    updatePWATheme()
  }

  watch([isDark, selectedThemePack], updatePWATheme)

  return {
    updatePWATheme,
    getThemeColor
  }
}