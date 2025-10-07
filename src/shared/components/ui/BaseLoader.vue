<template>
  <div
    :class="[
      `loader-${variant} flex flex-col justify-center items-center`,
    ]"
    class="h-full font-mono"
  >
    <!-- Compact Loader (grid-based) -->
    <template v-if="variant === 'compact'">
      <div 
        class="grid-loader" 
        :style="{ '--loader-size': size }"
        aria-label="Loading"
      />
    </template>

    <!-- Expanded Loader (rotating icon) -->
    <template v-else-if="variant === 'expanded'">
      <div class="h-auto overflow-hidden">
        <div class="icon-loader">
          <component
            :is="loaderIcon"
            :size="size"
            class="animate-spin"
          />
        </div>
        <div
          v-if="message"
          class="mt-3 text-sm text-center text-muted-foreground"
        >
          {{ message }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { shallowRef } from 'vue';
import { LoaderIcon } from 'lucide-vue-next';

defineProps({
  variant: {
    type: String,
    default: "compact",
    validator: (value) => ["compact", "expanded"].includes(value),
  },
  size: {
    type: [String, Number],
    default: "1.5rem"
  },
  message: {
    type: String,
    default: ""
  }
});

const loaderIcon = shallowRef(LoaderIcon);
</script>

<style scoped>
/* Grid-based Loader (compact variant) */
.grid-loader {
  width: var(--loader-size, 1.5rem);
  height: var(--loader-size, 1.5rem);
  aspect-ratio: 1;
  display: grid;
  position: relative;
}

.grid-loader,
.grid-loader::before,
.grid-loader::after {
  --c: no-repeat linear-gradient(currentColor 0 0);
  background: 
    var(--c), 
    var(--c), 
    var(--c), 
    var(--c);
  animation: 
    grid-loader-anim1 1.5s infinite, 
    grid-loader-anim2 1.5s infinite;
}

.grid-loader::before,
.grid-loader::after {
  content: "";
  grid-area: 1/1;
  transform: translate(calc(50% - 2px), calc(2px - 50%)) rotate(90deg);
  animation-delay: -0.25s;
}

.grid-loader::after {
  transform: translate(calc(2px - 50%), calc(50% - 2px)) rotate(90deg);
}

@keyframes grid-loader-anim1 {
  0%, 10%   { background-size: 0 4px, 4px 0 }
  40%, 60%  { background-size: 100% 4px, 4px 100% }
  90%, 100% { background-size: 0 4px, 4px 0 }
}

@keyframes grid-loader-anim2 {
  0%, 49.9% { background-position: 0 0, 0 0, 100% 100%, 100% 100% }
  50%, 100% { background-position: 100% 0, 0 100%, 0 100%, 100% 0 }
}

/* Icon Loader (expanded variant) */
.icon-loader {
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .grid-loader,
  .grid-loader::before,
  .grid-loader::after,
  .animate-spin {
    animation: none !important;
  }
  
  .icon-loader {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
}

/* Dark mode support */
.dark .grid-loader {
  --c: no-repeat linear-gradient(#94a3b8 0 0);
}
</style>