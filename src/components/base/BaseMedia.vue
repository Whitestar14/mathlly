<!-- eslint-disable vue/no-v-html -->
<template>
  <div 
    :class="containerClasses"
    :aria-label="alt"
    :role="role"
  >
    <!-- SVG content -->
    <div 
      v-if="type === 'svg' && svgContent" 
      class="inline-block"
      :aria-hidden="hideFromScreenReaders"
      v-html="svgContent"
    />
    
    <!-- Image -->
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
      @load="handleMediaLoad"
    >
    
    <!-- Video -->
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
      @loadeddata="handleMediaLoad"
    >
      <source
        v-if="effectiveSrc"
        :src="effectiveSrc"
        :type="mimeType"
      >
      <slot name="fallback">
        <p>Your browser doesn't support this video format.</p>
      </slot>
    </video>

    <!-- Fallback content -->
    <div
      v-else-if="showFallback"
      class="fallback"
    >
      <slot name="fallback">
        <div
          class="flex items-center justify-center bg-muted dark:bg-background rounded-md"
          :style="`width: ${width}px; height: ${height}px;`"
        >
          <ImageIcon class="h-6 w-6 text-muted-foreground dark:text-muted-foreground" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { ImageIcon } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import { useFetch } from '@vueuse/core';

const props = defineProps({
  type: {
    type: String,
    default: "img",
    validator: (value) => ["img", "svg", "video"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl", "custom"].includes(value),
  },
  src: {
    type: String,
    default: "",
  },
  darkSrc: {
    type: String,
    default: "",
  },
  svgPath: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "Media content",
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
    default: ""
  },
  playsinline: {
    type: Boolean,
    default: true
  },
  mimeType: {
    type: String,
    default: "video/mp4"
  },
  objectFit: {
    type: String,
    default: "cover",
    validator: (value) => ["contain", "cover", "fill", "none", "scale-down"].includes(value),
  },
  rounded: {
    type: String,
    default: "none",
    validator: (value) => ["none", "sm", "md", "lg", "full"].includes(value),
  }
});

const emit = defineEmits(['error', 'load']);

const { isDark } = useTheme();

const svgContent = ref('');
const svgCache = new Map();
const hasError = ref(false);
const isLoaded = ref(false);
const showFallback = ref(false);

// Use Tailwind classes directly
const containerClasses = computed(() => [
  'inline-flex items-center justify-center overflow-hidden',
  {
    'rounded-sm': props.rounded === 'sm',
    'rounded-md': props.rounded === 'md',
    'rounded-lg': props.rounded === 'lg',
    'rounded-full': props.rounded === 'full',
  }
]);

const sizeClasses = computed(() => {
  if (props.width && props.height) return '';
  
  switch (props.size) {
    case 'sm': return 'h-6 w-auto';
    case 'lg': return 'h-14 w-auto';
    case 'xl': return 'h-24 w-auto';
    default: return 'h-8 w-auto'; // md
  }
});

const mediaClasses = computed(() => [
  'max-w-full transition-opacity duration-300',
  sizeClasses.value,
  {
    'opacity-0': !isLoaded.value && !hasError.value,
    'opacity-100': isLoaded.value && !hasError.value,
    [`object-${props.objectFit}`]: props.objectFit,
  }
]);

const role = computed(() => {
  if (props.hideFromScreenReaders) return 'presentation';
  if (props.type === 'img' || props.type === 'svg') return 'img';
  if (props.type === 'video') return 'video';
  return null;
});

const effectiveSrc = computed(() => {
  if (isDark.value && props.darkSrc) {
    return props.darkSrc;
  }
  return props.src;
});

// Use vueuse's useFetch for SVG loading
const loadSvgContent = async () => {
  const path = props.svgPath;
  if (!path) return;
  
  if (svgCache.has(path)) {
    svgContent.value = svgCache.get(path);
    isLoaded.value = true;
    return;
  }

  try {
    const { data, error } = await useFetch(path).get().text();
    
    if (error.value) throw new Error('Failed to load SVG');
    
    let svg = data.value;
    
    // Add size classes to SVG
    svg = svg.replace(/<svg/, `<svg class="${sizeClasses.value}"`);
    
    svgCache.set(path, svg);
    svgContent.value = svg;
    isLoaded.value = true;
  } catch (error) {
    console.error('Error loading SVG:', error);
    hasError.value = true;
    showFallback.value = true;
    emit('error', error);
  }
};

// Handle media load error
const handleMediaError = (error) => {
  hasError.value = true;
  showFallback.value = true;
  emit('error', error);
};

// Handle media load success
const handleMediaLoad = () => {
  isLoaded.value = true;
  emit('load');
};

// Watch for changes in svgPath
watch(() => props.svgPath, loadSvgContent);

// Watch for changes in dark mode or src
watch([isDark, () => props.src, () => props.darkSrc], () => {
  if (props.type === 'img' || props.type === 'video') {
    // Reset loading state when source changes
    isLoaded.value = false;
    hasError.value = false;
    showFallback.value = false;
  }
});

// Load SVG on mount
onMounted(() => {
  if (props.type === 'svg' && props.svgPath) {
    loadSvgContent();
  }
});
</script>

<style scoped>
:deep(svg) {
  display: inline-block;
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
