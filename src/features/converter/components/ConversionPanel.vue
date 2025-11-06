<template>
  <div class="bg-card flex-1 flex flex-col gap-1 border border-border rounded-lg px-4 py-0.5 justify-center md:justify-evenly md:p-6">
    <BaseInput
      :model-value="modelValue"
      :type="'text'"
      :inputmode="'decimal'"
      :placeholder="placeholder"
      :disabled="readOnly"
      :error="error"
      :auto-select="true"
      :autofocus="false"
      class="text-4xl md:text-6xl text-right border-0 font-mono"
      @update:model-value="$emit('update:modelValue', $event)"
      @input="$emit('input')"
      aria-label="Conversion value"
    />
    
    <div>
      <UnitSelector
        :units="units"
        :selected-unit="selectedUnit"
        :disabled="readOnly"
        @update:selected-unit="$emit('update:selectedUnit', $event)"
      />
    </div>
    
    <div v-if="error" class="flex items-center text-destructive text-sm">
      <AlertCircle class="h-4 w-4 mr-1" />
      {{ error }}
    </div>
    
    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import {BaseInput} from '@components/ui'
import UnitSelector from './UnitSelector.vue'
import type { ConversionUnit } from '../types/converter'

defineProps<{
  modelValue: string
  label: string
  units: ConversionUnit[]
  selectedUnit: string
  readOnly?: boolean
  error?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedUnit': [unitId: string]
  'input': []
}>()
</script>