import { shallowRef, computed, nextTick, watch, provide, inject, reactive, readonly, onUnmounted, markRaw, type Ref, type ComputedRef } from 'vue';
import { useLocalStorage, useDebounceFn, type RemovableRef } from '@vueuse/core';
import { useDraggable } from '@utils/misc/draggable';

// Types
export interface PanelOptions {
  storageKey?: string;
  defaultDesktopState?: boolean;
  initialIsMobile?: boolean;
  animation?: () => boolean;
  maxHeightRatio?: number;
  snapThreshold?: number;
  maxHeight?: number;
}

export interface PanelPreferences {
  desktop: { isOpen: boolean };
  mobile: { isOpen: boolean };
}

// Create a type based on the return type of useDraggable
type DraggableReturn = ReturnType<typeof useDraggable>;

export interface PanelAPI {
  isOpen: Ref<boolean>;
  isMobile: Ref<boolean>;
  isExpanded: Ref<boolean>;
  panel: Ref<HTMLElement | null>;
  handle: Ref<HTMLElement | null>;
  open: (isMobile?: boolean) => Promise<void>;
  close: (isMobile?: boolean) => Promise<void>;
  toggle: (options?: ToggleOptions) => void;
  handleResize: (newIsMobile: boolean) => void;
  updatePanelDimensions: () => void;
  isDragging: Ref<boolean>;
  translateY: Ref<number>;
  panelHeight: Ref<number>;
  maxPanelHeight: Ref<number>;
}

export interface ToggleOptions {
  expanded?: boolean;
  isMobile?: boolean;
}

export interface PanelContextState {
  panels: Record<string, PanelAPI>;
  options: Record<string, PanelOptions>;
  isMobile: boolean;
}

export interface PanelContextActions {
  registerPanel: (id: string, options?: PanelOptions) => PanelAPI | undefined;
  unregisterPanel: (id: string) => void;
  openPanel: (id: string) => void;
  closePanel: (id: string) => void;
  togglePanel: (id: string, options?: ToggleOptions) => void;
  closeAllPanels: () => void;
  getInstance: (id: string) => PanelAPI | undefined;
  provide: (id: string, action: string, fallback?: any) => any;
  setMobile: (isMobile: boolean) => void;
}

export interface PanelContext {
  state: Readonly<PanelContextState>;
  actions: PanelContextActions;
}

export interface LightweightPanelAPI {
  readonly isOpen: boolean;
  readonly isMobile: boolean;
  readonly panels: Record<string, PanelAPI>;
  readonly options: PanelOptions | undefined;
  open: () => void;
  close: () => void;
  toggle: (options?: ToggleOptions) => void;
}

/**
 * Unified panel composable managing state, persistence, responsiveness, and dragging.
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
    // Return non-reactive default values to avoid unnecessary reactivity
    return markRaw({
      isOpen: shallowRef(false),
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

  // Current device context - use shallowRef for better performance
  const currentIsMobile: Ref<boolean> = shallowRef(initialIsMobile);
  const deviceContext: ComputedRef<'mobile' | 'desktop'> = computed(() => 
    currentIsMobile.value ? 'mobile' : 'desktop'
  );

  // Initialize panel state from stored preferences based on device type
  const isOpen: Ref<boolean> = shallowRef(
    currentIsMobile.value ? false : preferences.value.desktop.isOpen
  );
  
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
        console.warn(`[usePanelUnified ${storageKey}]: Draggable setup failed (handle likely not found).`);
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

// Symbol keys for provide/inject
const PanelStateSymbol = Symbol('PanelState');
const PanelActionsSymbol = Symbol('PanelActions');

/**
 * Creates a central context for managing multiple panel states.
 * This should be instantiated once in a top-level component (like PanelProvider).
 */
export function createPanelContext(): PanelContext {
  const state = reactive<PanelContextState>({
    panels: {},
    options: {},
    isMobile: false,
  });

  const actions: PanelContextActions = {
    /**
     * Registers a new panel instance with the context.
     */
    registerPanel(id: string, options: PanelOptions = {}): PanelAPI | undefined {
      if (state.panels[id]) {
        console.warn(`Panel with id "${id}" already registered. Registration skipped.`);
        return state.panels[id];
      }
      
      const panel = createPanel({...options, initialIsMobile: state.isMobile});
      state.panels[id] = panel;
      state.options[id] = options;
      return panel;
    },

    /**
     * Unregisters a panel instance. Typically called on component unmount.
     */
    unregisterPanel(id: string): void {
      if (state.panels[id]) {
        delete state.panels[id];
        delete state.options[id];
      }
    },

    /**
     * Opens a specific panel.
     */
    openPanel(id: string): void {
      state.panels[id]?.open();
    },

    /**
     * Closes a specific panel.
     */
    closePanel(id: string): void {
      state.panels[id]?.close();
    },

    /**
     * Toggles a specific panel.
     */
    togglePanel(id: string, options?: ToggleOptions): void {
      state.panels[id]?.toggle(options);
    },

    /**
     * Closes all registered panels.
     */
    closeAllPanels(): void {
      Object.keys(state.panels).forEach(id => this.closePanel(id));
    },

    /**
     * Retrieves a panel instance by its ID.
     */
    getInstance(id: string): PanelAPI | undefined {
      return state.panels[id];
    },

    /**
     * Returns the function based on the id of a panel's instance
     */
    provide(id: string, action: string, fallback: any = null): any {
      const instance = this.getInstance(id);
      if (!instance) {
        if (fallback !== null) return fallback;
        console.warn(`Panel "${id}" not ready for ${action}()`);
        return undefined;
      }
      
      const prop = (instance as any)[action];
      if (typeof prop === 'function' && fallback === null) {
        return prop.call(instance);
      }
      return prop !== undefined ? prop : fallback;
    },

    /**
     * Updates the global mobile state and notifies all panel instances.
     */
    setMobile: useDebounceFn(function(this: PanelContextActions, isMobile: boolean): void {
      if (state.isMobile === isMobile) return;
      state.isMobile = isMobile;
      
      // Update all panel instances
      Object.values(state.panels).forEach(instance => 
        instance.handleResize(isMobile)
      );
      
      // Close all panels on mobile transition
      if (isMobile) {
        this.closeAllPanels();
      }
    }, 100),
  };

  provide(PanelStateSymbol, readonly(state));
  provide(PanelActionsSymbol, actions);

  return { state, actions };
}

/**
 * Hook to access the central panel state and actions.
 * Throws an error if used outside of a PanelProvider.
 */
export function usePanelContext(): PanelContext {
  const state = inject<Readonly<PanelContextState>>(PanelStateSymbol);
  const actions = inject<PanelContextActions>(PanelActionsSymbol);
  if (!state || !actions) {
    throw new Error('usePanelContext() must be used within a <PanelProvider> component.');
  }
  return { state, actions };
}

/**
 * Hook to interact with a specific panel instance managed by the context.
 * Returns a stable API object that dynamically accesses the underlying panel's state/methods.
 */
export function usePanel(id: string, options: PanelOptions = {}, api: boolean = true): PanelAPI | LightweightPanelAPI | Record<string, never> {
  if (!id) {
    console.warn("usePanel() requires an id");
    return {};
  }

  const { state, actions } = usePanelContext();
  const hasRegistrationOptions = Object.keys(options).length > 0;

  // Handle different initialization scenarios
  if (hasRegistrationOptions && state.panels[id]) {
    console.warn(`Panel "${id}" already registered. Using existing instance.`);
    return actions.getInstance(id)!;
  } 
  
  if (hasRegistrationOptions && !state.panels[id] && !api) {
    return actions.registerPanel(id, options)!;
  } 
  
  if (!hasRegistrationOptions && api) {
    // Create a lightweight API object with computed getters
    const panel: LightweightPanelAPI = {
      get isOpen(): boolean {
        return actions.provide(id, "isOpen", false);
      },
      get isMobile(): boolean {
        return state.isMobile;
      },
      get panels(): Record<string, PanelAPI> {
        return state.panels;
      },
      get options(): PanelOptions | undefined {
        return state.options[id];
      },

      open: (): void => actions.openPanel(id),
      close: (): void => actions.closePanel(id),
      toggle: (options?: ToggleOptions): void => actions.togglePanel(id, options)
    };
    
    // Automatically unregister panel on component unmount
    onUnmounted(() => {
      actions.unregisterPanel(id);
    });
    
    return panel;
  } 
  
  if (!hasRegistrationOptions && !state.panels[id]) {
    console.log(`usePanel HOOK: Called for "${id}" without options. Waiting for registration call.`);
  }

  // Automatically unregister panel on component unmount
  onUnmounted(() => {
    if (hasRegistrationOptions) {
      actions.unregisterPanel(id);
    }
  });

  return state.panels[id] || {};
}
