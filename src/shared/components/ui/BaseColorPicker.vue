  <template>
    <BasePopover v-model:open="open" :modal="true" :prevent-scroll="true" :trap-focus="true" :disable-outside-pointer-events="true">
      <template #trigger>
        <BaseButton variant="outline" size="sm" class="flex items-center gap-2">
          <div class="w-4 h-4 rounded border border-border" :style="{ backgroundColor: rgbaCss }" />
          <Palette class="w-4 h-4" />
        </BaseButton>
      </template>
  
      <template #default>
        <div class="p-4 w-72 space-y-4 bg-card rounded-lg">
          <!-- SV panel -->
          <div
            ref="svEl"
            class="relative w-full h-36 rounded-md cursor-crosshair select-none"
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
            @update:modelValue="onHueUpdate"
            :min="0"
            :max="360"
            :step="1"
            class="w-full"
          />
  
          <!-- Alpha slider -->
          <div class="bg-checkerboard rounded-md p-2">
            <BaseSlider
              :model-value="[Math.round(hsva.a * 100)]"
              @update:modelValue="onAlphaUpdate"
              :min="0"
              :max="100"
              :step="1"
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
  import { type RGBA, hexToHsva, hsvaToRgba, rgbaToHex } from '@features/tools/color/composables/useColor.deprecated'
  
  const props = defineProps<{ modelValue: RGBA }>()
  const emit = defineEmits<{ (e: 'update:modelValue', val: RGBA): void }>()
  
  const open = ref(false)
  
  const hsva = reactive({ h: 0, s: 1, v: 1, a: 1 })
  
  const rgba = computed(() => hsvaToRgba(hsva))
  const rgbaCss = computed(() => `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${rgba.value.a})`)
  
  const hexInput = ref('#000000')
  
  watch(
    () => props.modelValue,
    (rgbaVal) => {
      const hex = rgbaToHex(rgbaVal, true)
      const parsed = hexToHsva(hex)
      if (parsed) Object.assign(hsva, parsed)
      hexInput.value = hex
    },
    { immediate: true }
  )

  // Scroll locking is handled by Radix Popover via BasePopover props
  
  watch(
    hsva,
    () => {
      const next = { r: rgba.value.r, g: rgba.value.g, b: rgba.value.b, a: rgba.value.a }
      emit('update:modelValue', next)
      hexInput.value = rgbaToHex(next, true)
    },
    { deep: true }
  )
  
  function onHueUpdate(valueArray: number[]) {
    hsva.h = valueArray[0]
  }
  function onAlphaUpdate(valueArray: number[]) {
    hsva.a = valueArray[0] / 100
  }

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
  