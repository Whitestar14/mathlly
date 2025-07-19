<template>
  <div 
    class="fixed z-30 bottom-4 right-4 h-auto w-80" 
    :class="{ '-translate-x-1/2 left-1/2 right-auto': isMobile }"
  >
    <TransitionGroup 
      name="toast-transition" 
      tag="div"
      class="relative"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="absolute overflow-hidden origin-bottom-right duration-300 transform-gpu flex items-start gap-2"
        :class="[
          toastTypeClasses[toast.type] || toastTypeClasses.info,
          'rounded-md shadow-lg border p-3 w-full'
        ]"
        :style="{
          zIndex: toasts.length - toasts.indexOf(toast),
          bottom: isMobile ? `${toasts.indexOf(toast) * 4}px` : `${toasts.indexOf(toast) * 8}px`,
          right: isMobile ? `${toasts.indexOf(toast) * 2}px` : `${toasts.indexOf(toast) * 4}px`,
        }"
      >
        <!-- Toast Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <component 
            :is="toastIcons[toast.type] || toastIcons.info" 
            :class="iconClasses[toast.type] || iconClasses.info"
            class="h-4 w-4" 
          />
        </div>
        
        <!-- Toast Content -->
        <div class="flex-grow">
          <div class="flex justify-between items-start">
            <h3
              class="font-medium text-sm"
              :class="titleClasses[toast.type] || titleClasses.info"
            >
              {{ toast.title || defaultTitles[toast.type] || defaultTitles.info }}
            </h3>
          </div>
          <p 
            class="text-xs mt-0.5" 
            :class="messageClasses[toast.type] || messageClasses.info"
          >
            {{ toast.message || toast.description }}
          </p>
        </div>
        
        <!-- Close Button -->
        <div
          v-if="toast.dismissible !== false"
          class="flex-shrink-0"
        >
          <Button 
            size="sm" 
            variant="ghost" 
            class="rounded-full p-1 h-auto"
            @click="removeToast(toast.id)"
          >
            <XIcon class="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { BadgeXIcon, BadgeAlertIcon, CheckCircle2Icon, BadgeInfoIcon, XIcon } from 'lucide-vue-next';
import { useToast, type ToastType } from '@/composables/useToast';
import Button from "@/components/base/BaseButton.vue";
import type { Component } from 'vue';

interface Props {
  isMobile: boolean;
}

defineProps<Props>();

const { toasts, removeToast } = useToast();

type ToastTypeClasses = Record<ToastType, string>;
type ToastIcons = Record<ToastType, Component>;
type DefaultTitles = Record<ToastType, string>;

const toastTypeClasses: ToastTypeClasses = {
  info: 'bg-muted dark:bg-background border-border dark:border-border/70',
  success: 'bg-emerald-50 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-950/95 border-amber-200 dark:border-amber-800',
  error: 'bg-rose-50 dark:bg-rose-950/95 border-rose-200 dark:border-rose-800'
};

const titleClasses: ToastTypeClasses = {
  info: 'text-foreground',
  success: 'text-green-700 dark:text-green-400',
  warning: 'text-yellow-700 dark:text-yellow-400',
  error: 'text-red-700 dark:text-destructive'
};

const messageClasses: ToastTypeClasses = {
  info: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-300',
  warning: 'text-yellow-600 dark:text-yellow-300',
  error: 'text-destructive dark:text-red-300'
};

const iconClasses: ToastTypeClasses = {
  info: 'text-foreground',
  success: 'text-green-700 dark:text-green-400',
  warning: 'text-yellow-700 dark:text-yellow-400', 
  error: 'text-red-700 dark:text-destructive'
};

const toastIcons: ToastIcons = {
  info: BadgeInfoIcon,
  success: CheckCircle2Icon,
  warning: BadgeAlertIcon,
  error: BadgeXIcon
};

const defaultTitles: DefaultTitles = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error'
};
</script>

<style scoped>
/* Simplified transitions for better mobile performance */
.toast-transition-enter-active,
.toast-transition-leave-active,
.toast-transition-move {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-transition-enter-from,
.toast-transition-leave-to {
  transform: translateY(20px);
  opacity: 0;
  @apply md:translate-x-[20px] md:translate-y-0;
}
</style>
