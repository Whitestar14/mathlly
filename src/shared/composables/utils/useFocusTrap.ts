import { onBeforeUnmount, type Ref } from 'vue';

/**
 * Custom composable to trap keyboard focus within a specified container.
 * This lightweight version requires manual activation/deactivation, making it ideal
 * for modals or panels controlled by external state.
 *
 * @param containerRef The Vue ref pointing to the DOM element that should contain the focus.
 * @returns An object with manual control functions: activate and deactivate.
 */
export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  // A comprehensive selector for commonly focusable elements
  const FOCUSABLE_ELEMENTS_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]:not([contenteditable="false"])';

  /**
   * Finds all focusable elements within the container and returns them as a NodeList.
   */
  const getFocusableElements = (container: HTMLElement): NodeListOf<HTMLElement> => {
    return container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
  };

  /**
   * Handles the keydown event to intercept and manage the Tab key.
   * Prevents the user from tabbing out of the container boundary.
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const container = containerRef.value;
    if (!container) return;

    const focusable = getFocusableElements(container);

    // Filter out non-visible elements (e.g., hidden, zero size)
    const visibleFocusable = Array.from(focusable).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
    );

    if (visibleFocusable.length === 0) {
      // If no focusable elements, prevent default behavior
      event.preventDefault();
      return;
    }

    const firstFocusable = visibleFocusable[0];
    const lastFocusable = visibleFocusable[visibleFocusable.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  };

  /**
   * Sets up the focus trap by attaching the keydown listener and moving focus.
   */
  const activate = () => {
    const container = containerRef.value;
    if (!container) return;

    // Set initial focus to the first focusable element
    const firstFocusable = getFocusableElements(container)[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
    document.addEventListener('keydown', handleKeydown);
  };

  /**
   * Cleans up the focus trap by removing the keydown listener.
   */
  const deactivate = () => {
    document.removeEventListener('keydown', handleKeydown);
  };

  // --- Cleanup on Component Unmount ---
  onBeforeUnmount(deactivate);

  // Return manual controls for external state management
  return {
    activate,
    deactivate,
  };
}
