<template>
  <SelectBar
    :model-value="selectedUnit"
    :options="selectOptions"
    :placeholder="placeholder"
    :disabled="disabled"
    class="max-w-32"
    @update:model-value="$emit('update:selectedUnit', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {SelectBar} from '@components/ui'
import type { ConversionUnit } from '../types/converter'
import { useConverterOptions } from '@converter/composables/useConverterOptions'

const props = defineProps<{
  units: ConversionUnit[]
  selectedUnit: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:selectedUnit': [unitId: string]
}>()

const { showUnitAbbreviations } = useConverterOptions()

const selectOptions = computed(() =>
  props.units.map(unit => ({
    value: unit.id,
    label: showUnitAbbreviations.value
      ? unit.symbol
      : unit.name
  }))
)
</script>
