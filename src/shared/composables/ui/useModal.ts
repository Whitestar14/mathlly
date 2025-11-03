import { computed, reactive, ref, watch } from 'vue'

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

export function openModal(id: string) {
  const modal = modalRegistry[id]
  if (!modal) return

  const idx = modalStack.value.indexOf(id)
  if (idx !== -1) modalStack.value.splice(idx, 1)
  modalStack.value.push(id)
  updateModalVisibility()
}

export function closeModal(id: string) {
  const modal = modalRegistry[id]
  if (!modal) return

  modal.isOpen = false
  const idx = modalStack.value.indexOf(id)
  if (idx !== -1) modalStack.value.splice(idx, 1)

  updateModalVisibility()

  modal.onClose?.()
}

export function closeTopModal() {
  if (modalStack.value.length === 0) return
  closeModal(modalStack.value[modalStack.value.length - 1])
}

function updateModalVisibility() {
  const topModalId = modalStack.value.length > 0 ?
    modalStack.value[modalStack.value.length - 1] :
    null

  modalStack.value.forEach((modalId, index) => {
    const modal = modalRegistry[modalId]
    if (modal) {
      modal.zIndex = baseZIndex + (index + 1) * 10
      modal.isOpen = modalId === topModalId
    }
  })

  Object.keys(modalRegistry).forEach(modalId => {
    if (!modalStack.value.includes(modalId)) {
      const modal = modalRegistry[modalId]
      if (modal) {
        modal.isOpen = false
      }
    }
  })
}

export function useModal(id: string) {
  const modal = computed(() => modalRegistry[id])
  const isTopModal = computed(() => {
    return modalStack.value.length > 0 &&
      modalStack.value[modalStack.value.length - 1] === id
  })

  return {
    isOpen: computed(() => modal.value?.isOpen ?? false),
    isTopModal,
    zIndex: computed(() => modal.value?.zIndex ?? baseZIndex),
    open: () => openModal(id),
    close: () => closeModal(id),
    toggle: () => {
      const isCurrentlyOpen = modal.value?.isOpen
      if (isCurrentlyOpen) closeModal(id)
      else openModal(id)
    }
  }
}

export const modalStackRef = computed(() => modalStack.value)
export const hasOpenModals = computed(() => modalStack.value.length > 0)

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => {
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
