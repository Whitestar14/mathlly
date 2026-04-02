/**
 * Badge Variants
 *
 * - 'default': Standard muted/gray (good for tags)
 * - 'outline': Transparent background, border only
 * - 'primary': Uses the theme's Primary color
 * - 'secondary': Uses the theme's Secondary color
 * - 'accent': Uses the theme's Accent color
 * - 'destructive': Uses the theme's Destructive color (Error state)
 * - 'new'/'success': Green/Emerald indicators
 * - 'beta'/'warning': Orange/Amber indicators
 * - 'experimental'/'info': Blue/Indigo indicators
 * - 'soon': Ghost/Muted state
 */
export type BadgeVariant =
  | 'default' | 'outline' | 'ghost' |
  'primary' | 'secondary' | 'accent' | 'custom' |
  'destructive' |
  'new' | 'success' |
  'beta' | 'warning' |
  'experimental' | 'info' | 'special' | 'soon'

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Shared Tailwind mappings for badge styles.
 * Uses semantic opacity modifiers to ensure theming works (Dracula/Orion/etc).
 */
export const BADGE_STYLES: Record<BadgeVariant, string> = {
  // 1. Structural Variants
  default: 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted/80',
  outline: 'bg-transparent border-border text-foreground hover:bg-muted/20',
  ghost:   'bg-transparent border-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground',

  // 2. Theme Variants (Respects CSS Variables)
  primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  secondary: 'bg-secondary text-secondary-foreground border-border/50 hover:bg-secondary/80',
  accent:  'bg-accent/10 text-accent border-accent/20 hover:bg-accent/15',
  custom:  'bg-primary/10 text-primary border-primary/20', // Legacy alias for primary
  destructive: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',

  // 3. Status Variants (Hardcoded colors but with soft alpha for dark mode support)
  // Green
  new:     'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',

  // Orange/Amber
  beta:    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',

  // Blue/Violet
  info:         'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  experimental: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  special:      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',

  // Gray/Disabled
  soon:    'bg-muted/30 text-muted-foreground/60 border-transparent cursor-not-allowed'
}

export const BADGE_SIZES: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 h-5', // Tight, good for dense lists
  sm: 'text-xs px-2.5 py-0.5 h-6', // Standard UI badge
  md: 'text-sm px-3 py-1 h-7', // Form status
  lg: 'text-base px-4 py-1.5 h-8' // Hero/Title badges
}
