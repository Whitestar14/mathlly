import { ref, readonly, onUnmounted, type Ref } from 'vue';
import { useTimeoutFn, useThrottleFn } from '@vueuse/core';

// Constants
const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 5;

// Types
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id?: number;
  message?: string;
  description?: string;
  title?: string;
  type?: ToastType;
  dismissible?: boolean;
  duration?: number;
}

export interface Toast extends Required<Omit<ToastData, 'description'>> {
  description?: string;
}

export interface ToastOptions {
  title?: string;
  type?: ToastType;
  dismissible?: boolean;
  duration?: number;
}

// Shared toast state - only create once for the entire application
const toasts: Ref<Toast[]> = ref([]);
const timeoutCleanups = new Map<number, () => void>();

/**
 * Composable for managing toast notifications
 */
export function useToast() {
  // Create a throttled function for adding toasts to prevent spam
  const addToast = useThrottleFn((toastData: ToastData) => {
    const id = Date.now();
    
    // Limit the number of toasts
    if (toasts.value.length >= MAX_TOASTS) {
      // Remove the oldest toast
      const oldestToast = toasts.value[0];
      if (oldestToast) {
        removeToast(oldestToast.id);
      }
    }

    // Add the new toast with defaults
    const newToast: Toast = { 
      id, 
      type: 'info',
      dismissible: true,
      duration: DEFAULT_DURATION,
      message: '',
      title: '',
      ...toastData
    };
    
    toasts.value.push(newToast);

    // Set up automatic removal if not persistent
    if (newToast.duration !== 0) {
      const { stop } = useTimeoutFn(() => {
        removeToast(id);
      }, newToast.duration);
      
      // Store cleanup function
      timeoutCleanups.set(id, stop);
    }
  }, 500); // 500ms throttle

  /**
   * Remove a toast by ID
   */
  const removeToast = (id: number): void => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
      
      // Clean up timeout if exists
      if (timeoutCleanups.has(id)) {
        const cleanup = timeoutCleanups.get(id);
        if (cleanup) {
          cleanup();
        }
        timeoutCleanups.delete(id);
      }
    }
  };

  /**
   * Clear all toasts
   */
  const clearAll = (): void => {
    // Clean up all timeouts
    timeoutCleanups.forEach(cleanup => cleanup());
    timeoutCleanups.clear();
    
    // Clear the toasts array
    toasts.value = [];
  };

  // Clean up timeouts when component is unmounted
  onUnmounted(() => {
    timeoutCleanups.forEach(cleanup => cleanup());
    timeoutCleanups.clear();
  });

  // Create a single toast method with type parameter instead of separate methods
  const toast = (message: string | ToastData, options: ToastOptions = {}): void => {
    if (typeof message === 'object') {
      // Support old API: toast({message, type, ...})
      addToast(message);
    } else {
      // New API: toast(message, {type, ...})
      addToast({ message, ...options });
    }
  };

  // Shorthand methods that use the main toast method
  const success = (message: string, options: ToastOptions = {}): void => 
    toast(message, { type: 'success', ...options });
    
  const error = (message: string, options: ToastOptions = {}): void => 
    toast(message, { type: 'error', ...options });
    
  const warning = (message: string, options: ToastOptions = {}): void => 
    toast(message, { type: 'warning', ...options });
    
  const info = (message: string, options: ToastOptions = {}): void => 
    toast(message, { type: 'info', ...options });

  return {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
    toasts: readonly(toasts),
  };
}
