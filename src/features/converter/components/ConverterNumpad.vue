<template>
  <div class="grid grid-cols-3 flex-1 gap-1">
    <template v-for="(row, rowIndex) in numpadRows" :key="rowIndex">
      <template v-for="(btn, btnIndex) in row" :key="btnIndex">
        <div v-if="!btn" class="invisible"></div>
        <ConverterButton
          v-else
          :variant="btn.variant"
          :disabled="disabled"
          :icon="btn.icon"
          :value="btn.value"
          @click="handleClick(btn.value)">
        </ConverterButton>
      </template>
    </template>
  </div>
</template>
  
<script setup>
import { markRaw } from 'vue'
import { Delete } from 'lucide-vue-next'
import ConverterButton from './ConverterButton.vue'
  
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
  
const emit = defineEmits(['button-click'])
  
const numpadRows = markRaw([
  [
    null,
    { value: 'CE', variant: 'function' },
    { value: 'backspace', variant: 'function', icon: Delete }
  ],
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
  ],
  [
    null,
    { value: '0', variant: 'number' },
    { value: '.', variant: 'number' }
  ]
])
  
const handleClick = (value) => {
  emit('button-click', value)
}
</script>
