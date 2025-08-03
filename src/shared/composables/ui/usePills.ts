import { ref, watch, nextTick, computed, markRaw, type Ref, type ComputedRef } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalizedLoaded, type Router } from 'vue-router';
import {
  useElementVisibility,
  useResizeObserver,
  useMutationObserver,
  useDebounceFn,
} from '@vueuse/core';

/**
 * Style configuration for different indicator positions
 */
interface StyleConfig {
  dimension: 'top' | 'left';
  offset: 'verticalOffset' | 'horizontalOffset';
  align: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Style configuration map for different indicator positions
 */
const STYLE_MAP: Record<string, StyleConfig> = markRaw({
  left: { dimension: 'top', offset: 'verticalOffset', align: 'left' },
  right: { dimension: 'top', offset: 'verticalOffset', align: 'right' },
  top: { dimension: 'left', offset: 'horizontalOffset', align: 'top' },
  bottom: { dimension: 'left', offset: 'horizontalOffset', align: 'bottom' },
});

/**
 * Cache entry for element offset calculations
 */
interface CacheEntry {
  offset: number;
  timestamp: number;
}

/**
 * Pills composable options interface
 */
interface PillsOptions {
  /** Callback when navigation occurs */
  onNavigate?: ((path: string) => void) | null;
  /** Vertical offset for the indicator */
  verticalOffset?: number;
  /** Horizontal offset for the indicator */
  horizontalOffset?: number;
  /** Position of the indicator */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Default pill to select */
  defaultPill?: string;
  /** Whether to update the route on navigation */
  updateRoute?: boolean;
  /** Paths where the indicator should be hidden */
  hideIndicatorPaths?: string[];
  /** Reference to the container element */
  containerRef?: Ref<HTMLElement | HTMLElement[] | null> | null;
}

/**
 * Pills composable return interface
 */
interface PillsComposable {
  /** Current selected pill */
  currentPill: Ref<string>;
  /** Indicator position value */
  indicatorPosition: Ref<number>;
  /** Handle navigation to a new pill */
  handleNavigation: (path: string, element: HTMLElement | null) => Promise<void>;
  /** Computed indicator style object */
  indicatorStyle: ComputedRef<Record<string, string>>;
  /** Initialize the pills system */
  initializePills: (initialPillId?: string | null, elementsRef?: Ref<any> | null) => Promise<boolean>;
}

/**
 * A composable for creating a navigation pill system with animated indicators
 */
export function usePills(options: PillsOptions = {}): PillsComposable {
  // Destructure options with defaults
  const {
    onNavigate = null,
    verticalOffset = 7,
    horizontalOffset = 7,
    position = 'left',
    defaultPill = '',
    updateRoute = true,
    hideIndicatorPaths = [],
    containerRef = null,
  } = options;

  // State
  const currentPill: Ref<string> = ref(defaultPill);
  const indicatorPosition: Ref<number> = ref(0);
  const showIndicator: Ref<boolean> = ref(false);
  const isInitialized: Ref<boolean> = ref(false);
  const activeElementRef: Ref<HTMLElement | null> = ref(null);

  // Vue Router
  const route: RouteLocationNormalizedLoaded = useRoute();
  const router: Router = useRouter();

  // Element visibility tracking
  const isElementVisible = useElementVisibility(activeElementRef);

  const elementCache = new WeakMap<HTMLElement, CacheEntry>();

  /**
   * Calculates the offset position for the indicator
   */
  const getOffset = (element: HTMLElement): number => {
    if (!element) return 0;

    // Check cache first
    if (elementCache.has(element)) {
      const cached = elementCache.get(element)!;
      // Only recalculate if element might have moved
      if (Date.now() - cached.timestamp < 100) {
        return cached.offset;
      }
    }

    // Calculate offset
    const isVertical = position === 'left' || position === 'right';
    const size = isVertical ? element.offsetHeight : element.offsetWidth;
    const offset = isVertical ? element.offsetTop : element.offsetLeft;
    const result = offset + size / 2 - (isVertical ? verticalOffset : horizontalOffset);

    // Cache result
    elementCache.set(element, {
      offset: result,
      timestamp: Date.now(),
    });

    return result;
  };

  /**
   * Updates the current pill selection
   */
  const selectPill = (path: string): void => {
    currentPill.value = path;
  };

  /**
   * Handles navigation to a new pill
   */
  const handleNavigation = async (path: string, element: HTMLElement | null): Promise<void> => {
    selectPill(path);

    if (updateRoute) {
      await router.push(path);
    }

    nextTick(() => updateIndicator(element));

    if (onNavigate) {
      onNavigate(path);
    }
  };

  /**
   * Updates the indicator position based on the active element
   */
  const updateIndicator = (element: HTMLElement | null, force: boolean = false): void => {
    // Early return if no element and not forced
    if (!element && !force) {
      showIndicator.value = false;
      return;
    }

    // Hide indicator if no element or path is in hideIndicatorPaths
    if (!element || hideIndicatorPaths.includes(currentPill.value)) {
      showIndicator.value = false;
      return;
    }

    // Update the activeElementRef to track this element's visibility
    activeElementRef.value = element;

    // Only show indicator if element is visible
    showIndicator.value = isElementVisible.value;
    if (showIndicator.value) {
      indicatorPosition.value = getOffset(element);
    }
  };

  /**
   * Initializes the pills system
   */
  const initializePills = async (
    initialPillId: string | null = null,
    elementsRef: Ref<any> | null = null
  ): Promise<boolean> => {
    await nextTick();

    // Determine which pill ID to use
    const pillId = initialPillId || 
      (isInitialized.value ? currentPill.value : defaultPill || currentPill.value);

    let pillElement: HTMLElement | null = null;
    const targetRef = elementsRef || containerRef;

    // Try to find the element in the provided ref
    if (targetRef?.value) {
      if (Array.isArray(targetRef.value)) {
        pillElement = targetRef.value.find(
          (el: HTMLElement) => el?.dataset?.path === pillId
        ) || null;
      } else if (targetRef.value.querySelector) {
        pillElement = targetRef.value.querySelector(`[data-path="${pillId}"]`);
      }
    }

    // Fallback to document query if not found
    if (!pillElement) {
      pillElement = document.querySelector(`[data-path="${pillId}"]`);
    }

    if (pillElement) {
      selectPill(pillId);
      updateIndicator(pillElement, true);
      isInitialized.value = true;
      return true;
    }

    console.warn(`[usePills] Element with data-path="${pillId}" not found`);
    return false;
  };

  // Computed styles for the indicator
  const indicatorStyle: ComputedRef<Record<string, string>> = computed(() => {
    const style = STYLE_MAP[position];
    if (!style) return {};

    // Base style with position
    const result: Record<string, string> = {
      [style.dimension]: `${indicatorPosition.value}px`,
      display: showIndicator.value ? '' : 'none',
    };

    // Add alignment if not left/top (which are default)
    if (style.align === 'right' || style.align === 'bottom') {
      result[style.align] = '0px';
      // Set the opposite property to auto
      result[style.dimension === 'top' ? 'left' : 'top'] = 'auto';
    }

    return result;
  });

  // Watch for route changes to update the selected pill
  watch(
    () => route.path,
    (newPath: string) => {
      if (updateRoute) {
        selectPill(newPath);
        nextTick(() => {
          const activeElement = document.querySelector(
            `[data-path="${newPath}"]`
          ) as HTMLElement | null;
          if (activeElement) {
            updateIndicator(activeElement);
          } else {
            console.log('[usePills] Element not found for path:', newPath);
          }
        });
      }
    },
    { immediate: updateRoute }
  );

  // Watch for visibility changes of the active element
  watch(isElementVisible, async (newIsVisible: boolean) => {
    if (newIsVisible) {
      await nextTick();
      await initializePills();
    } else {
      showIndicator.value = false;
    }
  });

  // Debounced function for handling resize and DOM mutations
  const optimize = useDebounceFn(() => {
    if (isElementVisible.value) {
      initializePills();
    }

    const activeElement = document.querySelector(
      `[data-path="${currentPill.value}"]`
    ) as HTMLElement | null;
    if (activeElement) {
      activeElementRef.value = activeElement;
    }
  }, 50);

  // Set up resize observer if container ref is provided
  if (containerRef) {
    // Normalize containerRef to a single element or null
    const getSingleElement = () => {
      const value = containerRef.value;
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }
      return value ?? null;
    };
    useResizeObserver(getSingleElement, optimize);
  }

  // Set up mutation observer to handle DOM changes
  useMutationObserver(
    document.body,
    optimize,
    {
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden'],
    },
  );

  // Return the public API
  return {
    currentPill,
    indicatorPosition,
    handleNavigation,
    indicatorStyle,
    initializePills,
  };
}
