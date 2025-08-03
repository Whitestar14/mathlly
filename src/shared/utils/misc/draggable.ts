import { ref, computed, onUnmounted, watch, type Ref } from 'vue'
import { useWindowSize } from '@vueuse/core'

/**
 * Configuration options for draggable composable
 */
interface DraggableOptions {
  panel: Ref<HTMLElement | null>
  handle: Ref<HTMLElement | null>
  isOpen: Ref<boolean>
  isExpanded?: Ref<boolean>
  maxHeightRatio?: number
  snapThreshold?: number
  maxHeight?: number
}

/**
 * Draggable API return type
 */
interface DraggableAPI {
  isDragging: Ref<boolean>
  translateY: Ref<number>
  panelHeight: Ref<number>
  maxPanelHeight: Ref<number>
  setupDraggable: () => boolean
  updatePanelDimensions: () => void
  animateOpen: () => void
  animateClose: () => Promise<void>
}

/**
 * Composable for creating draggable bottom sheet panels
 */
export function useDraggable(options: DraggableOptions): DraggableAPI {
  const {
    panel,
    handle,
    isOpen,
    isExpanded,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options

  // Draggable panel state
  const minHeight = ref(200)
  const panelHeight = ref(500)
  const isDragging = ref(false)
  const translateY = ref(0)
  const startY = ref(0)
  const isSetup = ref(false)
  const { height: windowHeight } = useWindowSize()

  // Compute the max panel height based on maxHeightRatio
  const maxPanelHeight = computed(() => {
    return isExpanded?.value ? windowHeight.value : Math.min(windowHeight.value * maxHeightRatio, maxHeight || 600)
  })

  /**
   * Recalculates panel dimensions, useful after resize or content changes.
   */
  const updatePanelDimensions = (): void => {
    if (!panel.value) return
    
    panelHeight.value = isExpanded?.value ? windowHeight.value : Math.min(windowHeight.value * maxHeightRatio, maxHeight ?? windowHeight.value)
    minHeight.value = Math.min(200, panelHeight.value * 0.2)
  }

  /**
   * Animates the panel to closed position
   */
  function animateClose(): Promise<void> {    
    translateY.value = panelHeight.value
    return new Promise(resolve => {
      setTimeout(() => {
        isOpen.value = false
        // Reset expanded state when closing
        if (isExpanded?.value) isExpanded.value = false
        resolve()
      }, 300)
    })
  }

  /**
   * Animates the panel to open position
   */
  const animateOpen = (): void => {
    if (!panel.value) return
    translateY.value = panelHeight.value
    
    // Then animate in after a short delay to ensure the initial position is applied
    setTimeout(() => {
      translateY.value = 0 // Animate in
    }, 50)
  }

  // Event handlers
  const onTouchStart = (e: TouchEvent | MouseEvent): void => {
    // Don't start dragging if panel is expanded
    if (!handle.value || (isExpanded?.value)) return
    
    startY.value = e.type === 'touchstart' ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
    isDragging.value = true
    document.body.style.overflow = 'hidden'
    
    // Add move and up listeners when dragging starts
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })
  }

  const onTouchMove = (e: TouchEvent | MouseEvent): void => {
    if (!isDragging.value || (isExpanded?.value)) return
    
    const currentY = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
    const deltaY = currentY - startY.value
    translateY.value = Math.max(0, Math.min(deltaY, maxPanelHeight.value - minHeight.value))
    e.preventDefault()
  }

  const onTouchEnd = (): void => {
    if (!isDragging.value) return
    
    isDragging.value = false
    document.body.style.overflow = ''
    
    if (translateY.value > panelHeight.value * snapThreshold) {
      animateClose()
    } else {
      translateY.value = 0
    }
    
    // Remove move and up listeners when dragging ends
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  }

  /**
   * Sets up the draggable event listeners and initial state.
   */
  const setupDraggable = (): boolean => {
    if (isSetup.value) return true

    if (!panel.value || !handle.value) {
      console.warn('[useDraggable] setupDraggable failed: Handle/Panel ref is not a valid DOM element.', {
        panel: panel.value,
        handle: handle.value
      })
      return false
    }

    cleanup()
    updatePanelDimensions()

    // Add new listeners (use passive: false to allow preventDefault in handlers)
    handle.value.addEventListener('touchstart', onTouchStart, { passive: false })

    return true // Indicate success
  }
  
  // Clean up all event listeners
  const cleanup = (): boolean => {
    if (handle.value) {
      handle.value.removeEventListener('touchstart', onTouchStart)
    }
    
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    isSetup.value = true
    return true
  }

  // Watch for panel open or expanded state changes
  watch([isOpen, isExpanded ?? ref(false)], ([open, expanded], [, prevExpanded]) => {
    if (open || expanded || prevExpanded) {
      updatePanelDimensions()
    }
    if (!open && isExpanded?.value) isExpanded.value = false
    if (expanded) translateY.value = 0
  }, { immediate: true })

  // Clean up event listeners when component is unmounted
  onUnmounted(() => cleanup())

  return {
    isDragging,
    translateY,
    panelHeight,
    maxPanelHeight,
    setupDraggable,
    updatePanelDimensions,
    animateOpen,
    animateClose,
  }
}
