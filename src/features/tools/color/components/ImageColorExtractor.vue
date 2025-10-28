<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <BaseBadge variant="beta">Experimental</BaseBadge>
    </div>
    <p class="text-sm text-muted-foreground">Upload an image to extract dominant colors</p>

    <div
      v-if="!selectedImage"
      class="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        @change="handleFileSelect"
      >
      <Upload class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <button
        class="text-primary hover:underline"
        @click="fileInputRef?.click()"
      >
        Click to upload
      </button>
      or drag and drop
      <div class="text-xs text-muted-foreground mt-2">Maximum file size: 5MB</div>
    </div>

    <div v-else-if="isProcessing" class="flex items-center justify-center py-8">
      <Loader2 class="h-6 w-6 animate-spin mr-2" />
      Extracting colors...
    </div>

    <div v-else class="space-y-4">
      <div class="relative inline-block">
        <img :src="selectedImage" class="max-h-48 rounded border" />
        <button
          @click="clearImage"
          class="absolute top-2 right-2 bg-background rounded-full p-1 shadow hover:bg-muted transition-colors"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div v-if="extractedColors.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm">{{ extractedColors.length }} colors extracted</p>
          <BaseButton
            variant="outline"
            size="sm"
            @click="exportColors"
            v-tippy="{ content: 'Export colors as JSON' }"
          >
            <Download class="h-4 w-4 mr-1" />
            Export
          </BaseButton>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <Swatch
            v-for="(color, index) in extractedColors"
            :key="index"
            :color="color"
            v-tippy="{ content: `${rgbToHex(color)}` }"
            @click="handleColorClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, X, Loader2, Download } from 'lucide-vue-next'
import { BaseBadge, BaseButton } from '@components/ui'
import Swatch from '@color/components/Swatch.vue'
import { rgbToHex, extractDominantColors, resizeImage } from '@color/lib/color'
import type { RGB } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'
import { exportJSON } from '@shared/utils/object/exportJSON'
import { useClipboard } from '@vueuse/core'
const props = defineProps<{
  currentColor: RGB
  updateColor: (c: RGB) => void
}>()

const selectedImage = ref<string | null>(null)
const extractedColors = ref<RGB[]>([])
const isProcessing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.match('image/(png|jpeg|webp)')) {
    useToast().error('Invalid file type. Please upload PNG, JPEG, or WebP.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    useToast().error('File too large. Maximum size is 5MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = () => extractColors(reader.result as string)
  reader.readAsDataURL(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (!file) return

  if (!file.type.match('image/(png|jpeg|webp)')) {
    useToast().error('Invalid file type. Please upload PNG, JPEG, or WebP.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    useToast().error('File too large. Maximum size is 5MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = () => extractColors(reader.result as string)
  reader.readAsDataURL(file)
}

const extractColors = (imageDataUrl: string) => {
  isProcessing.value = true
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      useToast().error('Failed to process image')
      isProcessing.value = false
      return
    }

    const { width, height } = resizeImage(img, 200, 200)
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const colors = extractDominantColors(imageData, 8)
    extractedColors.value = colors
    isProcessing.value = false
    useToast().success(`Extracted ${colors.length} colors`)
  }
  img.src = imageDataUrl
  selectedImage.value = imageDataUrl
}

const clearImage = () => {
  selectedImage.value = null
  extractedColors.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const { copy } = useClipboard()
 
const handleColorClick = async (color: RGB) => {
  await copy(rgbToHex(color))
  props.updateColor(color)
  useToast().info('Color has been copied to clipboard!', { title: 'Copied!' })
}

const exportColors = () => {
  if (extractedColors.value.length === 0) {
    useToast().error('No colors to export')
    return
  }

  const data = {
    colors: extractedColors.value.map(color => ({
      hex: rgbToHex(color),
      rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
      values: { r: color.r, g: color.g, b: color.b }
    })),
    count: extractedColors.value.length,
    source: 'image-extraction'
  }

  const filename = `extracted-colors-${Date.now()}.json`
  exportJSON(data, filename, { type: 'color-extraction', tool: 'image-color-extractor' })
}
</script>
