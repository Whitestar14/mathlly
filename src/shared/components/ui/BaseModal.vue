<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <!-- Modal Container -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
  <Teleport to="#modal-root">
        <div
          v-if="open"
          class="fixed inset-0 flex items-center justify-center p-4"
          :style="{ zIndex: zIndex }"
          @click.self="closeModal"
        >
          <DialogContent
            ref="contentRef"
            :class="[
              'relative flex flex-col bg-background border border-border rounded-xl shadow-2xl w-full max-h-[90vh]',
              sizeClasses
            ]"
            :aria-labelledby="titleId"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <!-- Sticky Header -->
            <div class="sticky top-0 z-10 flex-shrink-0 bg-background border-b border-border rounded-t-xl">
              <div class="flex items-center justify-between p-3 pb-2">
                <!-- Title Section -->
                <div
                  :id="titleId"
                  class="flex-1 min-w-0 pr-4"
                  :class="hideCloseButton ? '' : 'pr-4'"
                >
                  <DialogTitle
                    as="h2"
                    class="text-lg font-medium text-foreground leading-tight"
                  >
                    <slot name="title">
                      {{ title }}
                    </slot>
                  </DialogTitle>
                </div>
                <!-- Close Button -->
                <BaseButton
                  v-if="!hideCloseButton"
                  variant="ghost"
                  size="icon"
                  :aria-label="closeButtonLabel"
                  @click="closeModal"
                >
                  <XIcon class="h-4 w-4" />
                  <span class="sr-only">{{ closeButtonLabel }}</span>
                </BaseButton>
              </div>
            </div>
            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto min-h-0">
              <div class="p-6 pt-4">
                <slot />
              </div>
            </div>
            <!-- Sticky Footer -->
            <div
              v-if="$slots.footer"
              class="sticky bottom-0 z-10 flex-shrink-0 bg-background border-t border-border rounded-b-xl"
            >
              <div class="p-6 pt-4">
                <slot name="footer" />
              </div>
            </div>
          </DialogContent>
        </div>
      </Teleport>
    </Transition>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@shared/composables/utils/useFocusTrap'
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
} from "radix-vue";
import { useEventListener } from "@vueuse/core";
import BaseButton from '@components/ui/BaseButton.vue'
import { XIcon } from "lucide-vue-next";
import { registerModal, unregisterModal, openModal as openModalManager, closeModal as closeModalManager, useModal } from '@shared/composables/ui/useModal'

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';

interface Props {
  open?: boolean;
  title?: string;
  size?: ModalSize;
  id?: string;
  closeOnClickOutside?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  closeButtonLabel?: string;
  hideCloseButton?: boolean; 
}

/**
 * Component emits interface
 */
interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'close'): void;
  (e: 'open'): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '',
  size: 'md',
  closeOnClickOutside: true,
  closeOnEscape: true,
  closeButtonLabel: 'Close dialog',
  hideCloseButton: false,
});

const emit = defineEmits<Emits>();

const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

const sizeClassMap: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-[95vw]',
};

const sizeClasses: ComputedRef<string> = computed(() => {
  return sizeClassMap[props.size] || sizeClassMap.md;
});

const generatedId = `modal-${Math.random().toString(36).substr(2, 9)}`
const modalId = (props as any).id ?? generatedId

onMounted(() => {
  registerModal(modalId, () => {
    emit('update:open', false)
  })
})

onBeforeUnmount(() => {
  unregisterModal(modalId)
})

watch(() => props.open, (val) => {
  if (val) openModalManager(modalId)
  else closeModalManager(modalId)
}, { immediate: true })

const modalComposable = useModal(modalId)
const zIndex = modalComposable.zIndex

const isLocked = useScrollLock(document.body)

const contentRef = ref<HTMLElement | null>(null)
const focusTrap = useFocusTrap(contentRef)

watch(modalComposable.isOpen, (open) => {
  if (open) {
    focusTrap.activate()
    isLocked.value = true
  } else {
    focusTrap.deactivate()
    isLocked.value = false
  }
})

onBeforeUnmount(() => {
  focusTrap.deactivate()
  isLocked.value = false
})

const handleOpenChange = (isOpen: boolean): void => {
  if (isOpen) openModalManager(modalId)
  else closeModalManager(modalId)

  emit('update:open', isOpen);
  if (isOpen) {
    emit('open');
  } else {
    emit('close');
  }
};

const closeModal = (): void => {
  if (props.closeOnClickOutside) {
    handleOpenChange(false);
  }
};

const handleEscapeKey = (event: KeyboardEvent): void => {
  if (props.closeOnEscape && event.key === 'Escape' && props.open) {
    event.preventDefault();
    event.stopPropagation();
    handleOpenChange(false);
  }
};

useEventListener(document, 'keydown', handleEscapeKey, {
  passive: false,
});
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Custom scrollbar for content area */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: oklch(var(--muted-foreground) / 0.4);
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: oklch(var(--muted-foreground) / 0.6);
}

/* Ensure proper focus management */
[role="dialog"]:focus {
  outline: none;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .p-6 {
    @apply p-4;
  }

  .pb-4 {
    @apply pb-3;
  }

  .pt-4 {
    @apply pt-3;
  }
}
</style>