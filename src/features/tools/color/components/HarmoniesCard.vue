<!-- HarmoniesCard.vue -->
<template>
    <BaseCard title="Color harmonies">
      <template #header>
        <BaseTabs v-model="tab" :tabs="tabs" />
      </template>
  
      <ColorHarmonies
        :current="current"
        :active="tab"
        @update:active="val => (tab = val)"
        :onSelect="onSelect"
      />
    </BaseCard>
  </template>
  
  <script setup lang="ts">
  import { BaseCard, BaseTabs } from '@components/ui'
  import ColorHarmonies from './ColorHarmonies.vue'
  const tab = defineModel<string>()
  
  defineProps<{
    current: any
    tabs: { value: string; label: string }[]
    onSelect: (c: any) => void
  }>()
  </script>
  