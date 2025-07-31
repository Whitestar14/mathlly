import { shallowRef, watch, readonly, type Ref } from 'vue';
import { useRoute, type RouteLocationNormalized } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { isHandlingError, networkStatus } from '@router/errorHandler';

const currentTitle: Ref<string> = shallowRef('Mathlly');
const titleHistory: Ref<string[]> = shallowRef([]);
const APP_NAME = 'Mathlly';

/**
 * Return type for the useTitle composable
 */
export interface PageTitleReturn {
  /** Function to manually set a new page title */
  setTitle: (newTitle: string) => void;
  /** Reactive reference to the current title */
  title: Ref<string>;
  /** Read-only reference to the current document title */
  currentTitle: Readonly<Ref<string>>;
}

/**
 * Manages the page title for the application, handling both static and dynamic title updates.
 * 
 * @param title - Initial title to set for the page
 * @returns Object containing title management utilities
 */
export function useTitle(title: string | Ref<string> = ''): PageTitleReturn {
  const route: RouteLocationNormalized = useRoute();
  const titleRef: Ref<string> = shallowRef(typeof title === 'string' ? title : title.value || '');

  /**
   * Formats a title with the app name
   * @param newTitle - The title to format
   * @returns The formatted title
   */
  const formatTitle = (newTitle: string): string => {
    return newTitle ? `${newTitle} - ${APP_NAME}` : APP_NAME;
  };

  /**
   * Sets a new page title with proper formatting and history tracking
   * @param newTitle - The new title to set
   */
  const setTitle = useDebounceFn((newTitle: string): void => {
    if (isHandlingError.value && !route.meta.errorPage) return;

    const formattedTitle = formatTitle(newTitle);

    if (titleHistory.value.length >= 5) {
      titleHistory.value.shift();
    }
    titleHistory.value.push(formattedTitle);

    if (document.title !== formattedTitle) {
      document.title = formattedTitle;
      currentTitle.value = formattedTitle;
    }
  }, 50);

  // Handle reactive title updates
  if (typeof title !== 'string') {
    watch(title, (newTitle: string) => {
      titleRef.value = newTitle;
    }, { immediate: true });
  }

  watch(
    [titleRef, () => route.path, networkStatus],
    ([newTitle, , isOnline]: [string, string, boolean]) => {
      const currentTitle = newTitle || (typeof title === 'string' ? title : title.value || '');
      
      if (!isOnline && !route.meta.errorPage) {
        const offlineTitle = currentTitle ? `${currentTitle} (Offline)` : 'Offline';
        setTitle(offlineTitle);
      } else {
        setTitle(currentTitle);
      }
    },
    { immediate: true }
  );

  return {
    setTitle,
    title: titleRef,
    currentTitle: readonly(currentTitle)
  };
}
