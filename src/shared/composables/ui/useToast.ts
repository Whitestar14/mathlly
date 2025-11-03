import { ref, readonly, onUnmounted, type Ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'

const DEFAULT_DURATION = 5000
const MAX_TOASTS = 5

export type ToastType = 'info' | 'success' | 'warning' | 'error'
export type ToastAriaRole = 'status' | 'alert'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id?: number
  message?: string
  description?: string
  title?: string
  type?: ToastType
  dismissible?: boolean
  duration?: number
  action?: ToastAction
  ariaRole?: ToastAriaRole
}

export interface Toast extends Required<Omit<ToastData, 'description' | 'action' | 'ariaRole'>> {
  description?: string
  action?: ToastAction
  ariaRole: ToastAriaRole
  _timerId: ReturnType<typeof setTimeout> | null
  _pausedAt: number | null
  _remainingTime: number
}

export interface ToastOptions {
  title?: string
  type?: ToastType
  dismissible?: boolean
  duration?: number
  action?: ToastAction
  ariaRole?: ToastAriaRole
}

const toasts: Ref<Toast[]> = ref([])

/**
 * Composable for managing toast notifications
 */
export function useToast() {
  /**
   * Starts the auto-dismissal timer for a given toast.
   */
  const startToastTimer = (toast: Toast) => {
    if (toast.duration === 0) return // 0 duration means persistent

    if (toast._timerId) {
      clearTimeout(toast._timerId)
    }

    const timeToWait = toast._remainingTime > 0 ? toast._remainingTime : toast.duration

    toast._timerId = setTimeout(() => {
      removeToast(toast.id)
    }, timeToWait)

    toast._pausedAt = null // Reset paused state
    toast._remainingTime = 0 // Reset remaining time
  }

  /**
   * Pauses the auto-dismissal timer for a given toast.
   */
  const pauseToastTimer = (toast: Toast) => {
    if (toast._timerId) {
      clearTimeout(toast._timerId)
      toast._timerId = null
      toast._pausedAt = Date.now()
      const elapsed = toast.duration - toast._remainingTime
      toast._remainingTime = toast.duration - (Date.now() - (toast._pausedAt || Date.now() - elapsed))
      if (toast._remainingTime < 0) toast._remainingTime = 0
    }
  }

  /**
   * Resumes the auto-dismissal timer for a given toast.
   */
  const resumeToastTimer = (toast: Toast) => {
    if (toast._pausedAt !== null && toast._remainingTime > 0) {
      startToastTimer(toast)
    }
  }

  const addToast = useThrottleFn((toastData: ToastData) => {
    const id = Date.now()

    if (toasts.value.length >= MAX_TOASTS) {
      const oldestToast = toasts.value[0]
      if (oldestToast) {
        removeToast(oldestToast.id)
      }
    }

    const newToast: Toast = {
      id,
      type: 'info',
      dismissible: true,
      duration: DEFAULT_DURATION,
      message: '',
      title: '',
      ariaRole: 'status',
      _timerId: null,
      _pausedAt: null,
      _remainingTime: toastData.duration || DEFAULT_DURATION,
      ...toastData
    }

    toasts.value.push(newToast)

    startToastTimer(newToast)
  }, 500) // 500ms throttle

  /**
   * Remove a toast by ID
   */
  const removeToast = (id: number): void => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const toastToRemove = toasts.value[index]

      if (toastToRemove._timerId) {
        clearTimeout(toastToRemove._timerId)
      }
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  const clearAll = (): void => {
    toasts.value.forEach(toast => {
      if (toast._timerId) {
        clearTimeout(toast._timerId)
      }
    })

    toasts.value = []
  }

  onUnmounted(() => {
    clearAll()
  })

  const toast = (message: string | ToastData, options: ToastOptions = {}): void => {
    if (typeof message === 'object') {
      addToast(message)
    } else {
      addToast({ message, ...options })
    }
  }

  const success = (message: string, options: ToastOptions = {}): void => toast(message, { type: 'success', ...options })

  const error = (message: string, options: ToastOptions = {}): void => toast(message, { type: 'error', ...options })

  const warning = (message: string, options: ToastOptions = {}): void => toast(message, { type: 'warning', ...options })

  const info = (message: string, options: ToastOptions = {}): void => toast(message, { type: 'info', ...options })

  return {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
    pauseToast: (id: number) => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) pauseToastTimer(toast)
    },
    resumeToast: (id: number) => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) resumeToastTimer(toast)
    },
    toasts: readonly(toasts)
  }
}
