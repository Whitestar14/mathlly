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
          <Loader variant="regular" />
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
import { hasError } from "@/router/errorHandler";
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import AppProvider from '@/components/panel/AppProvider.vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import UpdateNotification from '@/components/ui/UpdateNotification.vue';
import DevDock from '@/components/dev/DevDock.vue';

const error = shallowRef<Error | null>(null);

onErrorCaptured((err: Error, instance: ComponentPublicInstance | null, info: string): boolean => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  
  return false;
});
</script>
