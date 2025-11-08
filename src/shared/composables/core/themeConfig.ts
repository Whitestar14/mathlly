export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export type ThemeOption = typeof THEME_OPTIONS[keyof typeof THEME_OPTIONS]

export const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
] as const

const PRESETS = {
  orion: {
    primary: 'bg-indigo-500 dark:bg-indigo-400',
    secondary: 'bg-indigo-200 dark:bg-indigo-300',
    accent: 'bg-indigo-50 dark:bg-indigo-950/50',
    border: 'border-indigo-300 dark:border-indigo-600',
    selectedBorder: 'border-indigo-500 dark:border-indigo-400',
    selectedBg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
    selectedText: 'text-indigo-700 dark:text-indigo-300',
    hoverBg: 'hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
  },
  mira: {
    primary: 'bg-zinc-700 dark:bg-zinc-400',
    secondary: 'bg-zinc-300 dark:bg-zinc-500',
    accent: 'bg-zinc-50 dark:bg-zinc-900/50',
    border: 'border-zinc-300 dark:border-zinc-600',
    selectedBorder: 'border-zinc-500 dark:border-zinc-400',
    selectedBg: 'bg-zinc-50/50 dark:bg-zinc-900/30',
    selectedText: 'text-zinc-700 dark:text-zinc-300',
    hoverBg: 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20'
  },
  ayu: {
    primary: 'bg-amber-500 dark:bg-amber-400',
    secondary: 'bg-amber-200 dark:bg-amber-700',
    accent: 'bg-sky-100 dark:bg-sky-800/40',
    border: 'border-amber-300 dark:border-amber-600',
    selectedBorder: 'border-amber-500 dark:border-amber-400',
    selectedBg: 'bg-amber-50/50 dark:bg-slate-900/30',
    selectedText: 'text-amber-700 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-50/30 dark:hover:bg-slate-900/20'
  },
  siena: {
    primary: 'bg-amber-700 dark:bg-amber-600',
    secondary: 'bg-amber-300 dark:bg-amber-800',
    accent: 'bg-orange-100 dark:bg-orange-900/40',
    border: 'border-amber-400 dark:border-amber-700',
    selectedBorder: 'border-amber-600 dark:border-amber-500',
    selectedBg: 'bg-amber-50/50 dark:bg-stone-900/30',
    selectedText: 'text-amber-800 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-50/30 dark:hover:bg-stone-900/20'
  },
  dracula: {
    primary: 'bg-violet-500 dark:bg-violet-400',
    secondary: 'bg-pink-400 dark:bg-pink-400',
    accent: 'bg-slate-100 dark:bg-slate-700/50',
    border: 'border-slate-300 dark:border-slate-600',
    selectedBorder: 'border-violet-500 dark:border-violet-400',
    selectedBg: 'bg-violet-50/50 dark:bg-slate-800/30',
    selectedText: 'text-violet-700 dark:text-violet-300',
    hoverBg: 'hover:bg-violet-50/30 dark:hover:bg-slate-800/20'
  }
} as const

type PresetName = keyof typeof PRESETS

function createPack<Id extends string>(id: Id, opts: {
  name: string
  description?: string
  preset?: PresetName
  preview?: { light: string; dark: string }
  pwaColors?: { light: string; dark: string }
  default?: boolean
  visual?: any
  variants?: string[]
}) {
  const visualColors = opts.visual ? opts.visual : PRESETS[opts.preset ?? 'mira']
  const preview = opts.preview ?? { light: opts.pwaColors?.light ?? '#ffffff', dark: opts.pwaColors?.dark ?? '#000000' }
  const pwaColors = opts.pwaColors ?? preview

  return {
    id,
    name: opts.name,
    description: opts.description,
    preview,
    visual: { colors: visualColors },
    pwaColors,
    default: !!opts.default,
    variants: opts.variants ?? []
  } as const
}

const THEME_PACK_LIST = [
  createPack('orion', {
    name: 'Orion',
    description: 'Classic indigo theme with vibrant accents and familiar patterns',
    preset: 'orion',
    preview: { light: '#4f46e5', dark: '#818cf8' },
    pwaColors: { light: '#5a00ff', dark: '#6e89ff' },
    default: false
  }),
  createPack('mira', {
    name: 'Mira',
    description: 'Modern minimalist design with clean lines and neutral tones',
    preset: 'mira',
    preview: { light: '#18181b', dark: '#fafafa' },
    pwaColors: { light: '#18181b', dark: '#fafafa' },
    default: true
  }),
  createPack('siena', {
    name: 'Siena',
    description: 'Warm sepia tones inspired by aged paper and earth',
    preset: 'siena',
    preview: { light: '#C19A6B', dark: '#8B6F47' },
    pwaColors: { light: '#ede3dc', dark: '#8B6F47' },
    default: false
  }),
  createPack('ayu', {
    name: 'Ayu',
    description: 'Orange-forward accents with balanced neutrals for a comfortable UI.',
    preset: 'ayu',
    preview: { light: '#ffaa33', dark: '#1b1d1f' },
    pwaColors: { light: '#ffaa33', dark: '#f4a028' },
    default: false,
    variants: ['bordered']
  }),
  createPack('dracula', {
    name: 'Dracula',
    description: 'Vibrant theme with a dark purple background and bold accents.',
    preset: 'dracula',
    preview: { light: '#bd93f9', dark: '#ff79c6' },
    pwaColors: { light: '#bd93f9', dark: '#282a36' },
    default: false,
    variants: ['darkened']
  })
] as const

export type ThemePackOption = (typeof THEME_PACK_LIST)[number]['id']

export const themePackConfigs: Record<ThemePackOption, { id: ThemePackOption; name: string; description?: string; preview?: { light: string; dark: string }; default?: boolean, variants?: string[] }> = Object.fromEntries(
  THEME_PACK_LIST.map(p => [p.id, { id: p.id, name: p.name, description: (p as any).description, preview: (p as any).preview, default: (p as any).default, variants: (p as any).variants }])
) as Record<ThemePackOption, any>

export const themePackOptions = THEME_PACK_LIST.map(p => ({ value: p.id as ThemePackOption, label: p.name }))

const RUNTIME_PACKS: Record<string, any> = {}

export function getThemeVisualConfig(packKey: ThemePackOption) {
  if ((RUNTIME_PACKS as any)[packKey]) return (RUNTIME_PACKS as any)[packKey].visual
  return (THEME_PACK_LIST as any).find((p: any) => p.id === packKey)?.visual
}

export function getThemeColor(packKey: ThemePackOption, darkMode: boolean) {
  if ((RUNTIME_PACKS as any)[packKey]) return (RUNTIME_PACKS as any)[packKey].pwaColors?.[darkMode ? 'dark' : 'light']
  return (THEME_PACK_LIST as any).find((p: any) => p.id === packKey)?.pwaColors?.[darkMode ? 'dark' : 'light']
}

export function registerThemePack<Id extends string>(id: Id, def: {
  name: string
  description?: string
  preview?: { light: string; dark: string }
  preset?: PresetName
  visual?: any
  pwaColors: { light: string; dark: string }
  default?: boolean
  variants?: string[]
}) {
  const visual = def.visual ?? PRESETS[def.preset ?? 'mira'];

  (RUNTIME_PACKS as any)[id] = { visual, pwaColors: def.pwaColors };

  (themePackConfigs as any)[id] = { id, name: def.name, description: def.description, preview: def.preview, default: !!def.default };
  (themePackOptions as any).push({ value: id as any, label: def.name })
}

export const DEFAULT_THEME_PACK: ThemePackOption = (THEME_PACK_LIST.find(p => (p as any).default)?.id as ThemePackOption) ?? (THEME_PACK_LIST[0].id as ThemePackOption)
