<template>
  <ErrorFallback
    v-if="hasError"
    :error="error || undefined"
    :is-global-error="true" />
  <Suspense v-else>
    <AppProvider />

    <template #fallback>
      <div class="min-h-screen flex items-center justify-center">
        <BaseLoader variant="compact" />
      </div>
    </template>
  </Suspense>

  <UpdateNotification />
  <InstallNotification />
  <DevDock v-if="settings.experimental.devDockEnabled" />
</template>

<script setup lang="ts">
import { shallowRef, onErrorCaptured, type ComponentPublicInstance, defineAsyncComponent } from 'vue'
import { BaseLoader } from '@components/ui'
import { useSettingsStore } from '@stores/settings'
import { UpdateNotification, InstallNotification } from '@components/layout'
import { DevDock } from '@components/ui/dev'
import ErrorFallback from '@pages/ErrorFallback.vue'
import { hasError } from '@router/errorHandler'
import { useTheme } from '@composables/core/useTheme'
import router from '@router/router'
import { TelemetryService } from '@shared/services/telemetry/TelemetryService'

const settings = useSettingsStore()
useTheme()

const AppProvider = defineAsyncComponent(() => (async() => {
  const start = Date.now()
  const mod = await import('@app/providers/AppProvider.vue')

  try {
    await Promise.all([
      router.isReady(),
      settings.loadSettings()
    ])
  } catch(e) {
    console.warn('router.isReady() failed or timed out', e)
  }

  const minMs = 500
  const elapsed = Date.now() - start
  if (elapsed < minMs) await new Promise(r => setTimeout(r, minMs - elapsed))

  return mod
})())

const error = shallowRef<Error | null>(null)

onErrorCaptured((err: Error, instance: ComponentPublicInstance | null, info: string) => {
  console.error('[global error boundary]:', err, instance, info)

  TelemetryService.getInstance().logError(err)

  error.value = err
  hasError.value = true
  return false
})
</script>