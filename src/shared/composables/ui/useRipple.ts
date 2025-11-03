import { ref } from 'vue'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple() {
  const ripples = ref<Ripple[]>([])
  let rippleId = 0

  const triggerRipple = (e: MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = rippleId++
    ripples.value.push({ id, x, y, size })

    setTimeout(() => {
      ripples.value = ripples.value.filter(r => r.id !== id)
    }, 600)
  }

  return { ripples, triggerRipple }
}
