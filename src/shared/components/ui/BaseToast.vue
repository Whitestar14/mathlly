<template>
  <div
    class="fixed z-[150] bottom-4 right-4 h-auto w-80"
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
        :role="toast.ariaRole"
        :aria-live="toast.ariaRole === 'alert' ? 'assertive' : 'polite'"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
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
          <!-- New: Action Button -->
          <div
            v-if="toast.action"
            class="mt-2"
          >
            <BaseButton
              size="sm"
              variant="link"
              class="h-auto p-0 text-xs font-medium"
              :class="actionClasses[toast.type] || actionClasses.info"
              @click="handleActionClick(toast.id, toast.action.onClick)"
            >
              {{ toast.action.label }}
            </BaseButton>
          </div>
        </div>

        <!-- Close Button -->
        <div
          v-if="toast.dismissible !== false"
          class="flex-shrink-0"
        >
          <BaseButton
            size="sm"
            variant="ghost"
            class="rounded-full p-1 h-auto"
            @click="removeToast(toast.id)"
          >
            <XIcon class="h-3.5 w-3.5 text-muted-foreground" />
          </BaseButton>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { BadgeXIcon, BadgeAlertIcon, CheckCircle2Icon, BadgeInfoIcon, XIcon } from 'lucide-vue-next';
import { useToast, type ToastType } from '@composables/ui/useToast';
import { BaseButton } from '@components/ui';
import type { Component } from 'vue';

interface Props {
  isMobile: boolean;
}
defineProps<Props>();

const { toasts, removeToast, pauseToast, resumeToast } = useToast();

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

const actionClasses: ToastTypeClasses = {
  info: 'text-foreground hover:text-foreground/80',
  success: 'text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300',
  warning: 'text-yellow-700 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300',
  error: 'text-red-500 hover:text-red-600 dark:text-destructive dark:hover:text-red-300'
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

const handleActionClick = (id: number, onClick: () => void) => {
  onClick();
  removeToast(id);
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
}
</style>
