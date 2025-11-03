import { ref, computed, watch, type Ref } from 'vue'
import { type RGBA, type ColorFormats, convertColor } from '@color/lib/color'
import { detectFormat, parseWithFormatTolerant, parseAutoSimple, normalizeDisplay, expandShorthandHex, isShorthandHex, formatRgbaPretty, type InputFormat, type ResolvedFormat } from '@color/lib/utils'

export function useColorInput(
  currentColor: Ref<RGBA>,
  onColorUpdate: (c: RGBA) => void
) {
  const selectedFormat = ref<InputFormat>('auto')
  const lastAutoFormat = ref<ResolvedFormat | null>('hex')
  const isEditing = ref(false)
  const colorInput = ref('')
  const inputError = ref('')

  const localFormats = computed<ColorFormats>(() => convertColor(currentColor.value))

  const placeholderForFormat = computed(() => {
    switch (selectedFormat.value) {
      case 'hex': return '#22C55E or #22C55E80'
      case 'rgba': return 'rgba(34 197 94 / 1) or rgba(34, 197, 94, 1)'
      case 'hsla': return 'hsla(150 50% 50% / 1) or hsla(150, 50%, 50%, 1)'
      case 'oklch': return 'oklch(0.650 0.150 150 / 1)'
      default: return '#22C55E or rgba(...) or hsla(...) or oklch(...)'
    }
  })

  const rgbaText = computed(() => formatRgbaPretty(currentColor.value))

  const processInput = (raw: string) => {
    const alpha = currentColor.value.a ?? 1

    if (selectedFormat.value === 'auto') {
      const { state, rgba, format } = parseAutoSimple(raw, alpha)
      if (state === 'valid' && rgba) {
        lastAutoFormat.value = format ?? detectFormat(raw) ?? lastAutoFormat.value
        inputError.value = ''
        onColorUpdate(rgba)
      } else if (state === 'partial') {
        inputError.value = ''
      } else {
        inputError.value = 'Invalid color format'
      }
      return
    }

    const { state, rgba } = parseWithFormatTolerant(raw, selectedFormat.value as ResolvedFormat, alpha)
    if (state === 'valid' && rgba) {
      inputError.value = ''
      onColorUpdate(rgba)
    } else if (state === 'partial') {
      inputError.value = ''
    } else {
      inputError.value = 'Invalid color format'
    }
  }

  const onTyping = (e: Event) => {
    const val = (e.target as HTMLInputElement).value
    processInput(val)
  }

  const onFocus = () => { isEditing.value = true }

  const onBlur = () => {
    isEditing.value = false

    if (selectedFormat.value === 'hex' && isShorthandHex(colorInput.value)) {
      colorInput.value = expandShorthandHex(colorInput.value)
    }
  }

  const onEnter = () => { isEditing.value = false; normalizeInputPresentation() }

  const normalizeInputPresentation = () => {
    if (isEditing.value) return
    colorInput.value = normalizeDisplay(
      currentColor.value,
      localFormats.value,
      selectedFormat.value,
      lastAutoFormat.value
    )
  }

  watch(
    () => currentColor.value,
    () => {
      if (!isEditing.value) normalizeInputPresentation()
    },
    { deep: true, immediate: true }
  )

  watch(
    () => selectedFormat.value,
    () => {
      if (isEditing.value) return
      colorInput.value = normalizeDisplay(
        currentColor.value,
        localFormats.value,
        selectedFormat.value,
        lastAutoFormat.value
      )
    }
  )

  const formatOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'hex', label: 'HEX' },
    { value: 'rgba', label: 'RGBA' },
    { value: 'hsla', label: 'HSLA' },
    { value: 'oklch', label: 'OKLCH' }
  ]

  return {
    selectedFormat,
    colorInput,
    inputError,
    isEditing,
    localFormats,
    placeholderForFormat,
    rgbaText,
    onFocus,
    onBlur,
    onEnter,
    onTyping,
    formatOptions
  }
}
