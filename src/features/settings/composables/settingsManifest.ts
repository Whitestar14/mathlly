interface SettingsManifestItem {
  id: string;
  title: string;
  icon: string;
  keywords: string[];
}

export const settingsManifest: SettingsManifestItem[] = [
  {
    id: 'startup',
    title: 'Startup Preferences',
    icon: 'PowerIcon',
    keywords: [
      'launch',
      'open page',
      'initial screen',
      'home',
      'calculator page',
      'last visited',
      'boot',
    ],
  },
  {
    id: 'themes',
    title: 'Themes & Preferences',
    icon: 'PaletteIcon',
    keywords: [
      'appearance',
      'light mode',
      'dark mode',
      'system theme',
      'animations',
      'disable transitions',
      'visuals',
      'text size',
      'font size',
      'small',
      'normal',
      'medium',
      'large',
      'border radius',
      'sharp',
      'rounded',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: 'SettingsIcon',
    keywords: [
      'reset',
      'database',
      'clear',
      'troubleshoot',
      'fix',
      'issues',
      'problems',
      'data',
      'storage',
    ],
  },
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    icon: 'KeyboardIcon',
    keywords: [
      'shortcuts',
      'keyboard',
      'hotkeys',
      'keybindings',
      'keys',
      'bindings',
    ],
  },
];