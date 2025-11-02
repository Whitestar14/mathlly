<template>
  <!-- Single idle state hint -->
  <div
    v-if="options.length === 1"
    class="inline-flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:border-border/80"
    aria-label="Segmented control (single option)"
  >
    <component
      :is="options[0].icon"
      v-if="options[0].icon"
      class="h-4 w-4 transition-transform duration-200 hover:scale-105"
    />
    <span>{{ options[0].label }}</span>
    <Ellipsis class="h-3 w-3 opacity-40 ml-1 transition-opacity duration-200" />
  </div>

  <!-- Normal segmented control -->
  <div
    v-else
    class="inline-flex items-center gap-0.5 rounded-lg border border-border bg-background p-1 shadow-sm transition-all duration-200"
    :class="{'w-full gap-1': disableOverflow }"
    role="radiogroup"
    aria-label="Segmented control"
    @keydown="onKeydown"
  >
    <!-- Visible deck with enhanced animations -->
    <template
      v-for="(opt, _) in visibleDeck"
      :key="opt.value"
    >
      <button
        :aria-checked="modelValue === opt.value"
        role="radio"
        type="button"
        class="relative inline-flex justify-center items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-all duration-200 group"
        :class="[
          'hover:scale-[1.02] active:scale-[0.98]',
          disableOverflow ? 'w-full' : '',
          modelValue === opt.value
            ? 'bg-accent/10 text-accent shadow-sm ring-1 ring-accent/20'
            : 'bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
        ]"
        @click="select(opt.value)"
      >
        <component 
          :is="opt.icon" 
          v-if="opt.icon" 
          class="h-4 w-4 transition-all duration-200"
          :class="modelValue === opt.value ? 'text-accent' : 'group-hover:scale-105'"
        />
        <span class="truncate transition-colors duration-200">{{ opt.label }}</span>
      </button>
    </template>

    <!-- Enhanced overflow popover -->
    <BasePopover v-if="overflowOptions.length > 0">
      <template #trigger>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-all duration-200 bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] group"
          aria-haspopup="menu"
          aria-expanded="false"
          :aria-label="overflowLabel"
        >
          <Ellipsis class="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
          <span class="sr-only">{{ overflowLabel }}</span>
        </button>
      </template>

      <div class="flex flex-col animate-in slide-in-from-top-2 duration-200">
        <PopoverItem
          v-for="opt in overflowOptions"
          :key="opt.value"
          :label="opt.label"
          :icon="opt.icon"
          class-name="px-3 py-2 text-left text-sm rounded-md hover:bg-muted/30"
          @click="select(opt.value)"
        />
      </div>
    </BasePopover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Ellipsis } from 'lucide-vue-next'
import { BasePopover, PopoverItem } from '@components/ui'

export interface SegmentedOption {
  value: string
  label: string
  icon?: any
}

const props = defineProps<{
  modelValue: string
  options: SegmentedOption[]
  maxVisible?: number
  overflowLabel?: string
  disableOverflow?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const maxVisible = computed(() => props.maxVisible ?? 3)
const overflowLabel = computed(() => props.overflowLabel ?? 'More options')

// Deck state for MCR promotion; kept in sync with options
const visibleDeck = ref<SegmentedOption[]>(
  props.disableOverflow ? props.options : props.options.slice(0, maxVisible.value)
)

const visibleValueMap = computed(() => {
    return new Set(visibleDeck.value.map(o => o.value));
});

const overflowOptions = computed(() => {
  if (props.disableOverflow) return []
  return props.options.filter(o => !visibleValueMap.value.has(o.value))
})

function promoteToVisibleDeck(value: string) {
  if (props.disableOverflow) return
  const chosen = props.options.find(o => o.value === value)
  if (chosen) {
    const deck = visibleDeck.value.slice()
    deck[deck.length - 1] = chosen

    const seen = new Set<string>()
    const newDeck = deck.reverse().filter(d => {
      if (seen.has(d.value)) return false
      seen.add(d.value)
      return true
    }).reverse()

    visibleDeck.value = newDeck.slice(0, maxVisible.value)
  }
}

watch(
  () => props.options,
  (opts) => {
    if (props.disableOverflow) {
      visibleDeck.value = opts
      return
    }
    
    const preserved = visibleDeck.value.map(v => opts.find(o => o.value === v.value)).filter((o): o is SegmentedOption => o !== undefined)
    const fill = opts.filter(o => !preserved.some(v => v.value === o.value)).slice(0, Math.max(0, maxVisible.value - preserved.length))
    visibleDeck.value = [...preserved, ...fill].slice(0, maxVisible.value)
  },
  { deep: true, immediate: true }
)


function select(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
  promoteToVisibleDeck(value)
}

function onKeydown(e: KeyboardEvent) {
  const idx = props.options.findIndex(o => o.value === props.modelValue)
  if (idx < 0) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    const next = props.options[Math.min(props.options.length - 1, idx + 1)]
    if (next) select(next.value)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    const prev = props.options[Math.max(0, idx - 1)]
    if (prev) select(prev.value)
  } else if (e.key === 'Home') {
    e.preventDefault()
    if (props.options[0]) select(props.options[0].value)
  } else if (e.key === 'End') {
    e.preventDefault()
    const last = props.options[props.options.length - 1]
    if (last) select(last.value)
  }
}
</script>

<style scoped>
/* Enhanced animations */
@keyframes slide-in-from-top-2 {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation-fill-mode: forwards;
}

/* Smooth hover transitions */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}
</style>