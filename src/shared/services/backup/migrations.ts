
import { cloneDeep, merge } from '@utils/object/objectUtils'
import { DEFAULT_SETTINGS } from '@stores/settings'
import type { Settings } from '@services/storage/db'
import { sanitizePalette } from '@color/services/palette'
import type { BackupEnvelope } from './types'

// Map of version migrations. 
// Key: The version the data IS CURRENTLY IN.
// Value: Function to upgrade it to the NEXT version.
const MIGRATIONS: Record<string, (data: any) => any> = {
  // Example placeholder for future migrations
  // '0.14.0': (data) => {
  //   data.db.settings.forEach(s => s.newFeature = true)
  //   return data
  // }
}

/**
 * Heals the data by ensuring all required fields exist.
 * It merges the imported data against the current application defaults.
 */
export function healData(data: BackupEnvelope['data']): BackupEnvelope['data'] {
  const healed = cloneDeep(data)

  // 1. Heal Settings
  // Ensure settings exist, or create default array
  if (!Array.isArray(healed.db.settings) || healed.db.settings.length === 0) {
    healed.db.settings = [cloneDeep(DEFAULT_SETTINGS)]
  } else {
    // Deep merge imported settings against default settings to fill missing keys
    healed.db.settings[0] = merge({}, cloneDeep(DEFAULT_SETTINGS), healed.db.settings[0]) as Settings
  }

  // 2. Heal Palettes
  if (!Array.isArray(healed.db.palettes)) {
    healed.db.palettes = []
  }
  // Ensure strict sanitization of colors
  healed.db.palettes = healed.db.palettes.map(p => sanitizePalette(p))
  
  // 3. Heal Local Storage (AppStorage)
  if (!healed.local) healed.local = {}

  // 4. Heal Theme Preferences
  if (!healed.preferences) {
    healed.preferences = {
      theme: null,
      themePack: null,
      themeVariants: null
    }
  }

  return healed
}

/**
 * Orchestrates the migration pipeline
 */
export function migrateData(envelope: BackupEnvelope, currentAppVersion: string): BackupEnvelope['data'] {
  let data = cloneDeep(envelope.data)
  // Simple semver comparison logic could go here if we had complex chains.
  // For now, we apply the Healing strategy which is robust enough for 
  // structure changes (adding new fields).
  
  // Apply explicit version migrations if we had them
  // ...

  // Apply Healing (Structural Integrity)
  return healData(data)
}
