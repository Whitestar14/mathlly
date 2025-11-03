<template>
  <AccordionItem
    :value="id"
    :disabled="disabled"
    class="overflow-hidden">
    <AccordionHeader>
      <AccordionTrigger
        class="group flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition">

        <ChevronRightIcon
          class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
        <span>{{ title }}</span>
      </AccordionTrigger>
    </AccordionHeader>

    <AccordionContent
      class="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
      <div class="px-3 pb-3 pt-2 text-sm text-foreground">
        <slot></slot>
      </div>
    </AccordionContent>
  </AccordionItem>
</template>

<script setup>
import {
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent
} from 'radix-vue'
import { ChevronRightIcon } from 'lucide-vue-next'

defineProps({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
</script>

<style scoped>
@keyframes accordion-down {
  from { height: 0; opacity: 0; }
  to { height: var(--radix-collapsible-content-height); opacity: 1; }
}
@keyframes accordion-up {
  from { height: var(--radix-collapsible-content-height); opacity: 1; }
  to { height: 0; opacity: 0; }
}

.animate-accordion-down {
  animation: accordion-down 200ms ease-out forwards;
}
.animate-accordion-up {
  animation: accordion-up 200ms ease-in forwards;
}
</style>
