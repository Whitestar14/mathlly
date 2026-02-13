<template>
  <div class="grid grid-cols-3 flex-1 gap-1">
    <template v-for="(row, rowIndex) in numpadRows" :key="rowIndex">
      <template v-for="(btn, btnIndex) in row" :key="btnIndex">
        <div v-if="!btn" class="invisible"></div>
        <ConverterButton
          v-else :variant="btn.variant" :disabled="disabled" :icon="btn.icon" :value="btn.value"
          @click="handleClick(btn.value)" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { markRaw, computed } from 'vue'
import { Delete } from 'lucide-vue-next'
import { useVibrate } from '@vueuse/core'
import { useConverterOptions } from '@converter/composables/useConverterOptions'
import ConverterButton from './ConverterButton.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  autoConvert: {
    type: Boolean,
    default: true
  },
  converter: {
    type: String,
    default: 'temperature'
  }
})

const emit = defineEmits(['button-click'])

const { hapticFeedback } = useConverterOptions()
const { vibrate } = useVibrate({ pattern: 50 })

type Button = {
  value: string;
  variant: 'number' | 'function';
  icon?: any;
}

const staticRows = markRaw([
  [
    { value: '7', variant: 'number' },
    { value: '8', variant: 'number' },
    { value: '9', variant: 'number' }
  ],
  [
    { value: '4', variant: 'number' },
    { value: '5', variant: 'number' },
    { value: '6', variant: 'number' }
  ],
  [
    { value: '1', variant: 'number' },
    { value: '2', variant: 'number' },
    { value: '3', variant: 'number' }
  ]
])

const firstRow = computed(() =>
  [
    props.converter === 'temperature' ?
      { value: '-', variant: 'function' } :
      null,
    { value: 'CE', variant: 'function' },
    { value: 'backspace', variant: 'function', icon: Delete }
  ]
)

const lastRow = computed(() => !props.autoConvert ? [
  { value: '.', variant: 'number' },
  { value: '0', variant: 'number' },
  { value: '=', variant: 'function' }
] : [
  null,
  { value: '0', variant: 'number' },
  { value: '.', variant: 'number' }
])

const numpadRows = computed(() => [firstRow.value, ...staticRows, lastRow.value] as Button[][])

const handleClick = (value: string) => {
  if (hapticFeedback.value) {
    vibrate()
  }
  emit('button-click', value)
}
</script>