import { ref, onMounted, onUnmounted, readonly } from "vue"
import { useToast, type ToastAction } from "@composables/ui/useToast"
import { appStorage } from "@services/storage"

export function usePWAInstallPrompt() {
  const deferredPrompt = ref<Event | null>(null)
  const isPWAInstalled = ref(false)
  const hasVisitedBefore = ref(false)
  const hasShownPrompt = ref(false)

  const { toast } = useToast()

  /**
   * Checks if the app is currently installed as a PWA.
   */
  const checkPWAStatus = () => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    isPWAInstalled.value = mediaQuery.matches || (navigator as any).standalone
  }

  /**
   * Handles the 'beforeinstallprompt' event, storing it and potentially showing the toast.
   */
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e

    if (!isPWAInstalled.value && hasVisitedBefore.value && !hasShownPrompt.value) {
      triggerPWAInstallToast()
      hasShownPrompt.value = true
    }
  }

  /**
   * Handles the 'appinstalled' event, confirming installation to the user.
   */
  const handleAppInstalled = () => {
    isPWAInstalled.value = true
    deferredPrompt.value = null
    hasShownPrompt.value = false

    toast({
      title: "Prism is installed!",
      message: "You can now launch Prism directly from your home screen.",
      type: "success",
      duration: 5000,
    })
  }

  /**
   * Triggers the PWA installation toast notification.
   */
  const triggerPWAInstallToast = () => {
    // Define the action for the toast
    const installAction: ToastAction = {
      label: "Install",
      onClick: async () => {
        if (deferredPrompt.value) {
          (deferredPrompt.value as any).prompt()
          const { outcome } = await (deferredPrompt.value as any).userChoice
          console.log(`User response to the install prompt: ${outcome}`)
          deferredPrompt.value = null
        }
      },
    }

    toast({
      id: 99999,
      title: "Install Prism for quick access!",
      message: "Add Prism to your home screen for a native app experience.",
      type: "info",
      duration: 15000,
      dismissible: true,
      action: installAction,
      ariaRole: "status",
    })
  }

  onMounted(() => {
    const visitedFlag = appStorage.get('meta', 'hasVisitedBefore', false)
    if (visitedFlag) {
      hasVisitedBefore.value = true
    } else {
      // Set the flag for future visits
      setTimeout(() => {
        appStorage.set('meta', 'hasVisitedBefore', true)
        hasVisitedBefore.value = true
      }, 1000)
    }

    checkPWAStatus()
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.removeEventListener("appinstalled", handleAppInstalled)
  })

  return {
    isPWAInstalled: readonly(isPWAInstalled),
  }
}