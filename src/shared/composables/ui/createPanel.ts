import { shallowRef, computed, nextTick, watch, markRaw, type Ref, type ComputedRef } from 'vue';
import { useLocalStorage, useDebounceFn, type RemovableRef } from '@vueuse/core';
import { useDraggable } from '@utils/misc/draggable';
import {
  PanelOptions,
  PanelAPI,
  PanelPreferences,
  ToggleOptions,
  DraggableReturn
} from './types';

/**
 * Creates a single, unified panel composable with state, persistence, responsiveness, and dragging.
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

  // Early return with default values if no storageKey provided
  if (!storageKey) {
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

  // --- State Persistence ---
  // Use localStorage to remember open state per device type
  const preferences: RemovableRef<PanelPreferences> = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  // This is the new, crucial piece: read the localStorage value directly and immediately.
  const initialIsOpen: ComputedRef<boolean> = computed(() =>
    initialIsMobile ? preferences.value.mobile.isOpen : preferences.value.desktop.isOpen
  );

  // Current device context - use shallowRef for better performance
  const currentIsMobile: Ref<boolean> = shallowRef(initialIsMobile);
  const deviceContext: ComputedRef<'mobile' | 'desktop'> = computed(() =>
    currentIsMobile.value ? 'mobile' : 'desktop'
  );

  // Initialize panel state from stored preferences based on device type
  // Use the new initialIsOpen property to initialize the state.
  const isOpen: Ref<boolean> = shallowRef(initialIsOpen.value);

  // New expanded state for mobile panels
  const isExpanded: Ref<boolean> = shallowRef(false);

  // References for draggable functionality - use shallowRef for DOM elements
  const handle: Ref<HTMLElement | null> = shallowRef(null);
  const panel: Ref<HTMLElement | null> = shallowRef(null);

  /**
   * Updates the persisted preferences based on the current isOpen state and device type.
   * Debounced to reduce storage writes.
   */
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
   * Closes the panel, handling animations if applicable.
   */
  const close = async (isMobile: boolean = currentIsMobile.value): Promise<void> => {
    currentIsMobile.value = isMobile;

    if (isMobile && animation() && draggable?.animateClose) {
      await draggable.animateClose();
    } else {
      isOpen.value = false;
    }

    // Use setTimeout to ensure expanded state is reset after animation completes
    setTimeout(() => isExpanded.value = false, 300);
    updatePreferences();
  };

  /**
   * Opens the panel, handling animations and draggable setup if applicable.
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
   * Toggles the panel's open/closed state or expanded state.
   */
  const toggle = (options: ToggleOptions = {}): void => {
    const { expanded = false, isMobile = currentIsMobile.value } = options;
    if (expanded) {
      if (!currentIsMobile.value || !isOpen.value) return;
      isExpanded.value = !isExpanded.value;
      if (draggable) {
        nextTick(updatePanelDimensions);
      }
      updatePreferences();
    } else {
      if (isOpen.value) {
        close(isMobile);
      } else {
        open(isMobile);
      }
    }
  };

  /**
   * Handles responsive changes, updating state and draggable elements.
   */
  const handleResize = (newIsMobile: boolean): void => {
    if (currentIsMobile.value === newIsMobile) return;
    currentIsMobile.value = newIsMobile;

    isOpen.value = newIsMobile ? false : preferences.value.desktop.isOpen;
    updatePreferences();

    if (draggable) {
      nextTick(updatePanelDimensions);
    }
  };

  /**
   * Recalculates panel dimensions, useful after resize or content changes.
   * Debounced to prevent excessive calculations.
   */
  const updatePanelDimensions = useDebounceFn(() => {
    draggable?.updatePanelDimensions?.();
  }, 100);

  // Single watcher for state changes to reduce reactivity overhead
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
