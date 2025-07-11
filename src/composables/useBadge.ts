import { computed, type ComputedRef } from 'vue';

export type BadgeVariant = 'soon' | 'new' | 'custom' | 'special' | 'beta' | 'alpha' | 'warning' | 'success' | 'info';

export interface BadgeConfig {
  text: string;
  classes: string;
  notch: string;
  shouldPulse: boolean;
}

const BADGE_CONFIGS: Record<BadgeVariant, Omit<BadgeConfig, 'shouldPulse'>> = {
  soon: {
    text: 'Coming Soon',
    classes: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground',
    notch: 'bg-muted-foreground dark:bg-muted-foreground',
  },
  new: {
    text: 'New',
    classes: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30',
    notch: 'bg-green-500 dark:bg-green-400',
  },
  custom: {
    text: '',
    classes: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/20 dark:border-primary/30',
    notch: 'bg-primary dark:bg-primary',
  },
  special: {
    text: 'Special',
    classes: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30',
    notch: 'bg-yellow-500 dark:bg-yellow-400',
  },
  beta: {
    text: 'Beta',
    classes: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30',
    notch: 'bg-purple-500 dark:bg-purple-400',
  },
  alpha: {
    text: 'Alpha',
    classes: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/30',
    notch: 'bg-pink-500 dark:bg-pink-400',
  },
  warning: {
    text: 'Warning',
    classes: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30',
    notch: 'bg-orange-500 dark:bg-orange-400',
  },
  success: {
    text: 'Success',
    classes: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30',
    notch: 'bg-emerald-500 dark:bg-emerald-400',
  },
  info: {
    text: 'Info',
    classes: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30',
    notch: 'bg-blue-500 dark:bg-blue-400',
  },
};

/**
 * Composable for creating consistent badge styling
 */
export function useBadge(variant: BadgeVariant = 'soon', customText: string = ''): ComputedRef<BadgeConfig> {
  const config = BADGE_CONFIGS[variant] || BADGE_CONFIGS.soon;
  
  return computed(() => ({
    text: customText || config.text,
    classes: config.classes,
    notch: config.notch,
    shouldPulse: variant === 'new'
  }));
}
