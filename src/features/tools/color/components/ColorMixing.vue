<!-- src/features/tools/color/components/ColorMixing.vue -->
<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <BaseLabel class="text-sm font-medium">
        Mix with color
      </BaseLabel>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-border"
          :style="{ backgroundColor: mixHex }"
        />
        <BaseInput
          :value="mixHex"
          placeholder="#ffffff"
          class="flex-1"
          @input="onMixHex"
        />
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel class="text-sm font-medium">
        Mix ratio: {{ mixRatio }}%
      </BaseLabel>
      <BaseSlider
        :model-value="[mixRatio]"
        :min="0"
        :max="100"
        :step="1"
        @update:model-value="(v: number[]) => setMixRatio(v[0])"
      />
    </div>

    <div class="pt-2">
      <BaseButton
        size="sm"
        class="w-full"
        @click="applyMix(currentColor)"
      >
        <Blend class="h-4 w-4 mr-2" /> Mix colors
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Blend } from 'lucide-vue-next'
import { computed } from 'vue'
import { BaseInput, BaseSlider, BaseButton, BaseLabel } from '@components/ui'
import { useColorMixing } from '../composables/useColorMixing'
import { convertColor } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'
import type { RGB } from '@color/lib/color'

const props = defineProps<{ currentColor: RGB, updateColor: (c: RGB) => void }>()
const { toast } = useToast()

const { mixColor, mixRatio, setMixHex, setMixRatio, applyMix } = useColorMixing(props.updateColor)
const mixHex = computed(() => convertColor(mixColor.value).hex)

const onMixHex = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  const ok = setMixHex(val)
  if (!ok) {
    toast({ title: 'Invalid hex', description: 'Please enter a 6-digit hex like #00AACC' })
  }
}
</script>
