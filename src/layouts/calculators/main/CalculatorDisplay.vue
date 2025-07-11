<template>
  <div class="flex flex-col h-full">
    <div
      class="p-4 rounded-lg transition-colors duration-300 flex-1 relative flex items-end"
      :class="[
        error
          ? 'bg-destructive/10 dark:bg-destructive/20'
          : 'transition-colors duration-300 bg-muted dark:bg-muted',
      ]"
    >
      <ChevronScroll
        :show-left-chevron="scrollState.canScrollLeft"
        :show-right-chevron="scrollState.canScrollRight"
        @scroll-to-previous="scrollToPrevious"
        @scroll-to-next="scrollToNext"
      />

      <ControlButtons
        @open-activity="$emit('open-activity')"
        @copy-to-clipboard="copyToClipboard"
      />

      <MainDisplay
        ref="mainDisplay"
        :input="input"
        :preview="preview"
        :error="error"
        :is-animating="isAnimating"
        :animated-result="animatedResult"
        :active-base="activeBase"
        :mode="mode"
        @scroll-update="handleScrollUpdate"
      />
    </div>
    <div class="flex-initial">
      <BaseDisplay
        v-show="mode === 'Programmer'"
        :display-values="displayValues"
        :active-base="activeBase"
        @base-change="$emit('base-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import ChevronScroll from "@/components/ui/ChevronScroll.vue"
import ControlButtons from "@/components/ui/ControlButtons.vue"
import MainDisplay from "@/components/layout/MainDisplay.vue"
import BaseDisplay from "@/components/layout/BaseDisplay.vue"
import { computed, nextTick, shallowRef, reactive, watch } from "vue"
import { useToast } from "@/composables/useToast"
import { useClipboard, useEventListener, useDebounceFn } from "@vueuse/core"

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" },
  displayValues: { type: Object, default: () => ({}) },
})

defineEmits(["open-activity", "base-change"])
const { toast } = useToast()

const mainDisplay = shallowRef(null)
const scrollState = reactive({
  canScrollLeft: false,
  canScrollRight: false
})
const handleScrollUpdate = useDebounceFn(({ canScrollLeft, canScrollRight }) => {
  scrollState.canScrollLeft = canScrollLeft
  scrollState.canScrollRight = canScrollRight
}, 100)

useEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && scrollState.canScrollLeft) {
    scrollToPrevious()
  }
  if (e.key === 'ArrowRight' && scrollState.canScrollRight) {
    scrollToNext()
  }
})

function scrollToPrevious() {
  mainDisplay.value?.scrollToPrevious()
}

function scrollToNext() {
  mainDisplay.value?.scrollToNext()
}

watch(
  () => props.input,
  () => {nextTick(mainDisplay.value?.scrollToEnd)})

const copyContent = computed(() => 
  props.animatedResult ? `${props.input} = ${props.animatedResult}` : props.input
)

const { copy } = useClipboard({ legacy: true })

function copyToClipboard() {
  copy(copyContent.value)
  toast({
    title: "Copied!",
    description: "Content copied to clipboard.",
  })
}
</script>