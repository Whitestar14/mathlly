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

// Add new interface for tool-specific settings
export interface ToolSettings {
  id?: number
  toolId: string
  settings: Record<string, any>
  lastUpdated: number
}

export interface Settings {
  id: number
  display: {
    textSize: string
  },
  appearance: {
    theme: string
    themePack: string
    animationDisabled: boolean
    checkForUpdates: boolean
    borderRadius: string
  }
  startup: {
    navigation: string
  }
}

// Define the database class
export class MathllyDatabase extends Dexie {
  history!: Table<HistoryEntry>
  settings!: Table<Settings>
  toolSettings!: Table<ToolSettings>

  constructor() {
    super('mathlly-db')
    
    // Update to version 5 to include tool settings
    this.version(5).stores({
      history: '++id,timestamp',
      settings: 'id',
      toolSettings: '++id,toolId,lastUpdated'
    }).upgrade(tx => {
      return tx.table('settings').toCollection().modify((settings: any) => {
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
              textSize: settings.textSize || 'normal',
            },
            appearance: {
              theme: settings.theme || 'system',
              themePack: settings.themePack || 'mira',
              animationDisabled: settings.animationDisabled || false,
              checkForUpdates: settings.checkForUpdates ?? true,
              borderRadius: settings.borderRadius || 'sharp',
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
              textSize: settings.textSize,
            },
            appearance: {
              theme: settings.theme,
              themePack: 'mira',
              animationDisabled: settings.animationDisabled,
              checkForUpdates: settings.checkForUpdates,
              borderRadius: settings.borderRadius || 'sharp',
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

// Tool settings helper functions moved to toolSettingsDb.ts

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
    console.error("DB: Error initializing database:", error)
  }
})

export default db
