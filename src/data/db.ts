import Dexie, { type Table } from "dexie"
import { DEFAULT_SETTINGS } from '@/stores/settings'

// Define interfaces for your database tables
export interface HistoryEntry {
  id?: number
  timestamp: number
  expression?: string
  result?: string
  mode?: string
}

export interface Settings {
  id: number
  display: {
    precision: number
    useFractions: boolean
    formatting: {
      useThousandsSeparator: boolean
      formatBinary: boolean
      formatHexadecimal: boolean
      formatOctal: boolean
    }
    syntaxHighlighting: boolean
    textSize: string
  }
  calculator: {
    mode: string
    scientific?: {
      angleUnit: string
    }
    programmer?: {
      defaultBase: string
    }
  }
  appearance: {
    theme: string
    themePack: string // Add theme pack support
    animationDisabled: boolean
    checkForUpdates: boolean
  }
  startup: {
    navigation: string
  }
}

// Define the database class
export class MathllyDatabase extends Dexie {
  history!: Table<HistoryEntry>
  settings!: Table<Settings>

  constructor() {
    super('mathlly-db')
    
    // Update to version 5 to include theme pack migration
    this.version(5).stores({
      history: '++id,timestamp',
      settings: 'id'
    }).upgrade(tx => {
      return tx.table('settings').toCollection().modify((settings: any) => {
        // Handle migration from version 4 to 5 (add theme pack)
        if (settings && !settings.appearance?.themePack) {
          if (!settings.appearance) {
            settings.appearance = {}
          }
          settings.appearance.themePack = 'classic'
        }
        
        // Handle migration from older versions
        if (settings && !settings.display && settings.precision !== undefined) {
          const newSettings: Settings = {
            id: settings.id,
            display: {
              precision: settings.precision || 4,
              useFractions: settings.useFractions || false,
              formatting: {
                useThousandsSeparator: settings.useThousandsSeparator ?? true,
                formatBinary: settings.formatBinary ?? true,
                formatHexadecimal: settings.formatHexadecimal ?? true,
                formatOctal: settings.formatOctal ?? true,
              },
              syntaxHighlighting: settings.syntaxHighlighting ?? true,
              textSize: settings.textSize || 'normal',
            },
            calculator: {
              mode: settings.mode || 'Standard',
              scientific: {
                angleUnit: 'degrees',
              },
              programmer: {
                defaultBase: 'decimal',
              },
            },
            appearance: {
              theme: settings.theme || 'system',
              themePack: settings.themePack || 'classic',
              animationDisabled: settings.animationDisabled || false,
              checkForUpdates: settings.checkForUpdates ?? true,
            },
            startup: {
              navigation: settings.navigation || 'last-visited',
            }
          }
          
          // Replace the old settings with the new structure
          Object.keys(settings).forEach(key => {
            delete settings[key]
          })
          
          Object.assign(settings, newSettings)
        }
      })
    })

    // Keep version 4 for backward compatibility
    this.version(4).stores({
      history: '++id,timestamp',
      settings: 'id'
    }).upgrade(tx => {
      return tx.table('settings').toCollection().modify((settings: any) => {
        if (settings && !settings.display && settings.precision !== undefined) {
          const newSettings: Settings = {
            id: settings.id,
            display: {
              precision: settings.precision,
              useFractions: settings.useFractions,
              formatting: {
                useThousandsSeparator: settings.useThousandsSeparator,
                formatBinary: settings.formatBinary,
                formatHexadecimal: settings.formatHexadecimal,
                formatOctal: settings.formatOctal,
              },
              syntaxHighlighting: settings.syntaxHighlighting,
              textSize: settings.textSize,
            },
            calculator: {
              mode: settings.mode,
            },
            appearance: {
              theme: settings.theme,
              themePack: 'classic', // Default for migration
              animationDisabled: settings.animationDisabled,
              checkForUpdates: settings.checkForUpdates,
            },
            startup: {
              navigation: settings.navigation,
            }
          }
          
          // Replace the old settings with the new structure
          Object.keys(settings).forEach(key => {
            delete settings[key]
          })
          
          Object.assign(settings, newSettings)
        }
      })
    })
  }
}

// Function to reset the database
export async function resetDatabase(): Promise<boolean> {
  try {
    // Close the current database connection
    await db.close()
    
    // Delete the database completely
    await Dexie.delete('mathlly-db')
    
    // Reload the page to reinitialize the database with defaults
    window.location.reload()
    
    return true
  } catch (error) {
    console.error("Error resetting database:", error)
    return false
  }
}

// Create database instance
const db = new MathllyDatabase()

// Perform database upgrade
db.on("ready", async () => {
  try {
    // If there are no settings, create default settings
    const settingsCount = await db.settings.count()
    if (settingsCount === 0) {
      await db.settings.add(DEFAULT_SETTINGS)
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  }
})

export default db
