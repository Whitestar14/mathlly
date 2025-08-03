import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";

export const useDeviceStore = defineStore("device", () => {
  const isMobile = ref(false);
  const isResizing = ref(false);
  let resizeTimeout: number | null = null;

  const updateDeviceInfo = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }

    if (!isResizing.value) {
      isResizing.value = true;
    }

    resizeTimeout = window.setTimeout(() => {
      isMobile.value = window.innerWidth < 768;
      isResizing.value = false;
    }, 100);
  };

  const initializeDeviceInfo = () => {
    updateDeviceInfo();
    useEventListener(window, "resize", updateDeviceInfo);
  };

  const destroyDeviceInfo = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  };

  onUnmounted(destroyDeviceInfo);

  return {
    isMobile,
    isResizing,
    updateDeviceInfo,
    initializeDeviceInfo,
    destroyDeviceInfo,
  };
});
