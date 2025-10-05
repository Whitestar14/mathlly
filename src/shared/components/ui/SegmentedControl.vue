<template>
  <!-- Single idle state hint -->
  <div
    v-if="options.length === 1"
    class="inline-flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:border-border/80"
    aria-label="Segmented control (single option)"
  >
    <component v-if="options[0].icon" :is="options[0].icon" class="h-4 w-4 transition-transform duration-200 hover:scale-105" />
    <span>{{ options[0].label }}</span>
    <Ellipsis class="h-3 w-3 opacity-40 ml-1 transition-opacity duration-200" />
  </div>

  <!-- Normal segmented control -->
  <div
    v-else
    class="inline-flex items-center gap-0.5 rounded-lg border border-border bg-background p-1 shadow-sm transition-all duration-200"
    role="radiogroup"
    aria-label="Segmented control"
    @keydown="onKeydown"
  >
    <!-- Visible deck with enhanced animations -->
    <template v-for="(opt, i) in visibleDeck" :key="opt.value">
      <button
        :aria-checked="modelValue === opt.value"
        role="radio"
        type="button"
        @click="select(opt.value)"
        class="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-200 group"
        :class="[
          'hover:scale-[1.02] active:scale-[0.98]',
          modelValue === opt.value
            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
            : 'bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
        ]"
      >
        <!-- Active indicator with smooth animation -->
        <div 
          v-if="modelValue === opt.value"
          class="absolute inset-0 bg-primary/5 rounded-md animate-pulse"
        />
        
        <component 
          v-if="opt.icon" 
          :is="opt.icon" 
          class="h-4 w-4 transition-all duration-200"
          :class="modelValue === opt.value ? 'text-primary' : 'group-hover:scale-105'"
        />
        <span class="truncate transition-colors duration-200">{{ opt.label }}</span>
      </button>

      <!-- Enhanced separator with animation -->
      <span
        v-if="i < visibleDeck.length - 1"
        aria-hidden="true"
        class="mx-1 h-[10px] w-px bg-border/60 transition-colors duration-200 hover:bg-border/80"
      />
    </template>

    <!-- Enhanced overflow popover -->
    <BasePopover v-if="overflowOptions.length > 0">
      <template #trigger>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-all duration-200 bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:scale-[1.02] active:scale-[0.98] group"
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
          className="px-3 py-2 text-left text-sm rounded-md hover:bg-muted/30"
          @click="select(opt.value, true)"
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const maxVisible = computed(() => props.maxVisible ?? 3)
const overflowLabel = computed(() => props.overflowLabel ?? 'More options')

// Deck state for MCR promotion; kept in sync with options
const visibleDeck = ref<SegmentedOption[]>(props.options.slice(0, maxVisible.value))

// Keep deck stable when options change (e.g., palettes added/removed/renamed)
watch(
  () => props.options,
  (opts) => {
    // Preserve existing promoted choices if still present; fill up to maxVisible
    const preserved = visibleDeck.value.filter(v => opts.some(o => o.value === v.value))
    const fill = opts.filter(o => !preserved.some(v => v.value === o.value)).slice(0, Math.max(0, maxVisible.value - preserved.length))
    visibleDeck.value = [...preserved, ...fill].slice(0, maxVisible.value)
  },
  { deep: true, immediate: true }
)

const overflowOptions = computed(() =>
  props.options.filter(o => !visibleDeck.value.some(v => v.value === o.value))
)

function select(value: string, fromOverflow = false) {
  emit('update:modelValue', value)
  emit('change', value)

  if (fromOverflow) {
    // Promote chosen into deck (MCR): replace the last deck item
    const chosen = props.options.find(o => o.value === value)
    if (chosen) {
      const deck = visibleDeck.value.slice()
      deck[deck.length - 1] = chosen
      // De-duplicate in case chosen already existed somewhere in the deck
      const seen = new Set<string>()
      visibleDeck.value = deck.filter(d => {
        if (seen.has(d.value)) return false
        seen.add(d.value)
        return true
      }).slice(0, maxVisible.value)
    }
  }
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
