<template>
  <router-view v-slot="{ Component }">
    <Transition
      name="fade"
      mode="out-in"
    >
      <component 
        :is="Component"
        :settings="settings"
        :is-mobile="isMobile"
      />
    </Transition>
  </router-view>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

interface Props {
  settings: Record<string, any>;
  isMobile: boolean;
}
defineProps<Props>();
</script>
