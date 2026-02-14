<template>
  <BasePage
    title="QR Code Generator"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-background">
    <div class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 flex flex-col">

      <!-- Mobile Tabs Control -->
      <div class="md:hidden mb-4 shrink-0">
        <SegmentedControl
          v-model="mobileTab"
          class="w-full"
          :options="[
            { value: 'input', label: 'Configuration' },
            { value: 'result', label: 'Preview' }
          ]" />
      </div>

      <div class="flex-1 min-h-0 relative">
        <!-- Desktop Split Layout / Mobile Stacked with Transition -->
        <Transition name="panel-switch" mode="out-in">
          <div
            :key="isMobile ? mobileTab : 'desktop'"
            class="h-full w-full"
            :class="isMobile ? '' : 'grid grid-cols-2 gap-4'">
            <!-- Input Side -->
            <div
              class="h-full overflow-hidden"
              :class="{ 'hidden md:block': isMobile && mobileTab !== 'input' }">
              <QrInputPanel
                :content="contentState"
                :options="currentOptions"
                :auto-generate="autoGenerate"
                @update:content="updateContent"
                @update:options="updateOptions"
                @generate="handleGenerate"
                @clear="handleClear" />
            </div>

            <!-- Output Side -->
            <div
              class="h-full overflow-hidden"
              :class="{ 'hidden md:block': isMobile && mobileTab !== 'result' }">
              <QrOutputPanel
                :data-url="dataUrl"
                :is-generating="isGenerating"
                :error="error"
                @download="download" />
            </div>

          </div>
        </Transition>
      </div>

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive, computed } from 'vue'
import { BasePage, SegmentedControl } from '@components/ui'
import QrInputPanel from '../components/QrInputPanel.vue'
import QrOutputPanel from '../components/QrOutputPanel.vue'
import { useQrCode } from '../composables/useQrCode'
import { useQrOptions } from '../composables/useQrOptions'
import { useKeyboardStore } from '@stores/keyboard'
import { useDeviceStore } from '@stores/device'
import type { QrOptions, QrContentState } from '../types'

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'QR Code' }]

const { options: savedOptions, autoGenerate } = useQrOptions()
const { dataUrl, isGenerating, error, generate, debouncedGenerate, download } = useQrCode()
const keyboard = useKeyboardStore()
const device = useDeviceStore()

const isMobile = computed(() => device.isMobile)
const mobileTab = ref<'input' | 'result'>('input')

// Local State
const currentOptions = ref<QrOptions>({
  errorCorrectionLevel: savedOptions.value.defaultErrorCorrection,
  margin: savedOptions.value.defaultMargin,
  scale: savedOptions.value.defaultScale,
  color: {
    dark: savedOptions.value.defaultDarkColor,
    light: savedOptions.value.defaultLightColor,
    eye: savedOptions.value.defaultDarkColor // Default eye color same as data
  },
  width: 0,
  logo: null,
  backgroundImage: null,
  style: 'square',
  eyeStyle: 'square',
  frame: 'none',
  frameText: 'SCAN ME',
  frameColor: ''
})

const contentState = reactive<QrContentState>({
  type: 'text',
  text: '',
  url: '',
  wifi: { ssid: '', password: '', encryption: 'WPA/WPA2', hidden: false },
  email: { to: '', subject: '', body: '' },
  twitter: { text: '', url: '', hashtags: '', via: '' },
  crypto: { currency: 'bitcoin', address: '', amount: '', label: '' },
  pdf: { url: '' },
  app: { platform: 'ios', appId: '' }
})

const updateOptions = (newOpts: QrOptions) => {
  currentOptions.value = newOpts
}

const updateContent = (newContent: QrContentState) => {
  Object.assign(contentState, newContent)
}

const handleGenerate = () => {
  generate(contentState, currentOptions.value)
  // On mobile, switch to result tab after manual generation
  if (isMobile.value) {
    mobileTab.value = 'result'
  }
}

const handleClear = () => {
  contentState.text = ''
  contentState.url = ''
  dataUrl.value = null
  error.value = null
}

// Watchers
watch([contentState, currentOptions], () => {
  if (autoGenerate.value) {
    debouncedGenerate(contentState, currentOptions.value)
  }
}, { deep: true })

// Shortcuts
onMounted(() => {
  keyboard.pushContext('tools.qrcode')
  keyboard.attachAllForContext('tools.qrcode', {
    'Ctrl+Enter': handleGenerate,
    'Ctrl+S': () => download('png'),
    'Escape': handleClear
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.qrcode')
})
</script>

<style scoped>
.panel-switch-enter-active,
.panel-switch-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-switch-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.panel-switch-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
