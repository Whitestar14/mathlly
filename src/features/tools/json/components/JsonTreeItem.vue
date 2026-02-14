<template>
  <div class="font-mono text-sm leading-6">
    <div
      class="flex items-start hover:bg-muted/30 rounded px-1 -ml-1 transition-colors group"
      :class="{ 'cursor-pointer': isExpandable }"
      @click.stop="toggle">

      <!-- Indentation -->
      <div
        v-if="depth > 0"
        class="shrink-0 border-l border-border/40 ml-1.5 mr-1.5"
        :style="{ height: '1.5em', width: '1px', opacity: 0.5 }">
      </div>

      <!-- Toggler -->
      <div v-if="isExpandable" class="mr-1 mt-1 shrink-0 text-muted-foreground">
        <component :is="isOpen ? ChevronDown : ChevronRight" class="size-3.5" />
      </div>
      <div v-else class="w-4 mr-1 shrink-0"></div>

      <!-- Key -->
      <span v-if="props.objKey !== undefined" class="text-primary mr-1">"{{ props.objKey }}":</span>

      <!-- Value -->
      <div class="flex-1 min-w-0 break-words">
        <!-- Object/Array Start -->
        <span v-if="isExpandable" class="text-muted-foreground">
          {{ isArray ? '[' : '{' }}
          <span v-if="!isOpen" class="text-xs mx-1">
            {{ isArray ? `Array(${value.length})` : '{...}' }}
          </span>
        </span>

        <!-- Primitive Value -->
        <span v-else :class="valueClass">
          {{ formattedValue }}
        </span>

        <!-- Object/Array End (if collapsed or empty) -->
        <span v-if="isExpandable && !isOpen" class="text-muted-foreground">
          {{ isArray ? ']' : '}' }}
          <span v-if="!isLast" class="text-muted-foreground">,</span>
        </span>

        <!-- Comma for primitives -->
        <span v-if="!isExpandable && !isLast" class="text-muted-foreground">,</span>
      </div>
    </div>

    <!-- Children -->
    <div v-if="isOpen && isExpandable" class="pl-4 border-l border-border/20 ml-2.5">
      <JsonTreeItem
        v-for="(val, key, index) in (value as Record<string, any>)"
        :key="key"
        :obj-key="isArray ? undefined : key"
        :value="val"
        :is-last="index === Object.keys(value).length - 1"
        :depth="depth + 1" />
      <div class="pl-1 text-muted-foreground">
        {{ isArray ? ']' : '}' }}<span v-if="!isLast">,</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  objKey?: string | number
  value: any
  isLast: boolean
  depth: number
}>()

const isOpen = ref(props.depth < 2) // Auto expand top levels

const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(() => props.value !== null && typeof props.value === 'object')
const isExpandable = computed(() => isObject.value && Object.keys(props.value).length > 0)

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return `"${props.value}"`
  if (props.value === null) return 'null'
  return String(props.value)
})

const valueClass = computed(() => {
  if (typeof props.value === 'string') return 'text-green-600 dark:text-green-400'
  if (typeof props.value === 'number') return 'text-blue-600 dark:text-blue-400'
  if (typeof props.value === 'boolean') return 'text-purple-600 dark:text-purple-400'
  if (props.value === null) return 'text-red-500'
  return 'text-foreground'
})

const toggle = () => {
  if (isExpandable.value) {
    isOpen.value = !isOpen.value
  }
}
</script>