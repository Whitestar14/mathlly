<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-foreground dark:text-foreground">
      <!-- Result container with hardware acceleration -->
      <div
        ref="resultContainer"
        class="absolute w-full will-change-transform"
        aria-atomic="true"
        :class="{ 'opacity-100': isAnimating, 'opacity-0': !isAnimating }"
      >
        <div :class="displayClass">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container with hardware acceleration -->
      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full will-change-transform"
        :class="{ 'opacity-0': isAnimating, 'opacity-100': !isAnimating }"
      >
        <!-- Display container -->
        <div
          ref="displayContainer"
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true"
        >
          <template v-if="syntaxHighlightingEnabled">
            <span
              v-for="(token, index) in formattedTokens"
              :key="index"
              :class="[
                getTokenClass(token),
                getParenthesesLevelClass(token),
                errorClass,
              ]"
              :data-token-type="token.type"
              :data-parent-level="token.parentLevel"
            >
              {{ token.content }}
            </span>
          </template>
          <template v-else>
            {{ input }}
          </template>
        </div>

        <!-- Preview/Error container -->
        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="font-medium text-foreground/75 dark:text-muted-foreground/75 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ preview }}
        </div>
        <div
          v-else-if="error"
          class="font-medium text-destructive overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onMounted, watch, onUnmounted, shallowRef, type Ref, type ComputedRef } from "vue"
import { useElementSize, useScroll, useThrottleFn, useMemoize } from '@vueuse/core'
import { useAnimation, type SlideAnimationControls } from '@/composables/useAnimation'
import { useSettingsStore } from '@/stores/settings'
import { SyntaxHighlighter } from '@/services/display/SyntaxHighlighter'
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants'

// Define interfaces for props and emits
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

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  input: "",
  preview: "",
  error: "",
  isAnimating: false,
  animatedResult: "",
  activeBase: "DEC",
  mode: "Standard"
})

// Define emits
const emit = defineEmits<{
  'scroll-update': [payload: ScrollUpdatePayload]
}>()

const settingsStore = useSettingsStore()

// DOM refs - use shallowRef for better performance with DOM elements
const displayContainer: Ref<HTMLElement | null> = shallowRef(null)
const resultContainer: Ref<HTMLElement | null> = shallowRef(null)
const inputContainer: Ref<HTMLElement | null> = shallowRef(null)
const previewContainer: Ref<HTMLElement | null> = shallowRef(null)

// Animation service - created once and reused
const animationService: SlideAnimationControls = (() => {
  const { createSlideAnimation } = useAnimation()
  return createSlideAnimation()
})()

// Inject calculator with proper typing
const calculator = inject<Ref<Calculator>>('calculator')
const parenthesesTracker = computed(() => calculator?.value?.operations?.parenthesesTracker)

// Use VueUse for better performance
const { width } = useElementSize(displayContainer)
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16,
  onScroll: useThrottleFn(updateScrollState, 100)
})

// Check if syntax highlighting is enabled - non-reactive if setting doesn't change often
const syntaxHighlightingEnabled: ComputedRef<boolean> = computed(() => settingsStore.display.syntaxHighlighting)

// Comprehensive token class map supporting all syntax variants from CalculatorConstants
const tokenClassMap: Record<string, string> = {
  // Parentheses and structural elements
  'open': 'paren-open syntax-parenthesis',
  'close': 'paren-close syntax-parenthesis',
  'ghost': 'paren-ghost syntax-ghost',
  'parenthesis': 'syntax-parenthesis',
  
  // Numbers and decimals
  'number': 'syntax-number',
  'decimal': 'syntax-decimal',
  
  // Standard operators (from BUTTON_TYPES.OPERATORS)
  'operator': 'syntax-operator',
  
  // Programmer operators (from BUTTON_TYPES.PROGRAMMER_OPERATORS)
  'programmer-operator': 'syntax-programmer-operator',
  
  // Scientific functions (from BUTTON_TYPES.SCIENTIFIC_FUNCTIONS)
  'scientific-function': 'syntax-scientific-function',
  'trig-function': 'syntax-trig-function',
  'hyperbolic-function': 'syntax-hyperbolic-function',
  'log-function': 'syntax-log-function',
  'power-operator': 'syntax-power-operator',
  'root-function': 'syntax-root-function',
  'factorial': 'syntax-factorial',
  'modulo-operator': 'syntax-modulo-operator',
  
  // Constants and special symbols
  'constant': 'syntax-constant',
  
  // Generic and utility
  'function': 'syntax-function',
  'text': 'syntax-text',
  'space': ''
}

// Parentheses level styling for nested expressions
const parenthesesLevelColors: Record<number, string> = {
  0: 'text-blue-600 dark:text-blue-400',
  1: 'text-green-600 dark:text-green-400', 
  2: 'text-purple-600 dark:text-purple-400',
  3: 'text-orange-600 dark:text-orange-400',
  4: 'text-pink-600 dark:text-pink-400'
}

// Enhanced token classification function
function getTokenClass(token: Token): string {
  const baseClass = tokenClassMap[token.type] || 'syntax-text'
  
  // Add mode-specific enhancements
  if (props.mode === 'Scientific') {
    // Enhanced scientific function styling
    if (CalculatorConstants.BUTTON_TYPES.SCIENTIFIC_FUNCTIONS.includes(token.content as any)) {
      return `${baseClass} font-semibold`
    }
    // Constants get special treatment
    if (token.content === 'π' || token.content === 'e') {
      return `${baseClass} font-bold text-primary dark:text-primary`
    }
  }
  
  if (props.mode === 'Programmer') {
    // Programmer operators get enhanced styling
    if (CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(token.content as any)) {
      return `${baseClass} font-bold`
    }
    // Base-specific number styling
    if (token.type === 'number') {
      switch (props.activeBase) {
        case 'BIN': return `${baseClass} text-green-700 dark:text-green-300`
        case 'OCT': return `${baseClass} text-yellow-700 dark:text-yellow-300`
        case 'HEX': return `${baseClass} text-purple-700 dark:text-purple-300`
        default: return baseClass
      }
    }
  }
  
  return baseClass
}

// Parentheses level styling
function getParenthesesLevelClass(token: Token): string {
  if (token.type === 'open' || token.type === 'close' || token.type === 'ghost') {
    const level = token.parentLevel || 0
    return parenthesesLevelColors[level % 5] || parenthesesLevelColors[0]
  }
  return ''
}

// Memoize font size calculation for better performance
const getFontSizeClass = useMemoize((value: string, mode: string, activeBase: string): string => {
  if (!value) return mode === 'Standard' ? 'text-3xl' : 'text-2xl'

  const length = value.toString().length

  if (mode === 'Standard') {
    if (length > 70) return 'text-xl'
    if (length > 50) return 'text-2xl'
    return 'text-3xl'
  } else if (mode === 'Scientific') {
    // Scientific mode: account for function names
    if (length > 60) return 'text-lg'
    if (length > 40) return 'text-xl'
    return 'text-2xl'
  } else {
    // Programmer mode: use smaller font sizes for binary
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
      mode: props.mode
    }
  )
})

const displayClass: ComputedRef<string[]> = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  getFontSizeClass(props.input, props.mode, props.activeBase),
  errorClass.value
])

const errorClass: ComputedRef<string> = computed(() => 
  props.error ? 'text-destructive dark:text-destructive' : 'transition-colors'
)

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

function clearCache(): void {
  if (syntaxHighlightingEnabled.value) SyntaxHighlighter.clearCache()
}

watch([() => props.mode, () => props.activeBase], clearCache, { deep: false })

onMounted(updateScrollState)
onUnmounted(clearCache)

defineExpose({
  scrollToEnd, 
  scrollToPrevious, 
  scrollToNext
})
</script>
