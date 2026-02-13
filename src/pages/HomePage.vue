<template>
  <BasePage
    :show-header="false"
    :show-footer="false"
    :show-back-button="false"
    title="Home"
    main-class="min-h-screen bg-background p-0 relative overflow-hidden"
  >

        <Transition name="fade" mode="out-in">
            <component 
                :is="currentView" 
                class="relative z-10 h-full w-full"
                @switch-layout="toggleLayout" 
            />
        </Transition>

    <WelcomeModal v-model="showWelcomeModal" />
  </BasePage>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useAppStorageStore } from '@stores/appStorage'
import { useSettingsStore } from '@stores/settings'
import { BasePage } from '@components/ui'
import { WelcomeModal } from '@components/layout'

// Async Views
const ClassicView = defineAsyncComponent(() => import('@features/home/components/views/ClassicView.vue'))
const DashboardView = defineAsyncComponent(() => import('@features/home/components/views/DashboardView.vue'))

const showWelcomeModal = ref(false)
const storageStore = useAppStorageStore()
const settingsStore = useSettingsStore()

const currentLayout = computed(() => settingsStore.experimental.homeLayout || 'classic')

const currentView = computed(() => {
    return currentLayout.value === 'dashboard' ? DashboardView : ClassicView
})

const toggleLayout = () => {
    const next = currentLayout.value === 'dashboard' ? 'classic' : 'dashboard'
    settingsStore.updateSetting('experimental.homeLayout', next)
}

onMounted(() => {
  const hasShownWelcome = storageStore.get('onboarding', 'welcomeShown', false)
  if (!hasShownWelcome) {
    useTimeoutFn(() => showWelcomeModal.value = true, 800)
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>