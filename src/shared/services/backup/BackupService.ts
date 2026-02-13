
import db, { type PrismDatabase } from '@services/storage/db'
import { useAppStorageStore } from '@stores/appStorage'
import { useVersionStore } from '@stores/version'
import { migrateData } from './migrations'
import type { BackupEnvelope, DatabasePayload, ThemePreferences } from './types'
import pkg from '../../../../package.json'

export class BackupService {
  
  /**
   * Generates a complete backup of the application state
   */
  static async createBackup(): Promise<Blob> {
    const storageStore = useAppStorageStore()
    
    // 1. Gather DB Data
    const dbPayload: DatabasePayload = {
      settings: await db.settings.toArray(),
      history: await db.history.toArray(),
      memory: await db.memory.toArray(),
      palettes: await db.palettes.toArray()
    }

    // 2. Gather Local Storage Data (Pinia)
    // We force a load to ensure we have latest
    const localPayload = storageStore.blob

    // 3. Gather Theme Preferences
    const preferences: ThemePreferences = {
      theme: localStorage.getItem('app:theme'),
      themePack: localStorage.getItem('app:theme-pack'),
      themeVariants: localStorage.getItem('app:theme-variants')
    }

    // 4. Construct Envelope
    const envelope: BackupEnvelope = {
      meta: {
        version: pkg.version,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      },
      data: {
        db: dbPayload,
        local: localPayload,
        preferences
      }
    }

    const json = JSON.stringify(envelope, null, 2)
    return new Blob([json], { type: 'application/json' })
  }

  /**
   * Restores data from a backup file
   */
  static async restoreBackup(file: File): Promise<void> {
    const text = await file.text()
    let envelope: BackupEnvelope

    // 1. Parse & Validate Structure
    try {
      envelope = JSON.parse(text)
      if (!envelope.meta || !envelope.data || !envelope.data.db) {
        throw new Error('Invalid backup file format')
      }
    } catch (e) {
      throw new Error('Failed to parse backup file')
    }

    // 2. Migrate & Heal Data
    const cleanedData = migrateData(envelope, pkg.version)

    // 3. Atomic Write (Clear & Fill)
    await db.transaction('rw', db.settings, db.history, db.memory, db.palettes, async () => {
      // Clear existing
      await Promise.all([
        db.settings.clear(),
        db.history.clear(),
        db.memory.clear(),
        db.palettes.clear()
      ])

      // Bulk Add
      await Promise.all([
        db.settings.bulkAdd(cleanedData.db.settings),
        db.history.bulkAdd(cleanedData.db.history),
        db.memory.bulkAdd(cleanedData.db.memory),
        db.palettes.bulkAdd(cleanedData.db.palettes)
      ])
    })

    // 4. Restore Local Storage
    // We write directly to localStorage to ensure it persists across reload
    // using the key defined in appStorage.ts
    if (cleanedData.local) {
      localStorage.setItem('app:data', JSON.stringify(cleanedData.local))
    }

    // 5. Restore Theme Preferences
    if (cleanedData.preferences) {
      if (cleanedData.preferences.theme) localStorage.setItem('app:theme', cleanedData.preferences.theme)
      if (cleanedData.preferences.themePack) localStorage.setItem('app:theme-pack', cleanedData.preferences.themePack)
      if (cleanedData.preferences.themeVariants) localStorage.setItem('app:theme-variants', cleanedData.preferences.themeVariants)
    }

    // 6. Reload Application
    window.location.reload()
  }

  static getFilename(): string {
    const date = new Date().toISOString().split('T')[0]
    return `prism-backup-${date}-v${pkg.version}.json`
  }
}
