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
    
    <div v-if="!readOnly" class="flex gap-2 mt-2">
      <slot name="actions">
        <!-- Default actions for output panel -->
        <BaseButton
          v-if="showConvertButton"
          variant="primary"
          size="sm"
          @click="$emit('convert')"
          :disabled="!modelValue || modelValue === '0'"
          class="flex-1">
          <Calculator class="h-4 w-4 mr-2" />
          Convert
        </BaseButton>
        <BaseButton
          v-if="showCopyButton"
          variant="ghost"
          size="icon-sm"
          @click="$emit('copy')"
          :disabled="!modelValue || modelValue === '0'"
          v-tippy="{ content: 'Copy result' }">
          <Copy class="h-4 w-4" />
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Calculator, Copy } from 'lucide-vue-next'
import {BaseInput, BaseButton} from '@components/ui'
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
  showConvertButton?: boolean
  showCopyButton?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedUnit': [unitId: string]
  'input': []
  'convert': []
  'copy': []
}>()
</script>
