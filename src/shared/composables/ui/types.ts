import type { Ref } from 'vue';
import { useDraggable } from '@utils/misc/draggable';

// Create a type based on the return type of useDraggable
export type DraggableReturn = ReturnType<typeof useDraggable>;

// --- Configuration Types ---
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

export interface ToggleOptions {
  expanded?: boolean;
  isMobile?: boolean;
}

// --- Composable API Types ---
export interface PanelAPI {
  isOpen: Ref<boolean>;
  preloadIsOpen: Ref<boolean>;
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

export interface LightweightPanelAPI {
  readonly isOpen: boolean;
  readonly preloadIsOpen: boolean;
  readonly isMobile: boolean;
  readonly panels: Record<string, PanelAPI>;
  readonly options: PanelOptions | undefined;
  open: () => void;
  close: () => void;
  toggle: (options?: ToggleOptions) => void;
}

// --- Context Provider Types ---
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
