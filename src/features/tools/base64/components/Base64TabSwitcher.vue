<template>
  <Suspense>
    <SegmentedControl
      class="w-full flex-1"
      :model-value="currentTab"
      :options="options"
      @update:model-value="val => setTab(val as 'encode' | 'decode')" />
    <template #fallback>
      <div class="w-full inline-flex items-center rounded-md bg-muted p-1 h-10 animate-pulse"></div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SegmentedControl } from '@components/ui'
import { ArrowRight, ArrowLeft } from 'lucide-vue-next'
import { useBase64TabSwitcher } from '../composables/useBase64TabSwitcher'

const { currentTab, setTab } = useBase64TabSwitcher()

const options = computed(() => [
  { value: 'encode', label: 'Encode', icon: ArrowRight },
  { value: 'decode', label: 'Decode', icon: ArrowLeft }
])
</script>