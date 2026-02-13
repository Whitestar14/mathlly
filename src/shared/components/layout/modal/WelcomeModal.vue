<template>
  <BaseModal
    id="welcome-modal"
    :open="modelValue"
    size="4xl"
    :naked="true"
    :hide-close-button="true"
    :close-on-click-outside="false"
    :close-on-escape="true"
    @update:open="$emit('update:modelValue', $event)">
    
    <div class="flex flex-col md:flex-row min-h-[550px] bg-card text-card-foreground overflow-hidden">
      
      <!-- Hero Section -->
      <div class="relative w-full md:w-[40%] bg-muted/10 overflow-hidden flex items-center justify-center p-10 md:p-0 border-b md:border-b-0 md:border-r border-border/50">
         
         <!-- Atmospheric Background -->
         <div class="absolute inset-0 pointer-events-none select-none">
            <div class="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] blur-[60px]" 
                 style="background: conic-gradient(from 0deg at 50% 50%, oklch(var(--color-primary)/0), oklch(var(--color-primary)/0.25) 50%, oklch(var(--color-accent)/0.25) 100%);">
            </div>
            <div class="absolute inset-0 pattern-grid opacity-[0.04]"></div>
         </div>

         <!-- Dynamic Logo -->
         <div 
           v-motion
           :initial="{ opacity: 0, scale: 0.8, y: 20 }"
           :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 800, type: 'spring', stiffness: 100 } }"
           class="relative z-10 size-32 md:size-56 drop-shadow-2xl"
         >
            <BaseMedia type="svg" :svg-content="PrismSvg" class="w-full h-full text-foreground/90 scale-150" />
         </div>
      </div>

      <!-- Content Section -->
      <div class="flex-1 p-6 md:p-10 flex flex-col">
        
        <div class="mb-8">
           <h1 
             v-motion
             :initial="{ opacity: 0, x: 10 }"
             :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
             class="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground"
           >
             Prism
           </h1>
           <p 
             v-motion
             :initial="{ opacity: 0, x: 10 }"
             :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
             class="text-lg text-muted-foreground font-medium"
           >
             Clarity at Speed.
           </p>
           <p 
             v-motion
             :initial="{ opacity: 0 }"
             :enter="{ opacity: 1, transition: { delay: 400 } }"
             class="text-sm text-muted-foreground mt-3 leading-relaxed"
           >
             Your new all-in-one developer utility belt. Built for precision, performance, and modern workflows.
           </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 flex-1 content-start">
          <div 
             v-for="(feature, idx) in features" 
             :key="feature.title"
             v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { delay: 500 + (idx * 50) } }"
             class="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
          >
            <div class="p-2 rounded-lg bg-background shadow-sm text-primary shrink-0">
               <component :is="feature.icon" class="size-4" />
            </div>
            <div>
              <h3 class="text-sm font-semibold">{{ feature.title }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50 mt-auto">
           <label class="flex items-center gap-2 cursor-pointer group select-none">
            <input
              v-model="dontShowAgain"
              type="checkbox"
              class="size-4 rounded border-border text-primary focus:ring-primary/20 bg-background" />
            <span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Don't show again</span>
          </label>

          <BaseButton
            variant="primary"
            size="lg"
            class="w-full sm:w-auto shadow-lg shadow-primary/20"
            @click="handleGetStarted">
            Get Started
            <ArrowRight class="ml-2 h-4 w-4" />
          </BaseButton>
        </div>

      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStorageStore } from '@stores/appStorage'
import {
  Calculator,
  Palette,
  ArrowRightLeft,
  Binary,
  ArrowRight
} from 'lucide-vue-next'
import { BaseModal, BaseButton, BaseMedia } from '@components/ui'
import PrismSvg from '@assets/icons/prism-hero.svg?raw'

interface Props {
  modelValue: boolean
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}
defineProps<Props>()
const emit = defineEmits<Emits>()

const storageStore = useAppStorageStore()

const welcomeShown = computed({
  get: () => storageStore.get('onboarding', 'welcomeShown', false),
  set: (value: boolean) => storageStore.set('onboarding', 'welcomeShown', value)
})
const dontShowAgain = ref(false)

const features = [
  { 
    title: 'Smart Calculator', 
    desc: 'Programmer & Scientific modes', 
    icon: Calculator 
  },
  { 
    title: 'Universal Converter', 
    desc: 'Units, currencies, and CSS', 
    icon: ArrowRightLeft 
  },
  { 
    title: 'Color Studio', 
    desc: 'Palettes & Accessibility', 
    icon: Palette 
  },
  { 
    title: 'Dev Tools', 
    desc: 'Base64, JSON & more', 
    icon: Binary 
  }
]

const handleGetStarted = (): void => {
  if (dontShowAgain.value) {
    welcomeShown.value = true
  }
  emit('update:modelValue', false)
}
</script>