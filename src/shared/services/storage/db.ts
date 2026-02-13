import Dexie, { type Table } from 'dexie'
import { DEFAULT_SETTINGS } from '@stores/settings'
import type { RGB } from '@color/lib/color'

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  expression?: string;
  result?: string;
  mode?: string;
  base?: string;
  baseValues?: Record<string, string>;
}

export interface MemoryItem {
  id?: number;
  slot: number;
  value: string;
  label?: string;
  mode: string;
  timestamp: number;
}

export interface Palette {
  id?: string;
  name: string;
  colors: RGB[];
  createdAt: number;
}

export interface Settings {
  id: number;
  display: {
    textSize: string;
  };
  appearance: {
    animationDisabled: boolean;
    checkForUpdates: boolean;
    borderRadius: string;
  };
  startup: {
    navigation: string;
  };
  keyboard: {
    shortcutsEnabled: boolean;
  };
  experimental: {
    commandPaletteEnabled: boolean;
    devDockEnabled: boolean;
    homeLayout: 'classic' | 'dashboard';
  };
  privacy: {
    crashReportingEnabled: boolean;
  };
}

export class PrismDatabase extends Dexie {
  history!: Table<HistoryEntry>
  settings!: Table<Settings>
  memory!: Table<MemoryItem>
  palettes!: Table<Palette>

  constructor() {
    super('prism-app');

    (this as any).version(2).stores({
      settings: 'id',
      history: '++id, mode, timestamp, [mode+timestamp]',
      memory: '++id, slot, value, label, mode, timestamp',
      palettes: 'id, name, createdAt'
    })
  }
}

/**
 * Resets the entire database by closing, deleting it, and then reloading the page.
 * @param dbInstance The instance of the database to reset.
 * @returns A promise that resolves to true on success, false on error.
 */
export async function resetDatabase(dbInstance: PrismDatabase): Promise<boolean> {
  try {
    (dbInstance as any).close()
    await Dexie.delete('prism-app')
    
    // Targeted clear instead of localStorage.clear()
    // This prevents destroying data from other apps on the same domain (e.g. localhost)
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('app:') || key.startsWith('prism-') || key === 'last-version-check')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))

    window.location.reload()

    return true
  } catch(error) {
    console.error('Error resetting database:', error)
    return false
  }
}

const db = new PrismDatabase();

(db as any).on('ready', async() => {
  try {
    const settingsCount = await db.settings.count()
    if (settingsCount === 0) {
      await db.settings.add(DEFAULT_SETTINGS)
    }
  } catch(error) {
    console.error('DB: Error initializing database:', error)
  }
})

export default db
