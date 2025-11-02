import { computed, reactive, ref, watch } from 'vue'

// Reactive registry so Vue can track changes
const modalRegistry = reactive<Record<string, { isOpen: boolean; zIndex: number; onClose?: () => void }>>({})
const baseZIndex = 40
const modalStack = ref<string[]>([])

export function registerModal(id: string, onClose?: () => void) {
  modalRegistry[id] = { isOpen: false, zIndex: baseZIndex, onClose }
}

export function unregisterModal(id: string) {
  if (modalRegistry[id]) delete modalRegistry[id]
  const idx = modalStack.value.indexOf(id)
  if (idx !== -1) modalStack.value.splice(idx, 1)
}

// Ensure only one modal is open at a time by closing others when opening a new one
export function openModal(id: string) {
  const modal = modalRegistry[id]
  if (!modal) return

  // close any other open modal(s)
  modalStack.value.slice().forEach((existingId) => {
    if (existingId !== id) closeModal(existingId)
  })

  modal.isOpen = true
  const idx = modalStack.value.indexOf(id)
  if (idx !== -1) modalStack.value.splice(idx, 1)
  modalStack.value.push(id)
  modal.zIndex = baseZIndex + modalStack.value.length * 10
}

export function closeModal(id: string) {
  const modal = modalRegistry[id]
  if (!modal) return
  modal.isOpen = false
  const idx = modalStack.value.indexOf(id)
  if (idx !== -1) modalStack.value.splice(idx, 1)
  modal.onClose?.()
}

export function closeTopModal() {
  if (modalStack.value.length === 0) return
  closeModal(modalStack.value[modalStack.value.length - 1])
}

export function useModal(id: string) {
  const modal = computed(() => modalRegistry[id])
  return {
    isOpen: computed(() => modal.value?.isOpen ?? false),
    zIndex: computed(() => modal.value?.zIndex ?? baseZIndex),
    open: () => openModal(id),
    close: () => closeModal(id),
    toggle: () => (modal.value?.isOpen ? closeModal(id) : openModal(id)),
  }
}

export const modalStackRef = computed(() => modalStack.value)
export const hasOpenModals = computed(() => modalStack.value.length > 0)

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStack.value.length > 0) {
      closeTopModal()
    }
  })
}

if (typeof document !== 'undefined') {
  const updateBodyState = () => {
    const has = modalStack.value.length > 0
    document.body.classList.toggle('has-modal-open', has)

    const topId = modalStack.value[modalStack.value.length - 1]
    const topZ = topId && modalRegistry[topId] ? modalRegistry[topId].zIndex : baseZIndex
    document.body.style.setProperty('--active-modal-z', String(topZ))

  }

  watch(modalStack.value, () => updateBodyState(), { immediate: true })
}
