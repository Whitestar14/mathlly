<template>
  <SwitchRoot
    :checked="modelValue"
    class="relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring"
    :class="
      modelValue ? 'bg-primary' : 'bg-secondary'
    "
    @update:checked="updateChecked">
    <SwitchThumb
      class="inline-block transform rounded-full bg-background transition-transform"
      :class="modelValue ? 'translate-x-5 w-4 h-4' : 'translate-x-1.5 w-3 h-3'" />
  </SwitchRoot>
</template>

<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'radix-vue'

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>()

const emit = defineEmits<Emits>()

const updateChecked = (checked: boolean): void => {
  emit('update:modelValue', checked)
}
</script>
