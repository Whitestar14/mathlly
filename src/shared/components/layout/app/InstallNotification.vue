<!-- components/InstallNotification.vue -->
<script setup lang="ts">
import { XIcon, SmartphoneIcon } from 'lucide-vue-next'
import { usePWAInstallPrompt } from '@composables/core/usePWAInstallPrompt'
import { BaseButton } from '@components/ui'

const { canInstall, dismissedInstall, isInstalled, promptInstall, dismissInstall } = usePWAInstallPrompt()
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transform transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95">
    <div v-if="canInstall && !isInstalled && !dismissedInstall" class="fixed bottom-3 left-3 right-3 z-50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-full sm:max-w-sm">
      <div class="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <div class="bg-primary/10 p-2 rounded-lg">
                <SmartphoneIcon class="h-4 w-4 text-primary" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-card-foreground">Install this app?</h3>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <BaseButton variant="ghost" size="icon" @click="dismissInstall">
                    <XIcon class="h-4 w-4" />
                  </BaseButton>
                </div>
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed mb-3">
                Add Prism to your home screen for quick access.
              </p>
            </div>
          </div>
        </div>
        <div class="border-t border-border bg-muted/30 p-3">
          <div class="flex gap-2 justify-end">
            <BaseButton variant="outline" size="sm" @click="dismissInstall">No thanks</BaseButton>
            <BaseButton variant="primary" size="sm" @click="promptInstall">Install</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
