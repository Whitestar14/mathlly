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
    class="rounded-lg border bg-card border-border overflow-hidden border-collapse"
    v-bind="$attrs"
  >
    <!-- Header -->
    <div
      v-if="title || subtitle || $slots.head || $slots.header"
      class="px-4 py-2 bg-muted/50 dark:bg-muted/40 border-b border-border"
    >
      <div class="flex items-center justify-between gap-4">
        <!-- Left side: title/subtitle OR custom head slot -->
        <div class="flex items-center gap-3 min-w-0">
          <!-- If head slot provided, render it instead of title/subtitle -->
          <slot name="head">
            <div v-if="title || subtitle">
              <h3
                v-if="title"
                class="text-sm font-medium leading-6 truncate"
              >
                {{ title }}
              </h3>
              <p
                v-if="subtitle"
                class="text-xs text-muted-foreground mt-1 truncate"
              >
                {{ subtitle }}
              </p>
            </div>
          </slot>
        </div>

        <!-- Right side: header actions -->
        <div class="flex items-center gap-2 shrink-0">
          <slot name="header" />
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="p-3 md:p-6 bg-card">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer || $slots.actions"
      class="px-3 py-2 border-t border-border bg-muted/25 dark:bg-muted/20"
    >
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
