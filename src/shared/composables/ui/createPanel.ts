import { ref, shallowRef, computed, nextTick, watch, markRaw, type Ref, type ComputedRef } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useDraggable } from '@utils/misc/draggable';
import { appStorage } from '@services/storage';
import {
  PanelOptions,
  PanelAPI,
  ToggleOptions,
  DraggableReturn
} from './types';

/**
 * Create and manage a UI panel with persistence, responsive behavior and optional dragging.
 *
 * The returned API exposes reactive refs and methods to open/close/toggle the panel,
 * react to viewport changes, and update dimension calculations when content changes.
 *
 * @param options - Configuration for the panel behavior and persistence key.
 * @returns PanelAPI - Reactive state and methods to control the panel.
 */
export function createPanel(options: PanelOptions = {}): PanelAPI {
  const {
    storageKey,
    defaultDesktopState = false,
    initialIsMobile = false,
    animation = () => false,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options;

  if (!storageKey) {
    // If there's no storage key we return a no-op API to avoid runtime errors.
    console.error('usePanel requires a storageKey option.');
    return markRaw({
      isOpen: shallowRef(false),
      preloadIsOpen: shallowRef(false),
      isMobile: shallowRef(initialIsMobile),
      isDragging: shallowRef(false),
      translateY: shallowRef(0),
      panelHeight: shallowRef(0),
      maxPanelHeight: shallowRef(0),
      isExpanded: shallowRef(false),
      handle: shallowRef(null),
      panel: shallowRef(null),
      open: async () => {},
      close: async () => {},
      toggle: () => {},
      handleResize: () => {},
      updatePanelDimensions: () => {},
    }) as PanelAPI;
  }

  // Persisted open state per device type
  const preferences = ref(appStorage.get('panels', storageKey, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  }));

  // Watch for changes and persist to storage
  watch(preferences, (newVal) => appStorage.set('panels', storageKey, newVal), { deep: true });

  // Compute initial open state from persisted preferences synchronously
  const initialIsOpen: ComputedRef<boolean> = computed(() =>
    initialIsMobile ? preferences.value.mobile.isOpen : preferences.value.desktop.isOpen
  );

  const currentIsMobile: Ref<boolean> = shallowRef(initialIsMobile);
  const deviceContext: ComputedRef<'mobile' | 'desktop'> = computed(() =>
    currentIsMobile.value ? 'mobile' : 'desktop'
  );

  const isOpen: Ref<boolean> = shallowRef(initialIsOpen.value);
  const isExpanded: Ref<boolean> = shallowRef(false);

  const handle: Ref<HTMLElement | null> = shallowRef(null);
  const panel: Ref<HTMLElement | null> = shallowRef(null);

  // Debounced update to persisted preferences to limit storage writes
  const updatePreferences = useDebounceFn(() => {
    preferences.value[deviceContext.value].isOpen = isOpen.value;
  }, 300);

  const draggable: DraggableReturn = useDraggable({
    panel,
    handle,
    isOpen,
    isExpanded,
    maxHeightRatio,
    snapThreshold,
    maxHeight,
  });

  /**
   * Close the panel.
   * @param isMobile - whether the close is occurring on mobile context (defaults to current context)
   */
  const close = async (isMobile: boolean = currentIsMobile.value): Promise<void> => {
    currentIsMobile.value = isMobile;

    if (isMobile && animation() && draggable?.animateClose) {
      await draggable.animateClose();
    } else {
      isOpen.value = false;
    }

    // Reset expanded state shortly after closing to allow any animation to finish
    setTimeout(() => (isExpanded.value = false), 300);
    updatePreferences();
  };

  /**
   * Open the panel and set up draggable behavior on mobile if configured.
   * @param isMobile - whether the open should run in mobile mode (defaults to current context)
   */
  const open = async (isMobile: boolean = currentIsMobile.value): Promise<void> => {
    currentIsMobile.value = isMobile;
    isOpen.value = true;
    updatePreferences();

    if (isMobile && animation() && draggable) {
      await nextTick();
      draggable.animateOpen?.();

      const success = draggable.setupDraggable?.();
      if (!success) {
        console.warn(`[createPanel ${storageKey}]: Draggable setup failed (handle likely not found).`);
      }
    }
  };

  /**
   * Toggle open/close or mobile-expanded state.
   * @param options.expanded - if true, toggles the expanded mobile state instead of open/close
   * @param options.isMobile - override current device context for the toggle
   */
  const toggle = (options: ToggleOptions = {}): void => {
    const { expanded = false, isMobile = currentIsMobile.value } = options;

    if (expanded) {
      // Only allow expansion on mobile while the panel is open
      if (!currentIsMobile.value || !isOpen.value) return;
      isExpanded.value = !isExpanded.value;
      if (draggable) nextTick(updatePanelDimensions);
      updatePreferences();
      return;
    }

    if (isOpen.value) close(isMobile);
    else open(isMobile);
  };

  /**
   * Respond to viewport/device changes.
   * @param newIsMobile - whether the new context should be considered mobile
   */
  const handleResize = (newIsMobile: boolean): void => {
    if (currentIsMobile.value === newIsMobile) return;
    currentIsMobile.value = newIsMobile;

    // On switch to mobile collapse the panel; on switch to desktop restore desktop preference
    isOpen.value = newIsMobile ? false : preferences.value.desktop.isOpen;
    updatePreferences();

    if (draggable) nextTick(updatePanelDimensions);
  };

  const updatePanelDimensions = useDebounceFn(() => {
    draggable?.updatePanelDimensions?.();
  }, 100);

  // Persist changes to open/expanded state
  watch([isOpen, isExpanded], updatePreferences, { flush: 'post' });

  const api: PanelAPI = {
    isOpen,
    preloadIsOpen: initialIsOpen,
    isMobile: currentIsMobile,
    isExpanded,
    panel,
    handle,
    open,
    close,
    toggle,
    handleResize,
    updatePanelDimensions,

    isDragging: draggable?.isDragging ?? shallowRef(false),
    translateY: draggable?.translateY ?? shallowRef(0),
    panelHeight: draggable?.panelHeight ?? shallowRef(0),
    maxPanelHeight: draggable?.maxPanelHeight ?? shallowRef(0),
  };

  return api;
}