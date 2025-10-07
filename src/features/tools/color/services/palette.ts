// @services/storage/palettes.ts
import { toRaw } from 'vue'
import db from '@services/storage/db'
import type { RGB } from '@color/lib/color'

export interface PaletteEntity {
  id: string
  name: string
  colors: RGB[]
  createdAt: number
}

// --- utils ---
function isValidRgb(c: any): c is RGB {
  return c && Number.isInteger(c.r) && Number.isInteger(c.g) && Number.isInteger(c.b)
    && c.r >= 0 && c.r <= 255 && c.g >= 0 && c.g <= 255 && c.b >= 0 && c.b <= 255
}

export function sanitizeColor(c: RGB): RGB {
  const raw = typeof c === 'object' ? toRaw(c as any) : c
  return { r: Number(raw.r), g: Number(raw.g), b: Number(raw.b) }
}

export function sanitizePalette(p: Partial<PaletteEntity>): PaletteEntity {
  const raw = typeof p === 'object' ? toRaw(p as any) : p
  const colors = Array.isArray(raw.colors) ? raw.colors.map(sanitizeColor) : []
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    colors,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  }
}

export function generateId() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
}

// --- service ---
export async function ensureDefaultPalette(): Promise<void> {
  try {
    const defaultPaletteData = sanitizePalette({
      id: 'default',
      name: 'Default palette',
      colors: [
        { r: 239, g: 68, b: 68 },
        { r: 245, g: 158, b: 11 },
        { r: 34, g: 197, b: 94 },
        { r: 59, g: 130, b: 246 },
        { r: 147, g: 51, b: 234 },
      ],
      createdAt: Date.now(),
    });

    await db.table('palettes').put(defaultPaletteData);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Key already exists')) {
      return;
    }
    throw error;
  }
}

export async function fetchPalettes(): Promise<PaletteEntity[]> {
  const all = await db.table('palettes').orderBy('createdAt').toArray()
  return (all as any[]).map(sanitizePalette)
}

export async function nameExists(name: string, excludeId?: string): Promise<boolean> {
  // Use case-insensitive check; Dexie doesn't have equalsIgnoreCase on filter, so normalize
  const all = await db.table('palettes').toArray() as PaletteEntity[]
  const target = name.toLowerCase()
  return all.some(p => p.id !== excludeId && p.name.toLowerCase() === target)
}

export async function createPalette(name: string, initialColor: RGB): Promise<PaletteEntity> {
  const palette = sanitizePalette({
    id: generateId(),
    name,
    colors: [sanitizeColor(initialColor)],
    createdAt: Date.now(),
  })
  await db.table('palettes').add(palette)
  return palette
}

export async function updatePaletteName(id: string, name: string): Promise<void> {
  await db.table('palettes').update(id, sanitizePalette({ id, name }))
}

export async function deletePalette(id: string): Promise<void> {
  await db.table('palettes').delete(id)
}

export async function addColor(id: string, color: RGB): Promise<PaletteEntity | null> {
  const p = await db.table('palettes').get(id) as PaletteEntity | undefined
  if (!p) return null
  const next = sanitizePalette({
    id: p.id,
    name: p.name,
    colors: [...p.colors.map(sanitizeColor), sanitizeColor(color)],
    createdAt: p.createdAt,
  })
  await db.table('palettes').put(next)
  return next
}

export async function removeColor(id: string, index: number): Promise<PaletteEntity | null> {
  const p = await db.table('palettes').get(id) as PaletteEntity | undefined
  if (!p) return null
  const next = sanitizePalette({
    id: p.id,
    name: p.name,
    colors: p.colors.filter((_, i) => i !== index).map(sanitizeColor),
    createdAt: p.createdAt,
  })
  await db.table('palettes').put(next)
  return next
}

export type ExportFormat = 'json' | 'hex' | 'css' | 'svg'

export function serializePalette(palette: PaletteEntity, format: ExportFormat): { blob: Blob; filename: string } {
  const safe = sanitizePalette(palette)
  let content = ''
  let mime = 'application/json'
  let ext = 'json'

  if (format === 'json') {
    content = JSON.stringify(safe, null, 2)
  } else if (format === 'hex') {
    content = safe.colors.map(c => `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`).join('\n')
    mime = 'text/plain'
    ext = 'txt'
  } else if (format === 'css') {
    content = safe.colors.map((c, i) => `--color-${i + 1}: #${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)};`).join('\n')
    mime = 'text/css'
    ext = 'css'
  } else if (format === 'svg') {
    const rects = safe.colors
      .map((c, i) => `<rect x="${i * 32}" y="0" width="32" height="32" fill="#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}"/>`)
      .join('')
    content = `<svg xmlns="http://www.w3.org/2000/svg" width="${safe.colors.length * 32}" height="32">${rects}</svg>`
    mime = 'image/svg+xml'
    ext = 'svg'
  }

  const blob = new Blob([content], { type: mime })
  const filename = `${safe.name}.${ext}`
  return { blob, filename }
}

export async function importPaletteFromJSON(text: string, maxNameLength: number): Promise<PaletteEntity> {
  const data = JSON.parse(text) as Partial<PaletteEntity>
  if (!data?.name || !Array.isArray(data?.colors)) throw new Error('Invalid palette')
  const name = String(data.name).trim()
  if (!name) throw new Error('Invalid name')
  if (name.length > maxNameLength) throw new Error('Name too long')

  const colors = (data.colors as any[]).filter(isValidRgb).map(sanitizeColor)
  if (colors.length === 0) throw new Error('No valid colors')

  // Deduplicate name
  let finalName = name
  let suffix = 1
  while (await nameExists(finalName)) {
    finalName = `${name} (${suffix++})`
  }

  // Deduplicate id
  let finalId = typeof data.id === 'string' ? data.id : generateId()
  while (await db.table('palettes').where('id').equals(finalId).count()) {
    finalId = generateId()
  }

  const imported = sanitizePalette({
    id: finalId,
    name: finalName,
    colors,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  })
  await db.table('palettes').add(imported)
  return imported
}
