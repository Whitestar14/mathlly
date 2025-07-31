<template>
  <div>
    <ErrorFallback
      v-if="hasError"
      :error="error"
      :is-global-error="true"
    />
    <Suspense v-else>
      <template #default>
        <AppProvider>
          <AppSetup />
        </AppProvider>
      </template>
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center">
          <BaseLoader variant="regular" />
        </div>
      </template>
    </Suspense>
    
    <!-- Production Components -->
    <UpdateNotification />
    
    <!-- Development Components -->
    <DevDock />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onErrorCaptured, type ComponentPublicInstance } from 'vue';
import { hasError } from "@router/errorHandler";
import ErrorFallback from '@pages/ErrorFallback.vue';
import AppProvider from '@app/providers/AppProvider.vue';
import { BaseLoader } from '@components/ui';
import { AppSetup, UpdateNotification } from '@components/layout';
import { DevDock } from '@components/ui/dev';

const error = shallowRef<Error | null>(null);

onErrorCaptured((err: Error, instance: ComponentPublicInstance | null, info: string): boolean => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  
  return false;
});
</script>
