<template>
  <!-- Single Option (Static) -->
  <div
    v-if="options.length === 1"
    class="inline-flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-sm text-muted-foreground bg-muted/5 cursor-default select-none"
    aria-label="Single option">
    <component
      :is="options[0].icon"
      v-if="options[0].icon"
      class="h-4 w-4 opacity-70" />
    <span>{{ options[0].label }}</span>
  </div>

  <!-- Scrollable Segmented Control -->
  <div
    v-else
    class="group relative inline-flex max-w-full items-center vertical-align-middle"
    role="radiogroup"
    :aria-label="ariaLabel">
    
    <div
      ref="scrollContainer"
      class="flex w-full min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border bg-background p-1 shadow-sm no-scrollbar scroll-smooth"
      @keydown="onKeydown">
      
      <button
        v-for="opt in options"
        :key="opt.value"
        ref="itemRefs"
        type="button"
        role="radio"
        :aria-checked="modelValue === opt.value"
        :data-value="opt.value"
        :tabindex="modelValue === opt.value ? 0 : -1"
        @click="select(opt.value)"
        class="relative flex-1 flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none disabled:opacity-50 select-none whitespace-nowrap"
        :class="[
          modelValue === opt.value
            ? 'bg-accent/10 text-accent shadow-sm ring-1 ring-accent/20 z-10'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        ]"
      >
        <component
          :is="opt.icon"
          v-if="opt.icon"
          class="h-4 w-4 shrink-0 transition-colors" 
          :class="modelValue === opt.value ? 'text-accent' : 'opacity-70'"
        />
        <span>{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, type Component } from 'vue'

export interface SegmentedOption {
  value: string
  label: string
  icon?: Component
}

const props = defineProps<{
  modelValue: string
  options: SegmentedOption[]
  ariaLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const itemRefs = ref<HTMLElement[]>([])

function select(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
  scrollToActive(value)
}

async function scrollToActive(value: string) {
  await nextTick()
  if (!scrollContainer.value) return
  const index = props.options.findIndex(o => o.value === value)
  const element = itemRefs.value[index]

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

function onKeydown(e: KeyboardEvent) {
  const currentIndex = props.options.findIndex(o => o.value === props.modelValue)
  if (currentIndex === -1) return

  let nextIndex = -1

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      nextIndex = currentIndex + 1 >= props.options.length ? 0 : currentIndex + 1
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      nextIndex = currentIndex - 1 < 0 ? props.options.length - 1 : currentIndex - 1
      break
    case 'Home':
      e.preventDefault()
      nextIndex = 0
      break
    case 'End':
      e.preventDefault()
      nextIndex = props.options.length - 1
      break
  }

  if (nextIndex !== -1) {
    const nextValue = props.options[nextIndex].value
    select(nextValue)
    nextTick(() => itemRefs.value[nextIndex]?.focus())
  }
}

watch(() => props.modelValue, (val) => scrollToActive(val))
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>