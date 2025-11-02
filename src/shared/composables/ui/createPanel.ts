import { shallowRef, computed, nextTick, watch, markRaw, onUnmounted, type Ref, type ComputedRef } from 'vue';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { useDraggable } from '@utils/misc/draggable';
import { useAppStorageStore } from '@stores/appStorage';
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

  const storageStore = useAppStorageStore();

  const preferences = computed({
    get: () => storageStore.get('panels', storageKey, {
      desktop: { isOpen: defaultDesktopState },
      mobile: { isOpen: false },
    }),
    set: (value) => storageStore.set('panels', storageKey, value),
  });

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

  const historyStateKey: Ref<string | null> = shallowRef(null);
  let popstateCleanup: (() => void) | null = null;

  const updatePreferences = useDebounceFn(() => {
    preferences.value = {
      ...preferences.value,
      [deviceContext.value]: { isOpen: isOpen.value },
    };
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

  const setupMobileBackButton = (): void => {
    if (!currentIsMobile.value || !isOpen.value) return;
    
    // Push a state to history so back button has something to pop
    const stateKey = `panel-${storageKey}-${Date.now()}`;
    history.pushState({ panelKey: stateKey }, '');
    historyStateKey.value = stateKey;
    
    // Listen for popstate (back button)
    popstateCleanup = useEventListener(window, 'popstate', (event: PopStateEvent) => {
      const state = event.state;
      // Check if this popstate is for our panel
      if (state?.panelKey === historyStateKey.value || historyStateKey.value) {
        // Close the panel instead of going back
        close(true);
        historyStateKey.value = null;
      }
    });
  };

  const cleanupMobileBackButton = (): void => {
    if (popstateCleanup) {
      popstateCleanup();
      popstateCleanup = null;
    }
    
    // If we still have a history state, remove it
    if (historyStateKey.value) {
      // Go back to remove our pushed state if panel is closing normally
      // Only if the current state matches our key
      if (history.state?.panelKey === historyStateKey.value) {
        history.back();
      }
      historyStateKey.value = null;
    }
  };

  /**
   * Close the panel.
   * @param isMobile - whether the close is occurring on mobile context (defaults to current context)
   */
  const close = async (isMobile: boolean = currentIsMobile.value): Promise<void> => {
    cleanupMobileBackButton();
    currentIsMobile.value = isMobile;

    if (isMobile && animation() && draggable?.animateClose) {
      await draggable.animateClose();
    } else {
      isOpen.value = false;
    }

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

    if (isMobile) {
      await nextTick();
      setupMobileBackButton();
    }

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

    isOpen.value = newIsMobile ? false : preferences.value.desktop.isOpen;
    updatePreferences();

    if (draggable) nextTick(updatePanelDimensions);
  };

  const updatePanelDimensions = useDebounceFn(() => {
    draggable?.updatePanelDimensions?.();
  }, 100);

  watch([isOpen, isExpanded], updatePreferences, { flush: 'post' });

  onUnmounted(() => {
    cleanupMobileBackButton();
  });

  const api: PanelAPI = {
    isOpen,
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