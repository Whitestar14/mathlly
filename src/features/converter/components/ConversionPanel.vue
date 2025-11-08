<template>
  <div
    class="bg-card flex-1 flex flex-col gap-1 border border-border rounded-lg px-4 py-0.5 justify-center md:justify-evenly md:p-6">
    <BaseInput
      :model-value="modelValue" :type="'text'" :inputmode="'decimal'" :placeholder="placeholder"
      :disabled="readOnly" :error="error" :auto-select="false" :autofocus="false"
      class="text-4xl md:text-6xl text-right border-0 font-mono"
      aria-label="Conversion value" @update:model-value="$emit('update:modelValue', $event as string)" @input="$emit('input')"
      @blur="$emit('reset')" />

    <div class="flex flex-row justify-between">
      <UnitSelector
        :units="units" :selected-unit="selectedUnit" :disabled="readOnly"
        @update:selected-unit="$emit('update:selectedUnit', $event)" />

      <div v-if="readOnly">
        <BaseButton
          v-tippy="{ content: 'Copy result' }" variant="ghost" size="icon" :disabled="!modelValue"
          @click="$emit('copy')">
          <Copy class="size-4" />
        </BaseButton>
        <BaseButton
          v-if="showRefreshButton" v-tippy="{ content: 'Refresh exchange rates' }" variant="ghost" size="icon"
          @click="$emit('refresh')">
          <RotateCcw class="size-4" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy, RotateCcw } from 'lucide-vue-next'
import { BaseInput, BaseButton } from '@components/ui'
import UnitSelector from './UnitSelector.vue'
import type { ConversionUnit } from '../types/converter'

defineProps<{
  modelValue: string
  units: ConversionUnit[]
  selectedUnit: string
  readOnly?: boolean
  error?: string
  placeholder?: string
  showRefreshButton?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedUnit': [unitId: string]
  'input': []
  'copy': []
  'reset': []
  'refresh': []
}>()
</script>
