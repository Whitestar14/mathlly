<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-foreground">

      <div
        ref="resultContainer"
        class="absolute w-full will-change-transform"
        aria-atomic="true"
        :class="{ 'opacity-100': isAnimating, 'opacity-0': !isAnimating }">
        <div :class="displayClass">
          {{ animatedResult }}
        </div>
      </div>

      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full will-change-transform"
        :class="{ 'opacity-0': isAnimating, 'opacity-100': !isAnimating }">

        <div
          ref="displayContainer"
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true">
          <template v-if="syntaxHighlightingEnabled">
            <span
              v-for="(token, index) in formattedTokens"
              :key="index"
              :class="[
                getTokenClass(token),
                getParenthesesLevelClass(token),
                displayClass,
              ]"
              :data-token-type="token.type"
              :data-parent-level="token.parentLevel">
              {{ token.content }}
            </span>
          </template>
          <template v-else>
            {{ input }}
          </template>
        </div>

        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="font-normal text-foreground/75 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true">
          {{ preview }}
        </div>
        <div
          v-else-if="error"
          class="font-medium text-destructive overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onMounted, watch, onUnmounted, shallowRef, type Ref, type ComputedRef } from 'vue'
import { useElementSize, useScroll, useThrottleFn } from '@vueuse/core'
import { useAnimation, type SlideAnimationControls } from '@composables/ui/useAnimation'
import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions'
import { SyntaxHighlighter } from '@calculator/services/display/SyntaxHighlighter'

interface Props {
  input?: string
  preview?: string
  error?: string
  isAnimating?: boolean
  animatedResult?: string
  activeBase?: string
  mode?: string
}

interface ScrollUpdatePayload {
  canScrollLeft: boolean
  canScrollRight: boolean
}

interface Token {
  type: string
  content: string
  parentLevel?: number
}

interface Calculator {
  operations: {
    parenthesesTracker: any
  }
}

const props = withDefaults(defineProps<Props>(), {
  input: '',
  preview: '',
  error: '',
  isAnimating: false,
  animatedResult: '',
  activeBase: 'DEC',
  mode: 'Standard'
})

const emit = defineEmits<{
  'scroll-update': [payload: ScrollUpdatePayload]
}>()

const calculatorOptions = useCalculatorOptions()

const displayContainer: Ref<HTMLElement | null> = shallowRef(null)
const resultContainer: Ref<HTMLElement | null> = shallowRef(null)
const inputContainer: Ref<HTMLElement | null> = shallowRef(null)
const previewContainer: Ref<HTMLElement | null> = shallowRef(null)

const animationService: SlideAnimationControls = (() => {
  const { createSlideAnimation } = useAnimation()
  return createSlideAnimation()
})()

const calculator = inject<Ref<Calculator>>('calculator')
const parenthesesTracker = computed(() => calculator?.value?.operations?.parenthesesTracker)

const { width } = useElementSize(displayContainer)
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16,
  onScroll: useThrottleFn(updateScrollState, 100)
})

const syntaxHighlightingEnabled: ComputedRef<boolean> = computed(() =>
  calculatorOptions.syntaxHighlighting.value
)

const getParenthesesLevelClass = (token: Token): string => {
  if (!['open', 'close', 'ghost', 'parenthesis'].includes(token.type)) return ''

  if (token.type === 'ghost') return 'paren-ghost'
  return `paren-level-${Math.min(token.parentLevel || 0, 5)}`
}

const getTokenClass = (token: Token): string => {
  const baseClasses: Record<string, string> = {
    'number': 'syntax-string',
    'operator': 'syntax-operator',
    'function': 'syntax-func font-semibold',
    'parenthesis': 'syntax-special font-bold',
    'open': 'syntax-special font-bold',
    'close': 'syntax-special font-bold',
    'ghost': 'syntax-comment font-bold not-italic opacity-40',
    'constant': 'syntax-constant',
    'decimal': 'syntax-keyword',
    'space': '',
    'text': 'syntax-keyword'
  }

  let baseClass = baseClasses[token.type] || 'syntax-text'

  if (props.mode === 'Programmer' && token.type === 'number') {
    baseClass += ` syntax-number-${props.activeBase.toLowerCase()}`
  }

  return baseClass
}

const getFontSizeClass = computed(() => {
  const length = props.input.length
  const { mode, activeBase } = props

  if (mode === 'Standard') {
    if (length > 70) return 'text-xl'
    if (length > 50) return 'text-2xl'
    return 'text-3xl'
  } else if (mode === 'Scientific') {
    if (length > 60) return 'text-lg'
    if (length > 40) return 'text-xl'
    return 'text-2xl'
  } else {
    if (length > 70) return 'text-base'
    if (length > 50) return 'text-lg'
    return activeBase === 'BIN' ? 'text-lg' : 'text-2xl'
  }
})

const formattedTokens: ComputedRef<Token[]> = computed(() => {
  if (!syntaxHighlightingEnabled.value) return []

  return SyntaxHighlighter.format(
    props.input,
    parenthesesTracker?.value,
    true,
    {
      base: props.activeBase,
      mode: props.mode,
      options: calculatorOptions.options.value
    }
  )
})

const displayClass: ComputedRef<string[]> = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  getFontSizeClass.value,
  props.error ? '!text-destructive' : 'transition-colors'
])

function updateScrollState(): void {
  if (!displayContainer.value) return

  const canScrollLeft = scrollLeft.value > 0
  const canScrollRight = !arrivedState.right &&
    (displayContainer.value.scrollWidth - displayContainer.value.clientWidth - scrollLeft.value) > 2

  emit('scroll-update', { canScrollLeft, canScrollRight })
}

function scrollToEnd(): void {
  if (displayContainer.value) {
    displayContainer.value.scrollLeft = displayContainer.value.scrollWidth
  }
}

function scrollToPrevious(): void {
  if (displayContainer.value) {
    const newScrollLeft = Math.max(0, scrollLeft.value - width.value / 2)
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
  }
}

function scrollToNext(): void {
  if (displayContainer.value) {
    const newScrollLeft = Math.min(
      displayContainer.value.scrollWidth - width.value,
      scrollLeft.value + width.value / 2
    )
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
  }
}

function animateSlide(): void {
  animationService.animateSlide(resultContainer.value, inputContainer.value)
}

function resetPositions(): void {
  animationService.resetPositions(resultContainer.value, inputContainer.value)
}

watch(() => props.isAnimating, (newValue: boolean) => {
  if (newValue) {
    animateSlide()
  } else {
    resetPositions()
  }
}, { flush: 'post' })

watch(() => calculatorOptions.options.value, () => {
  SyntaxHighlighter.clearCache()
}, { deep: true })

watch([() => props.mode, () => props.activeBase], () => {
  SyntaxHighlighter.clearCache()
})

onMounted(updateScrollState)
onUnmounted(() => {
  SyntaxHighlighter.clearCache()
})

defineExpose({
  scrollToEnd,
  scrollToPrevious,
  scrollToNext
})
</script>
