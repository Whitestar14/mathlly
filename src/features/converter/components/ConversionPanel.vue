<template>
  <div
    class="bg-card flex-1 flex flex-col gap-1 border border-border rounded-lg px-4 py-0.5 justify-center md:justify-evenly md:p-6">
    <BaseInput :model-value="modelValue" :type="'text'" :inputmode="'decimal'" :placeholder="placeholder"
      :disabled="readOnly" :error="error" :auto-select="false" :autofocus="false"
      class="text-4xl md:text-6xl text-right border-0 font-mono"
      @update:model-value="$emit('update:modelValue', $event as string)" @input="$emit('input')"
      aria-label="Conversion value" />

    <div class="flex flex-row justify-between">
      <UnitSelector :units="units" :selected-unit="selectedUnit" :disabled="readOnly"
        @update:selected-unit="$emit('update:selectedUnit', $event)" />

      <div v-if="readOnly">
        <BaseButton variant="ghost" size="icon" @click="$emit('copy')" :disabled="!modelValue"
          v-tippy="{ content: 'Copy result' }">
          <Copy class="size-4" />
        </BaseButton>
        <BaseButton v-if="showRefreshButton" variant="ghost" size="icon" @click="$emit('refresh')"
          v-tippy="{ content: 'Refresh exchange rates' }">
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
  showCopyButton?: boolean
  showRefreshButton?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedUnit': [unitId: string]
  'input': []
  'copy': []
  'refresh': []
}>()
</script>
