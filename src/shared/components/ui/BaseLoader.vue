<template>
  <div
    :class="[`loader-${variant} flex flex-col justify-center items-center`]"
    class="h-full font-mono">
    <template v-if="variant === 'compact'">
      <div
        class="prism-loader"
        :style="{ '--loader-size': size }"
        aria-label="Loading">
        <svg
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
          class="prism-logo">
          <defs>

            <linearGradient
              id="gloss"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%">
              <stop
                offset="0%"
                stop-color="transparent" />
              <stop
                offset="35%"
                stop-color="currentColor"
                stop-opacity="0.15" />
              <stop
                offset="50%"
                stop-color="currentColor"
                stop-opacity="0.55" />
              <stop
                offset="65%"
                stop-color="currentColor"
                stop-opacity="0.15" />
              <stop
                offset="100%"
                stop-color="transparent" />
            </linearGradient>

            <mask id="sweep-mask">
              <rect
                width="500"
                height="500"
                fill="url(#gloss)"
                filter="url(#blur)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="-500 500"
                  to="500 -500"
                  dur="2.5s"
                  repeatCount="indefinite" />
              </rect>
            </mask>

            <filter
              id="blur"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="12" />
            </filter>
          </defs>

          <g mask="url(#sweep-mask)">
            <path
              d="m 191.76758,384.44141 c -0.42074,-7.9e-4 -0.84283,0.0186 -1.26758,0.0586 -1.975,1.146 -3.475,2.813 -4.5,5 -28.586,64.003 -56.753,128.17 -84.5,192.5 0.198,3.401 1.865,5.734 5,7 6.089,0.384 12.089,-0.282 18,-2 66.305,-14.794 132.638,-29.461 199,-44 8.498,-0.523 11.332,-4.689 8.5,-12.5 -42.7,-45.032 -85.034,-90.365 -127,-136 l -9.5,-9.5 c -1.2255,-0.3705 -2.47022,-0.55625 -3.73242,-0.55859 z M 189.5,414.5 c 0.997,-0.03 1.664,0.47 2,1.5 6.133,25.993 10.966,52.16 14.5,78.5 -26.667,22 -53.333,44 -80,66 1.37,-5.771 3.37,-11.438 6,-17 19.179,-43.022 38.345,-86.022 57.5,-129 z"
              transform="translate(-101.5,-384.44138)"
              fill="currentColor" />
          </g>
        </svg>
      </div>
    </template>

    <template v-else-if="variant === 'expanded'">
      <div class="h-auto overflow-hidden">
        <div class="icon-loader">
          <component
            :is="loaderIcon"
            :size="Number(size) || 5"
            class="animate-spin" />
        </div>
        <div
          v-if="message"
          class="mt-3 text-sm text-center text-muted-foreground">
          {{ message }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { LoaderIcon } from 'lucide-vue-next'

defineProps({
  variant: {
    type: String,
    default: 'compact',
    validator: (v: string) => ['compact', 'expanded'].includes(v)
  },
  size: { type: [String, Number], default: '1.5rem' },
  message: { type: String, default: '' }
})

const loaderIcon = shallowRef(LoaderIcon)
</script>

<style scoped>
.prism-loader {
  width: var(--loader-size, 2rem);
  height: var(--loader-size, 2rem);
  scale: 5;
}

.icon-loader,
.prism-loader {
  display: flex;
  justify-content: center;
  align-items: center;
}

g {
  transform-box: fill-box;
  transform-origin: center;
  transform: translate(50%, 50%);
}
</style>
