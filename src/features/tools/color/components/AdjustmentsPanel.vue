
<template>
  <BasePanel
    id="adjustments"
    title="Adjustments"
    type="drawer"
    position="left"
    :max-height-ratio="1"
    :default-desktop-state="false">

    <div class="p-3">
      <BaseAccordion
        default-value="basic-adjustments"
        :multiple="false"
        :collapsible="true"
        class="w-full">

        <AccordionItem
          id="basic-adjustments"
          title="Basic Adjustments">
          <ColorAdjustments
            :current-color="currentColor"
            :update-color="updateColor"
            :auto-apply="autoApply" />
        </AccordionItem>

        <AccordionItem
          id="temperature"
          title="Temperature">
          <ColorTemperature
            :current-color="currentColor"
            :update-color="updateColor" />
        </AccordionItem>

        <AccordionItem
          id="color-mixing"
          title="Color Mixing">
          <ColorMixing
            :current-color="currentColor"
            :update-color="updateColor" />
        </AccordionItem>

        <AccordionItem
          v-if="showImageExtractor"
          id="image-extractor"
          title="Image Color Extractor">
          <ImageColorExtractor
            :update-color="updateColor" />
        </AccordionItem>
      </BaseAccordion>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { BasePanel, BaseAccordion, AccordionItem } from '@components/ui'
import { onMounted } from 'vue'
import ColorAdjustments from './ColorAdjustments.vue'
import ColorTemperature from './ColorTemperature.vue'
import ColorMixing from './ColorMixing.vue'
import ImageColorExtractor from './ImageColorExtractor.vue'
import type { RGB } from '@color/lib/color'
import { useKeyboardStore } from '@stores/keyboard'
import { usePanel } from '@composables/ui/usePanel'

defineProps<{ currentColor: RGB, updateColor: (c: RGB) => void, showImageExtractor: boolean, autoApply: boolean }>()

const panel = usePanel('adjustments')
const keyboard = useKeyboardStore()
onMounted(() => {
  keyboard.attachAllForContext('tools.color', { 'Ctrl+A': () => panel.toggle() })
})
</script>
