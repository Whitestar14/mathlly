export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type ThemeOption = typeof THEME_OPTIONS[keyof typeof THEME_OPTIONS];

export const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

const PRESETS = {
  vibrant: {
    primary: 'bg-indigo-500 dark:bg-indigo-400',
    secondary: 'bg-indigo-200 dark:bg-indigo-300',
    accent: 'bg-indigo-50 dark:bg-indigo-950/50',
    border: 'border-indigo-300 dark:border-indigo-600',
    selectedBorder: 'border-indigo-500 dark:border-indigo-400',
    selectedBg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
    selectedText: 'text-indigo-700 dark:text-indigo-300',
    hoverBg: 'hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20',
  },
  neutral: {
    primary: 'bg-zinc-700 dark:bg-zinc-400',
    secondary: 'bg-zinc-300 dark:bg-zinc-500',
    accent: 'bg-zinc-50 dark:bg-zinc-900/50',
    border: 'border-zinc-300 dark:border-zinc-600',
    selectedBorder: 'border-zinc-500 dark:border-zinc-400',
    selectedBg: 'bg-zinc-50/50 dark:bg-zinc-900/30',
    selectedText: 'text-zinc-700 dark:text-zinc-300',
    hoverBg: 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20',
  },
  ayu: {
    primary: 'bg-amber-500 dark:bg-amber-400',
    secondary: 'bg-amber-200 dark:bg-amber-700',
    accent: 'bg-sky-100 dark:bg-sky-800/40',
    border: 'border-amber-300 dark:border-amber-600',
    selectedBorder: 'border-amber-500 dark:border-amber-400',
    selectedBg: 'bg-amber-50/50 dark:bg-slate-900/30',
    selectedText: 'text-amber-700 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-50/30 dark:hover:bg-slate-900/20',
  },
  siena: {
    primary: 'bg-amber-700 dark:bg-amber-600',
    secondary: 'bg-amber-300 dark:bg-amber-800',
    accent: 'bg-orange-100 dark:bg-orange-900/40',
    border: 'border-amber-400 dark:border-amber-700',
    selectedBorder: 'border-amber-600 dark:border-amber-500',
    selectedBg: 'bg-amber-50/50 dark:bg-stone-900/30',
    selectedText: 'text-amber-800 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-50/30 dark:hover:bg-stone-900/20',
  },
  monaco: {
    primary: 'bg-sky-600 dark:bg-sky-500',
    secondary: 'bg-sky-200 dark:bg-sky-700',
    accent: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-sky-300 dark:border-sky-600',
    selectedBorder: 'border-sky-500 dark:border-sky-400',
    selectedBg: 'bg-sky-50/50 dark:bg-slate-900/30',
    selectedText: 'text-sky-700 dark:text-sky-300',
    hoverBg: 'hover:bg-sky-50/30 dark:hover:bg-slate-900/20',
  },
} as const;

type PresetName = keyof typeof PRESETS;

function createPack<Id extends string>(id: Id, opts: {
  name: string;
  description?: string;
  preset?: PresetName;
  preview?: { light: string; dark: string };
  pwaColors?: { light: string; dark: string };
  default?: boolean;
  visual?: any;
  variants?: string[];
}) {
  const visualColors = opts.visual ? opts.visual : PRESETS[opts.preset ?? 'neutral'];
  const preview = opts.preview ?? { light: opts.pwaColors?.light ?? '#ffffff', dark: opts.pwaColors?.dark ?? '#000000' };
  const pwaColors = opts.pwaColors ?? preview;

  return {
    id,
    name: opts.name,
    description: opts.description,
    preview,
    visual: { colors: visualColors },
    pwaColors,
    default: !!opts.default,
    variants: opts.variants ?? []
  } as const;
}

const THEME_PACK_LIST = [
  createPack('orion', {
    name: 'Orion',
    description: 'Classic indigo theme with vibrant accents and familiar patterns',
    preset: 'vibrant',
    preview: { light: '#4f46e5', dark: '#818cf8' },
    pwaColors: { light: '#5a00ff', dark: '#6e89ff' },
    default: false,
  }),
  createPack('mira', {
    name: 'Mira',
    description: 'Modern minimalist design with clean lines and neutral tones',
    preset: 'neutral',
    preview: { light: '#18181b', dark: '#fafafa' },
    pwaColors: { light: '#18181b', dark: '#fafafa' },
    default: true,
  }),
  createPack('siena', {
    name: 'Siena',
    description: 'Warm sepia tones inspired by aged paper and earth',
    preset: 'siena',
    preview: { light: '#C19A6B', dark: '#8B6F47' },
    pwaColors: { light: '#ede3dc', dark: '#8B6F47' },
    default: false,
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
  createPack('monaco', {
    name: 'Monaco',
    description: 'VS Code inspired theme with cool blue-gray tones',
    preset: 'monaco',
    preview: { light: '#007ACC', dark: '#569CD6' },
    pwaColors: { light: '#007ACC', dark: '#569CD6' },
    default: false,
  }),
] as const;

// Derive a union type of pack ids from the list so consumers get a single source-of-truth type.
export type ThemePackOption = (typeof THEME_PACK_LIST)[number]['id'];

// Public lightweight mapping used by UI components (name/description/preview/default).
export const themePackConfigs: Record<ThemePackOption, { id: ThemePackOption; name: string; description?: string; preview?: { light: string; dark: string }; default?: boolean, variants?: string[] }> = Object.fromEntries(
  THEME_PACK_LIST.map((p) => [p.id, { id: p.id, name: p.name, description: (p as any).description, preview: (p as any).preview, default: (p as any).default, variants: (p as any).variants }])
) as Record<ThemePackOption, any>;

// Export an array suitable for select controls
export const themePackOptions = THEME_PACK_LIST.map((p) => ({ value: p.id as ThemePackOption, label: p.name }));

// Map to hold runtime-registered packs (visuals/pwaColors)
const RUNTIME_PACKS: Record<string, any> = {};

// Helpers for accessing visuals and PWA colors
export function getThemeVisualConfig(packKey: ThemePackOption) {
  if ((RUNTIME_PACKS as any)[packKey]) return (RUNTIME_PACKS as any)[packKey].visual;
  return (THEME_PACK_LIST as any).find((p: any) => p.id === packKey)?.visual;
}

export function getThemeColor(packKey: ThemePackOption, darkMode: boolean) {
  if ((RUNTIME_PACKS as any)[packKey]) return (RUNTIME_PACKS as any)[packKey].pwaColors?.[darkMode ? 'dark' : 'light'];
  return (THEME_PACK_LIST as any).find((p: any) => p.id === packKey)?.pwaColors?.[darkMode ? 'dark' : 'light'];
}

// Optional runtime registration helper if someone wants to add packs dynamically (rare). This mutates the public exports so consumers can pick up runtime additions.
export function registerThemePack<Id extends string>(id: Id, def: {
  name: string;
  description?: string;
  preview?: { light: string; dark: string };
  preset?: PresetName;
  visual?: any;
  pwaColors: { light: string; dark: string };
  default?: boolean;
  variants?: string[];
}) {
  const visual = def.visual ?? PRESETS[def.preset ?? 'neutral'];
  // store runtime visuals & pwaColors for helper lookup
  (RUNTIME_PACKS as any)[id] = { visual, pwaColors: def.pwaColors };

  // Add to the public helpers so runtime consumers can iterate
  (themePackConfigs as any)[id] = { id, name: def.name, description: def.description, preview: def.preview, default: !!def.default };
  (themePackOptions as any).push({ value: id as any, label: def.name });
  // Note: runtime packs are not reflected in the compile-time ThemePackOption type.
}

// Default pack (first pack marked default in the single source-of-truth)
export const DEFAULT_THEME_PACK: ThemePackOption = (THEME_PACK_LIST.find((p) => (p as any).default)?.id as ThemePackOption) ?? (THEME_PACK_LIST[0].id as ThemePackOption);