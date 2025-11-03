<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="containerClasses"
    :aria-label="alt"
    :role="role">

    <div
      v-if="type === 'svg' && internalSvgContent && !hasError"
      class="inline-block"
      :class="svgContainerClasses"
      :aria-hidden="hideFromScreenReaders"
      v-html="internalSvgContent"></div>

    <img
      v-else-if="type === 'img'"
      :src="effectiveSrc"
      :alt="alt"
      :class="mediaClasses"
      :loading="lazyLoad ? 'lazy' : 'eager'"
      :width="width"
      :height="height"
      :aria-hidden="hideFromScreenReaders"
      @error="handleMediaError"
      @load="handleMediaLoad" />

    <video
      v-else-if="type === 'video'"
      :class="mediaClasses"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :controls="controls"
      :poster="poster"
      :playsinline="playsinline"
      :loading="lazyLoad ? 'lazy' : 'eager'"
      :aria-hidden="hideFromScreenReaders"
      @error="handleMediaError"
      @loadeddata="handleMediaLoad">
      <source
        v-if="effectiveSrc"
        :src="effectiveSrc"
        :type="mimeType" />
      <slot name="fallback">
        <p>Your browser doesn't support this video format.</p>
      </slot>
    </video>

    <div
      v-else-if="showFallback || (type === 'svg' && !internalSvgContent && !isFetching)"
      class="fallback">
      <slot name="fallback">
        <div
          class="flex items-center justify-center bg-muted dark:bg-background rounded-md"
          :style="`width: ${width || 'auto'}; height: ${height || 'auto'};`"
          :class="sizeClasses">
          <ImageIcon class="h-6 w-6 text-muted-foreground dark:text-muted-foreground" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImageIcon } from 'lucide-vue-next'
import { useTheme } from '@composables/core/useTheme'
import { useFetch } from '@vueuse/core'

const props = defineProps({
  type: {
    type: String,
    default: 'img',
    validator: (value: string) => ['img', 'svg', 'video'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl', 'custom'].includes(value)
  },
  src: {
    type: String,
    default: ''
  },
  darkSrc: {
    type: String,
    default: ''
  },
  svgPath: {
    type: String,
    default: ''
  },
  svgContent: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Media content'
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  lazyLoad: {
    type: Boolean,
    default: true
  },
  hideFromScreenReaders: {
    type: Boolean,
    default: false
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: true
  },
  controls: {
    type: Boolean,
    default: false
  },
  poster: {
    type: String,
    default: ''
  },
  playsinline: {
    type: Boolean,
    default: true
  },
  mimeType: {
    type: String,
    default: 'video/mp4'
  },
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value: string) => ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value)
  },
  rounded: {
    type: String,
    default: 'none',
    validator: (value: string) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  }
})

const emit = defineEmits(['error', 'load'])

const { isDark } = useTheme()
const internalSvgContent = ref<string>('')
const hasError = ref<boolean>(false)
const isLoaded = ref<boolean>(false)
const showFallback = ref<boolean>(false)

const { data: fetchedSvgData, error: fetchError, isFetching } = useFetch(
  computed(() => (props.type === 'svg' && !props.svgContent ? props.svgPath : '')),
  { refetch: true }
).text()

const processSvg = (svgString: string) => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (svgElement) {
      if (!svgElement.hasAttribute('fill')) {
        svgElement.setAttribute('fill', 'currentColor')
      }

      if (!svgElement.hasAttribute('viewBox')) {
        const widthAttr = svgElement.getAttribute('width')
        const heightAttr = svgElement.getAttribute('height')
        if (widthAttr && heightAttr) {
          svgElement.setAttribute('viewBox', `0 0 ${widthAttr} ${heightAttr}`)
          console.warn(`SVG missing viewBox. Inferred from width/height: 0 0 ${widthAttr} ${heightAttr}`)
        } else {
          console.warn('SVG missing viewBox and no width/height attributes to infer from. SVG may not scale predictably.')
        }
      }

      svgElement.removeAttribute('width')
      svgElement.removeAttribute('height')

      internalSvgContent.value = new XMLSerializer().serializeToString(svgElement)
      isLoaded.value = true
      hasError.value = false
      showFallback.value = false
      emit('load')
    } else {
      throw new Error('Invalid SVG content: No <svg> element found.')
    }
  } catch(e) {
    console.error('Error parsing or manipulating SVG:', e)
    hasError.value = true
    showFallback.value = true
    internalSvgContent.value = ''
    emit('error', e)
  }
}

watch([fetchedSvgData, fetchError], () => {
  if (props.type !== 'svg' || props.svgContent) return // Only process if type is svg and svgContent is not provided

  if (fetchError.value) {
    console.error('Error fetching SVG:', fetchError.value)
    hasError.value = true
    showFallback.value = true
    internalSvgContent.value = ''
    emit('error', fetchError.value)
    return
  }

  if (fetchedSvgData.value) {
    processSvg(fetchedSvgData.value)
  } else if (!isFetching.value) {
    hasError.value = true
    showFallback.value = true
    internalSvgContent.value = ''
  }
}, { immediate: true })

watch(() => props.svgContent, newContent => {
  if (props.type === 'svg' && newContent) {
    processSvg(newContent)
  } else if (props.type === 'svg' && !newContent) {
    hasError.value = true
    showFallback.value = true
    internalSvgContent.value = ''
  }
}, { immediate: true })

const containerClasses = computed(() => [
  'inline-flex items-center justify-center overflow-hidden',
  {
    'rounded-sm': props.rounded === 'sm',
    'rounded-md': props.rounded === 'md',
    'rounded-lg': props.rounded === 'lg',
    'rounded-full': props.rounded === 'full'
  },

  props.width && props.height ? `w-[${props.width}px] h-[${props.height}px]` : sizeClasses.value
])

const svgContainerClasses = computed(() => {
  if (props.width && props.height) {
    return `w-[${props.width}px] h-[${props.height}px]`
  }
  return sizeClasses.value
})

const sizeClasses = computed(() => {
  if (props.size === 'custom') return '' // Custom size handled by width/height props
  switch (props.size) {
    case 'sm': return 'h-6 w-6'
    case 'lg': return 'h-14 w-14'
    case 'xl': return 'h-24 w-24'
    default: return 'h-8 w-8' // md
  }
})

const mediaClasses = computed(() => [
  'max-w-full transition-opacity duration-300',

  !props.width && !props.height ? sizeClasses.value : '',
  {
    'opacity-0': !isLoaded.value && !hasError.value,
    'opacity-100': isLoaded.value && !hasError.value,
    [`object-${props.objectFit}`]: props.objectFit
  }
])

const role = computed(() => {
  if (props.hideFromScreenReaders) return 'presentation'
  if (props.type === 'img' || props.type === 'svg') return 'img'
  if (props.type === 'video') return 'video'
  return undefined // Changed from null to undefined
})

const effectiveSrc = computed(() => {
  if (isDark.value && props.darkSrc) {
    return props.darkSrc
  }
  return props.src
})

const handleMediaError = (error: Event) => {
  hasError.value = true
  showFallback.value = true
  emit('error', error)
}

const handleMediaLoad = () => {
  isLoaded.value = true
  emit('load')
}

watch([isDark, () => props.src, () => props.darkSrc], () => {
  if (props.type === 'img' || props.type === 'video') {
    isLoaded.value = false
    hasError.value = false
    showFallback.value = false
  }
})
</script>

<style scoped>
/* Use :deep() for styling injected SVG content */
:deep(svg) {
  display: block; /* Ensures it takes up full space of its container */
  width: 100%;
  height: 100%;
}

:deep(svg path),
:deep(svg rect),
:deep(svg circle) {
  transition: fill 0.2s, stroke 0.2s;
}

.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
