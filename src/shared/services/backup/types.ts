
import type { Settings, HistoryEntry, MemoryItem, Palette } from '@services/storage/db'
import type { AppDataBlob } from '@stores/appStorage'

export interface BackupMetadata {
  version: string
  timestamp: number
  userAgent: string
  platform: string
}

export interface DatabasePayload {
  settings: Settings[]
  history: HistoryEntry[]
  memory: MemoryItem[]
  palettes: Palette[]
}

export interface ThemePreferences {
  theme: string | null
  themePack: string | null
  themeVariants: string | null
}

export interface BackupEnvelope {
  meta: BackupMetadata
  data: {
    db: DatabasePayload
    local: AppDataBlob
    preferences?: ThemePreferences
  }
}

export interface MigrationContext {
  fromVersion: string
  toVersion: string
  payload: any
}

export type MigrationFunction = (data: any) => any
