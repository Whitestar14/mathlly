// src/composables/core/usePWATheme.ts
import { ref } from 'vue';
export function usePWATheme() {
  const isInitialized = ref(false);
  if (typeof window !== 'undefined') {
    // Log once to help developers migrate away from this helper
    console.warn('[usePWATheme] deprecated: useTheme now handles PWA meta updates directly');
    isInitialized.value = true;
  }
  return { updatePWATheme: () => {} };
}
