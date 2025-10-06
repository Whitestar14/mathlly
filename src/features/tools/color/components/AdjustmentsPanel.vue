<!-- src/features/tools/color/components/AdjustmentsCard.vue -->
<template>
  <BasePanel
    id="adjustments"
    title="Adjustments"
    type="drawer"
    position="left"
    :default-desktop-state="false"
  >
    <!-- Accordion Layout -->
    <div class="p-3">
      <BaseAccordion
        default-value="basic-adjustments"
        :multiple="false"
        :collapsible="true"
        class="w-full"
      >
        <!-- Basic Adjustments Section -->
        <AccordionItem
          id="basic-adjustments"
          title="Basic Adjustments"
        >
          <ColorAdjustments
            :current-color="currentColor"
            :update-color="updateColor"
          />
        </AccordionItem>

        <!-- Temperature Section -->
        <AccordionItem
          id="temperature"
          title="Temperature"
        >
          <ColorTemperature
            :current-color="currentColor"
            :update-color="updateColor"
          />
        </AccordionItem>

        <!-- Color Mixing Section -->
        <AccordionItem
          id="color-mixing"
          title="Color Mixing"
        >
          <ColorMixing
            :current-color="currentColor"
            :update-color="updateColor"
          />
        </AccordionItem>
      </BaseAccordion>
    </div>
  </BasePanel>
</template>
  
<script setup lang="ts">
import { BasePanel, BaseAccordion, AccordionItem } from '@components/ui'
import ColorAdjustments from './ColorAdjustments.vue'
import ColorTemperature from './ColorTemperature.vue'
import ColorMixing from './ColorMixing.vue'
import type { RGB } from '@color/lib/color'

defineProps<{ currentColor: RGB, updateColor: (c: RGB) => void }>()
</script>