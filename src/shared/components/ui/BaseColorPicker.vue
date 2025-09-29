<template>
    <BasePopover v-model:open="open">
      <!-- Trigger -->
      <template #trigger>
        <BaseButton variant="outline" size="sm" class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded border border-border"
            :style="{ backgroundColor: rgbaCss }"
          />
          <Palette class="w-4 h-4" />
        </BaseButton>
      </template>
  
      <!-- Content -->
      <template #default>
        <div class="p-4 w-72 space-y-4 bg-card rounded-lg shadow-md">
          <!-- Saturation/Value panel -->
          <div
            ref="svEl"
            class="relative w-full h-36 rounded-md border border-border cursor-crosshair select-none"
            :style="{ background: `hsl(${hsva.h}, 100%, 50%)` }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div
              class="absolute w-3 h-3 rounded-full border-2 border-white shadow"
              :style="{
                left: `${hsva.s * 100}%`,
                top: `${(1 - hsva.v) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }"
            />
          </div>
  
          <!-- Hue slider -->
          <BaseSlider
            :model-value="[hsva.h]"
            @update:modelValue="v => hsva.h = v[0]"
            :min="0" :max="360" :step="1"
            class="w-full"
          />
  
          <!-- Alpha slider -->
          <div class="bg-checkerboard rounded-md p-2">
            <BaseSlider
              :model-value="[Math.round(hsva.a * 100)]"
              @update:modelValue="v => hsva.a = v[0] / 100"
              :min="0" :max="100" :step="1"
              class="w-full"
            />
          </div>
  
          <!-- Preview + Hex input -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded border border-border" :style="{ backgroundColor: rgbaCss }" />
            <BaseInput v-model="hexInput" @input="onHexType" class="flex-1" />
          </div>
        </div>
      </template>
    </BasePopover>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { useMouseInElement, useMousePressed } from '@vueuse/core'
  import { BasePopover, BaseSlider, BaseInput, BaseButton } from '@components/ui'
  import { Palette } from 'lucide-vue-next'
  import { hexToHsva, hsvaToRgba, rgbaToHex } from '@color/composables/useColor'
  import type { RGB } from '@color/types/color'
  
  const props = defineProps<{ modelValue: RGB }>()
  const emit = defineEmits<{ (e: 'update:modelValue', val: RGB): void }>()
  
  // Popover open state
  const open = ref(false)
  
  // HSVA state
  const hsva = reactive({ h: 0, s: 1, v: 1, a: 1 })
  
  // Derived RGBA + CSS
  const rgba = computed(() => hsvaToRgba(hsva))
  const rgbaCss = computed(() => `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${rgba.value.a})`)
  
  // Hex input
  const hexInput = ref('#000000')
  
  // Keep hsva in sync with incoming RGB
  watch(() => props.modelValue, (rgb) => {
    const hex = rgbaToHex({ ...rgb, a: 1 })
    const parsed = hexToHsva(hex)
    if (parsed) Object.assign(hsva, parsed)
    hexInput.value = hex
  }, { immediate: true })
  
  // Emit RGB when hsva changes
  watch(hsva, () => {
    const { r, g, b } = rgba.value
    emit('update:modelValue', { r, g, b })
    hexInput.value = rgbaToHex(rgba.value, true)
  }, { deep: true })
  
  function onHexType() {
    const parsed = hexToHsva(hexInput.value)
    if (parsed) Object.assign(hsva, parsed)
  }
  
  // SV panel logic
  const svEl = ref<HTMLElement | null>(null)
  const { elementX, elementY } = useMouseInElement(svEl)
  const { pressed } = useMousePressed({ target: svEl, touch: true })
  
  watch([elementX, elementY, pressed], ([x, y, down]) => {
    if (!svEl.value || !down) return
    const rect = svEl.value.getBoundingClientRect()
    hsva.s = Math.min(1, Math.max(0, x / rect.width))
    hsva.v = 1 - Math.min(1, Math.max(0, y / rect.height))
  })
  </script>
  
  <style scoped>
  .bg-checkerboard {
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  }
  </style>
  