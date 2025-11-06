<template>
  <Suspense>
    <SelectBar
      class="w-full flex-1"
      :model-value="currentConverterType"
      :options="converterOptions"
      placeholder="Select converter"
      @update:model-value="val => updateConverterType(val as ConverterType)" />
    <template #fallback>
      <div class="w-full inline-flex items-center rounded-md bg-muted p-1 h-10 animate-pulse"></div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SelectBar } from '@components/ui'
import type { ConverterType } from '@converter/types'
import { useConverterTypeSwitcher } from '@converter/composables/useConverterTypeSwitcher'

const { currentConverterType, availableConverterTypes, updateConverterType } = useConverterTypeSwitcher()

const converterOptions = computed(() => 
  availableConverterTypes.map(type => ({
    value: type.value,
    label: type.label
  }))
)
</script>