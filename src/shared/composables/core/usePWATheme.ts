import { watch, onMounted } from 'vue'
import { useTheme, type ThemePackOption } from './useTheme'

/**
 * Theme color mappings for different theme packs and modes
 */
const THEME_COLORS = {
  classic: {
    light: '#4f46e5', // indigo-600
    dark: '#818cf8'   // indigo-400
  },
  mira: {
    light: '#18181b', // zinc-900
    dark: '#fafafa'   // zinc-50
  }
} as const

/**
 * Updates the PWA theme color meta tag
 */
function updateThemeColorMeta(color: string): void {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]')
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta')
    metaThemeColor.setAttribute('name', 'theme-color')
    document.head.appendChild(metaThemeColor)
  }
  
  metaThemeColor.setAttribute('content', color)
}

/**
 * Updates the Apple mobile web app status bar style
 */
function updateAppleStatusBarStyle(isDark: boolean): void {
  let metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  
  if (!metaAppleStatusBar) {
    metaAppleStatusBar = document.createElement('meta')
    metaAppleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
    document.head.appendChild(metaAppleStatusBar)
  }
  
  // Use 'black-translucent' for dark themes, 'default' for light themes
  metaAppleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default')
}

/**
 * Updates the manifest theme color dynamically
 */
function updateManifestThemeColor(color: string): void {
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
  if (manifestLink) {
    updateThemeColorMeta(color)
  }
}

/**
 * Gets the appropriate theme color based on current theme and theme pack
 */
function getThemeColor(themePack: ThemePackOption, isDark: boolean): string {
  const colors = THEME_COLORS[themePack]
  return isDark ? colors.dark : colors.light
}

/**
 * Composable for managing PWA theme colors
 */
export function usePWATheme() {
  const { isDark, selectedThemePack } = useTheme()

  /**
   * Updates all PWA-related theme elements
   */
  const updatePWATheme = (): void => {
    const themeColor = getThemeColor(selectedThemePack.value, isDark.value)
    
    // Update theme color meta tag
    updateThemeColorMeta(themeColor)
    
    // Update Apple status bar style
    updateAppleStatusBarStyle(isDark.value)
    
    // Update manifest theme color
    updateManifestThemeColor(themeColor)
    
    console.log(`PWA theme updated: ${selectedThemePack.value} ${isDark.value ? 'dark' : 'light'} -> ${themeColor}`)
  }

  watch([isDark, selectedThemePack], updatePWATheme, { immediate: false })

  onMounted(updatePWATheme)

  return {
    updatePWATheme,
    getThemeColor: (themePack: ThemePackOption, isDark: boolean) => getThemeColor(themePack, isDark)
  }
}
