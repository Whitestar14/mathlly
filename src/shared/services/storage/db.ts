import Dexie, { type Table } from "dexie";
import { DEFAULT_SETTINGS } from '@stores/settings';
import type { RGB } from '@color/lib/color'

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  expression?: string;
  result?: string;
  mode?: string;
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
}

export class PrismDatabase extends Dexie {
  history!: Table<HistoryEntry>;
  settings!: Table<Settings>;
  memory!: Table<MemoryItem>;
  palettes!: Table<Palette>;

  constructor() {
    super('prism-app');

    this.version(2).stores({
      history: '++id, timestamp',
      settings: 'id',
      memory: '++id, slot, value, label, mode, timestamp',
      palettes: 'id, name, createdAt'
    });
  }
}

/**
 * Resets the entire database by closing, deleting it, and then reloading the page.
 * @param dbInstance The instance of the database to reset.
 * @returns A promise that resolves to true on success, false on error.
 */
export async function resetDatabase(dbInstance: PrismDatabase): Promise<boolean> {
  try {
    dbInstance.close();
    await Dexie.delete('prism-app');
     
    window.location.reload();
     
    return true;
  } catch (error) {
    console.error("Error resetting database:", error);
    return false;
  }
}

const db = new PrismDatabase();

db.on("ready", async () => {
  try {
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error("DB: Error initializing database:", error);
  }
});

export default db;