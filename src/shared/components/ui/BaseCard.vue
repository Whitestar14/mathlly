<script setup lang="ts">

defineProps({
  title: { type: String, required: false, default: '' },
  subtitle: { type: String, required: false, default: '' },
  as: { type: String, required: false, default: 'div' }
})

</script>

<template>
  <component
    :is="as || 'div'"
    :v-bind="$attrs"
    :class="['rounded-lg border border-border overflow-hidden border-collapse']"
  >
    <div v-if="title || $slots.header" class="px-6 py-4 bg-muted/50 dark:bg-muted/40 border-b border-border">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h3 v-if="title" class="text-sm font-medium leading-6">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
        </div>
        <div>
          <slot name="header" />
        </div>
      </div>
    </div>

    <div class="p-3 md:p-6 bg-background dark:bg-background">
      <slot />
    </div>

    <div v-if="$slots.footer || $slots.actions" class="px-6 py-3 border-t border-border bg-muted/25 dark:bg-muted/20">
      <div class="flex items-center justify-between">
        <div>
          <slot name="footer" />
        </div>
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </component>
</template>
