<template>
  <div
    ref="containerRef"
    :class="[
      `loader-${variant} flex flex-col justify-center items-center`,
    ]"
    class="h-full font-mono"
  >
    <!-- Expanded Loader (formerly macro) -->
    <template v-if="variant === 'expanded'">
      <div class="relative flex flex-col items-center justify-center gap-8 pointer-events-none cursor-auto">
        <div class="relative z-10 flex items-center justify-center">
          <div class="relative text-6xl inline-flex">
            <span
              ref="bracketLeft"
              class="text-primary dark:text-primary font-medium opacity-0"
            >{</span>
            <span class="inline-flex *:text-foreground *:dark:text-foreground *:opacity-0">
              <span ref="letterM">m</span>
              <span ref="letterA">a</span>
              <span ref="letterT">t</span>
              <span ref="letterH">h</span>
            </span>
            <span class="relative inline-flex items-center justify-center w-[1.2em] *:left-1/2 *:-translate-x-1/2 *:text-primary *:dark:text-primary *:font-black *:opacity-0">
              <span
                ref="slashTop"
                class="top-0 origin-bottom"
              >/</span>
              <span
                ref="slashBottom"
                class="bottom-0 origin-top"
              >/</span>
            </span>
            <span
              ref="letterY"
              class="text-foreground dark:text-foreground opacity-0"
            >y</span>
            <span
              ref="bracketRight"
              class="text-primary dark:text-primary font-medium opacity-0"
            >}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Regular and Compact Loaders with simplified structure -->
    <template v-else>
      <div class="flex items-center justify-center">
        <div 
          class="css-loader" 
          :style="{ 
            '--loader-size': variant === 'compact' ? '1.5rem' : '2rem' 
          }"
          aria-label="Loading"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { shallowRef, onMounted, onBeforeUnmount, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { useAnimation } from '@/composables/useAnimation.ts';

const props = defineProps({
  variant: {
    type: String,
    default: "regular",
    validator: (value) => ["compact", "regular", "expanded"].includes(value),
  },
});

const slashTop = shallowRef(null);
const slashBottom = shallowRef(null);
const bracketLeft = shallowRef(null);
const bracketRight = shallowRef(null);
const letterM = shallowRef(null);
const letterA = shallowRef(null);
const letterT = shallowRef(null);
const letterH = shallowRef(null);
const letterY = shallowRef(null);

const containerRef = shallowRef(null);
const isVisible = useElementVisibility(containerRef);

const prefersReducedMotion = shallowRef(
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
);

if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    prefersReducedMotion.value = e.matches;
  });
}

const { createLogoAnimation } = useAnimation();
const { playAnimation, stopAnimation } = createLogoAnimation({
  elements: {
    slashTop,
    slashBottom,
    bracketLeft,
    bracketRight,
    letterM,
    letterA,
    letterT,
    letterH,
    letterY
  },
  prefersReducedMotion,
  isVisible
});

watch(isVisible, (visible) => {
  if (visible && props.variant === 'expanded') {
    playAnimation();
  }
});

onMounted(() => {
  if (isVisible.value && props.variant === 'expanded') {
    requestAnimationFrame(playAnimation);
  }
});

onBeforeUnmount(stopAnimation);
</script>

<style scoped>
.css-loader {
  /* Use CSS variables for dynamic sizing */
  width: var(--loader-size, 2rem);
  height: var(--loader-size, 2rem);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  border: 2px solid;
  border-color: #9ca3af #9ca3af transparent transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  /* Hardware acceleration */
  will-change: transform;
  transform: translateZ(0);
}

.css-loader::after,
.css-loader::before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 2px solid;
  border-color: transparent transparent #6366f1 #6366f1;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  border-radius: 50%;
  animation: rotationBack 0.5s linear infinite;
  transform-origin: center center;
  /* Hardware acceleration */
  will-change: transform;
  transform: translateZ(0);
}

.css-loader::before {
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  border-color: #9ca3af #9ca3af transparent transparent;
  animation: rotation 1.5s linear infinite;
}

.dark .css-loader {
  border-color: #4b5563 #4b5563 transparent transparent;
}

.dark .css-loader::after {
  border-color: transparent transparent #818cf8 #818cf8;
}

.dark .css-loader::before {
  border-color: #4b5563 #4b5563 transparent transparent;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotationBack {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
