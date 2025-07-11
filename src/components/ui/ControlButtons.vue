<template>
  <div
    class="flex items-center left-0 top-0 absolute z-5 opacity-30 transition-opacity hover:opacity-100 group"
  >
    <div
      class="flex items-center m-2 border border-border dark:border-border bg-muted dark:bg-background rounded-lg overflow-hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        class="rounded-none hover:bg-muted group-hover:bg-opacity-100 md:hidden"
        @click="openHistory"
      >
        <DraftingCompassIcon size="15" />
      </Button>
      <Separator
        class="h-6 bg-muted dark:bg-muted w-px md:hidden group-has-[.rounded-none:hover]:h-8 transition-[height]"
      />
      <Button
        v-tippy="{content: 'Copy to Clipboard', placement: 'right'}"
        variant="ghost"
        size="icon"
        class="rounded-none hover:bg-muted group-hover:bg-opacity-100"
        @click="copyToClipboard"
      >
        <Copy size="15" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Separator } from "radix-vue";
import { Copy, DraftingCompassIcon } from "lucide-vue-next";
import Button from "@/components/base/BaseButton.vue";

const emit = defineEmits(["open-activity", "copy-to-clipboard"]);

const openHistory = () => emit("open-activity");
const copyToClipboard = () => emit("copy-to-clipboard");
</script>
