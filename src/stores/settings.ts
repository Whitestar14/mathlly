import { defineStore } from 'pinia'
import db from '@/data/db'
import type { Settings } from '@/data/db'
import {
  cloneDeep,
  merge,
  set,
  flattenObject,
  unflattenObject,
  isNestedStructure,
} from '@/utils/misc/objectUtils'

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  display: {
    precision: 4,
    useFractions: false,
    formatting: {
      useThousandsSeparator: true,
      formatBinary: true,
      formatHexadecimal: true,
      formatOctal: true,
    },
    syntaxHighlighting: true,
    textSize: 'normal',
  },
  calculator: {
    mode: 'Standard',
    scientific: {
      angleUnit: 'degrees',
    },
    programmer: {
      defaultBase: 'decimal',
    },
  },
  appearance: {
    theme: 'system',
    themePack: 'mira', // Changed from 'classic' to 'mira' as default
    animationDisabled: false,
    checkForUpdates: true, 
    borderRadius: 'sharp',
  },
  startup: {
    navigation: 'last-visited',
  },
}

// Define the flattened state type
type FlattenedSettings = Record<string, any>

// Define the store state interface with proper typing
interface SettingsState extends FlattenedSettings {
  // Add index signature to allow dynamic property access
  [key: string]: any
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({ ...flattenObject(DEFAULT_SETTINGS) }),

  getters: {
    display: (state): any => createSettingsProxy(state, 'display'),
    calculator: (state): any => createSettingsProxy(state, 'calculator'),
    appearance: (state): any => createSettingsProxy(state, 'appearance'),
    startup: (state): any => createSettingsProxy(state, 'startup'),
  },

  actions: {
    async loadSettings(): Promise<void> {
      try {
        const settings = await db.settings.get(1)
        if (settings) {
          // For existing users, check if they had classic theme and preserve it
          // This prevents existing users from being forced to Mira
          const mergedSettings = merge({}, DEFAULT_SETTINGS, settings)
          
          // Validate theme pack value
          if (!mergedSettings.appearance.themePack || 
              !['classic', 'mira'].includes(mergedSettings.appearance.themePack)) {
            // If invalid theme pack, use mira as default for new users
            mergedSettings.appearance.themePack = 'mira'
          }
          
          Object.assign(this, flattenObject(mergedSettings))
        } else {
          // New user - use default settings with Mira theme
          await this.saveSettings(DEFAULT_SETTINGS)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        Object.assign(this, flattenObject(DEFAULT_SETTINGS))
      }
    },

    async saveSettings(newSettings: Settings | FlattenedSettings): Promise<boolean> {
      try {
        const currentSettings = await db.settings.get(1)
        const baseSettings = cloneDeep(DEFAULT_SETTINGS)

        const flattenedNewSettings = isNestedStructure(newSettings)
          ? flattenObject(newSettings)
          : newSettings

        const settingsToSave = merge(
          {},
          baseSettings,
          currentSettings || {},
          isNestedStructure(newSettings)
            ? newSettings
            : unflattenObject(flattenedNewSettings)
        ) as Settings

        // Ensure theme pack is valid
        if (!settingsToSave.appearance.themePack || 
            !['classic', 'mira'].includes(settingsToSave.appearance.themePack)) {
          settingsToSave.appearance.themePack = 'mira' // Changed default to mira
        }

        settingsToSave.id = 1

        if (!currentSettings) {
          await db.settings.add(settingsToSave)
        } else {
          await db.settings.update(1, settingsToSave)
        }

        Object.assign(this, flattenObject(settingsToSave))

        return true
      } catch (error) {
        console.error('Error saving settings:', error)
        throw error
      }
    },

    async updateSetting(path: string, value: any): Promise<void> {
      try {
        const currentSettings =
          (await db.settings.get(1)) || cloneDeep(DEFAULT_SETTINGS)
        
        // Validate theme pack updates
        if (path === 'appearance.themePack' && !['classic', 'mira'].includes(value)) {
          console.warn(`Invalid theme pack: ${value}. Using default.`)
          value = 'mira' // Changed default to mira
        }
        
        set(currentSettings, path, value)
        await this.saveSettings(currentSettings)

        const flatKey = path.replace(/\./g, '_')
        this[flatKey] = value
      } catch (error) {
        console.error(`Error updating setting at path ${path}:`, error)
        throw error
      }
    },
  },
})

/**
 * Creates a proxy for accessing nested settings with dot notation
 */
function createSettingsProxy(state: SettingsState, section: string): any {
  const handler: ProxyHandler<Record<string, any>> = {
    get(_, prop: string | symbol) {
      if (prop === 'toJSON') {
        return () => {
          const result: Record<string, any> = {}
          Object.keys(state).forEach((key) => {
            if (key.startsWith(`${section}_`)) {
              const subPath = key.substring(section.length + 1)
              set(result, subPath, state[key])
            }
          })
          return result
        }
      }

      const propStr = String(prop)
      const flatKey = `${section}_${propStr}`
      if (flatKey in state) {
        return state[flatKey]
      }

      const subsectionPrefix = `${section}_${propStr}_`
      const hasSubsection = Object.keys(state).some((key) =>
        key.startsWith(subsectionPrefix)
      )

      if (hasSubsection) {
        return new Proxy(
          {} as Record<string, any>,
          {
            get(_, subProp: string | symbol) {
              const subKey = `${section}_${propStr}_${String(subProp)}`
              return state[subKey]
            },
          }
        )
      }

      return undefined
    },

    set(_, prop: string | symbol, value: any) {
      const flatKey = `${section}_${String(prop)}`
      state[flatKey] = value
      return true
    },
  }

  return new Proxy({} as Record<string, any>, handler)
}
