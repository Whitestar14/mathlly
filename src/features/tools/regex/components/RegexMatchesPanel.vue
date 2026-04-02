<template>
  <div class="flex flex-col h-full">
    <BaseCard title="Match Results">
      <template #header>
        <!-- Header -->
        <BaseBadge v-if="matches.length > 0" variant="success"
          >{{ matches.length }} match{{
            matches.length !== 1 ? 'es' : ''
          }}</BaseBadge
        >
        <BaseBadge v-else variant="outline">No matches</BaseBadge>
      </template>

      <div class="flex-1 flex flex-col gap-2">
        <!-- Visual Preview -->
        <BaseAccordion type="single" collapsible default-value="visual-preview">
          <AccordionItem value="visual-preview" title="Visual Preview">
            <div
              class="p-3 bg-muted/5 font-mono text-sm leading-6 whitespace-pre-wrap break-all max-h-[250px] overflow-y-auto"
            >
              <template v-for="(part, i) in highlightedText" :key="i">
                <mark
                  v-if="part.isMatch"
                  class="bg-primary/20 text-primary font-bold rounded px-0.5"
                  >{{ part.text }}</mark
                >
                <span v-else>{{ part.text }}</span>
              </template>

              <div v-if="highlightedText.length === 0">
                <h3>No highlighted text detected</h3>
              </div>
            </div>
          </AccordionItem>
          <AccordionItem value="detailed-view" title="Detailed View">
            <div v-if="matches.length > 0" class="flex flex-col gap-4">
              <div
                v-for="(match, i) in matches"
                :key="i"
                class="p-3 text-sm font-mono overflow-auto"
              >
                <div
                  class="font-semibold text-primary mb-2 flex items-center justify-between border-b border-border pb-2 group"
                >
                  <span>Match {{ i + 1 }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-muted-foreground font-normal text-xs"
                      >Index: {{ match.index }} &mdash;
                      {{ match.index + match[0].length }}</span
                    >
                    <button
                      type="button"
                      title="Jump to Index"
                      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      @click="$emit('jumpToIndex', match.index)"
                    >
                      <LocateIcon class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <!-- Full Match -->
                <div class="grid grid-cols-[80px_1fr] gap-2 py-1 items-start">
                  <span class="text-muted-foreground select-none">Full</span>
                  <span class="break-all font-medium">{{ match[0] }}</span>
                </div>

                <!-- Capture Groups (Numeric) -->
                <template
                  v-for="groupIdx in match.length - 1"
                  :key="'group-' + groupIdx"
                >
                  <div
                    v-if="match[groupIdx] !== undefined"
                    class="grid grid-cols-[80px_1fr] gap-2 py-1 items-start border-t border-border/50"
                  >
                    <span class="text-muted-foreground select-none"
                      >Group {{ groupIdx }}</span
                    >
                    <span class="break-all">{{ match[groupIdx] }}</span>
                  </div>
                </template>

                <!-- Named Groups -->
                <template v-if="match.groups">
                  <div
                    v-for="(val, name) in match.groups"
                    :key="'name-' + name"
                    class="grid grid-cols-[80px_1fr] gap-2 py-1 items-start border-t border-border/50"
                  >
                    <span class="text-muted-foreground select-none"
                      >Group '{{ name }}'</span
                    >
                    <span class="break-all">{{ val }}</span>
                  </div>
                </template>
              </div>
            </div>

            <div
              v-else
              class="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center text-sm border border-dashed border-border rounded-md"
            >
              <p>No matches found.</p>
              <p class="text-xs mt-1 opacity-70">
                Adjust your pattern or test string.
              </p>
            </div>
          </AccordionItem>
        </BaseAccordion>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LocateIcon } from 'lucide-vue-next';
import {
  BaseBadge,
  BaseAccordion,
  BaseCard,
  AccordionItem,
} from '@components/ui';
import type { RegexMatch } from '../composables/useRegexTool';

interface Props {
  matches: RegexMatch[];
  testString: string;
}

const props = defineProps<Props>();

defineEmits(['jumpToIndex']);
interface TextPart {
  text: string;
  isMatch: boolean;
}

const highlightedText = computed<TextPart[]>(() => {
  if (props.matches.length === 0 || !props.testString) return [];

  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const match of props.matches) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: props.testString.slice(lastIndex, match.index),
        isMatch: false,
      });
    }
    // Add the match itself
    if (match[0].length > 0) {
      parts.push({
        text: match[0],
        isMatch: true,
      });
      lastIndex = match.index + match[0].length;
    } else {
      // Zero-length match (e.g., ^ or \b). Handle visually if needed.
      // Easiest is to add a small visual indicator, but standard regex testers just ignore highlighting zero-length.
      lastIndex = match.index;
    }
  }

  // Add remaining text
  if (lastIndex < props.testString.length) {
    parts.push({
      text: props.testString.slice(lastIndex),
      isMatch: false,
    });
  }

  return parts;
});
</script>
