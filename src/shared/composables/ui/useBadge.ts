/**
 * Available badge variant types for type safety
 */
export type BadgeVariant =
  | 'default' | 'soon' | 'new' | 'custom' | 'accent' | 'special' |
  'beta' | 'alpha' | 'warning' | 'success' | 'info'

/**
 * Standard badge styling with your original sophisticated colors
 */
export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600',
  soon: 'bg-muted text-muted-foreground',
  new: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30',
  custom: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/20 dark:border-primary/30',
  accent: 'bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20 dark:border-accent/30',
  special: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30',
  beta: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30',
  alpha: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/30',
  warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30'
}
