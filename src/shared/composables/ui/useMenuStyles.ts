import { type ComputedRef } from 'vue';
import type { NavigationItem } from './useSidebarNavigation';

/**
 * Composable for menu item styling logic
 */
export function useMenuStyles(currentPill: ComputedRef<string>) {
  const getMenuItemClasses = (item: NavigationItem): string => {
    const baseClasses = "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors duration-200";
    
    if (currentPill.value === item.path) {
      return `${baseClasses} bg-accent/70 hover:bg-accent text-primary font-medium`;
    }
    
    let classes = `${baseClasses} text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground`;
    
    if (item.comingSoon) {
      classes += ' opacity-50 disabled:hover:!bg-inherit disabled:hover:text-muted-foreground';
    }
    
    return classes;
  };

  const getFooterItemClasses = (path: string): string[] => {
    return [
      'flex w-full items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors duration-200',
      currentPill.value === path
        ? 'bg-accent/70 text-primary'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
    ];
  };

  const getIconClasses = (path: string): string => {
    return currentPill.value === path
      ? 'text-primary'
      : 'text-muted-foreground/80';
  };

  return {
    getMenuItemClasses,
    getFooterItemClasses,
    getIconClasses
  };
}
