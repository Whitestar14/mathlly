<template>
  <div class="space-y-6">
    <slot name="header">
      <div class="sticky top-0 z-20 -p-3 bg-backdrop-surface/95 backdrop-blur-md border-b border-border">
        <div class="flex items-center gap-2 p-2">
          <BaseButton
            variant="ghost"
            size="icon"
            class="shrink-0 transition-colors duration-200"
            @click="$emit('close')"
          >
            <ArrowLeft class="h-4 w-4" />
          </BaseButton>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-foreground">
              Tool Options
            </h3>
          </div>
        </div>
      </div>
    </slot>
    <!-- Options grouped by section -->
    <div class="space-y-6 p-3">
      <template
        v-for="section in groupedOptions"
        :key="section.name"
      >
        <div
          v-if="section.options.length > 0"
          class="space-y-4"
        >
          <!-- Section Header -->
          <div class="flex items-center gap-2">
            <div class="h-px flex-1 bg-border" />
            <h4
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2"
            >
              {{ section.name }}
            </h4>
            <div class="h-px flex-1 bg-border" />
          </div>
          <div class="space-y-4">
            <div
              v-for="option in section.options"
              :key="option.id"
              class="group"
            >
              <!-- Toggle Option -->
              <div
                v-if="option.type === 'toggle'"
                class="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200"
              >
                <div class="flex-1 min-w-0 pr-4">
                  <label
                    :for="option.id"
                    class="text-sm font-medium text-foreground cursor-pointer block"
                  >
                    {{ option.label }}
                  </label>
                  <p
                    v-if="option.description"
                    class="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {{ option.description }}
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <ToggleBar
                    :id="option.id"
                    :model-value="option.value.value[option.id]"
                    class="data-[state=checked]:bg-primary"
                    @update:model-value="updateOptionValue(option, $event)"
                  />
                </div>
              </div>
              <!-- SelectBar Option -->
              <div
                v-else-if="option.type === 'select'"
                class="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 space-y-3"
              >
                <div>
                  <label
                    :for="option.id"
                    class="text-sm font-medium text-foreground block"
                  >
                    {{ option.label }}
                  </label>
                  <p
                    v-if="option.description"
                    class="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {{ option.description }}
                  </p>
                </div>
                <SelectBar
                  :id="option.id"
                  :model-value="option.value.value[option.id]"
                  :options="option.options || []"
                  class="w-full"
                  @update:model-value="updateOptionValue(option, $event)"
                />
              </div>
              <!-- Radio Option -->
              <div
                v-else-if="option.type === 'radio'"
                class="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 space-y-3"
              >
                <div>
                  <label class="text-sm font-medium text-foreground block">
                    {{ option.label }}
                  </label>
                  <p
                    v-if="option.description"
                    class="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {{ option.description }}
                  </p>
                </div>
                <RadioGroupRoot
                  :model-value="option.value.value[option.id]"
                  class="space-y-2"
                  @update:model-value="updateOptionValue(option, $event)"
                >
                  <div
                    v-for="radioOption in option.options"
                    :key="radioOption.value"
                    class="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50 transition-colors duration-200"
                  >
                    <RadioGroupItem
                      :id="`${option.id}-${radioOption.value}`"
                      :value="radioOption.value"
                      class="w-4 h-4 rounded-full border-2 border-border text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-transparent data-[state=checked]:border-primary transition-all duration-200"
                    />
                    <label
                      :for="`${option.id}-${radioOption.value}`"
                      class="text-sm text-foreground cursor-pointer flex-1"
                    >
                      {{ radioOption.label }}
                    </label>
                  </div>
                </RadioGroupRoot>
              </div>
              <!-- Range Option -->
              <div
                v-else-if="option.type === 'range'"
                class="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <label
                      :for="option.id"
                      class="text-sm font-medium text-foreground block"
                    >
                      {{ option.label }}
                    </label>
                    <p
                      v-if="option.description"
                      class="text-xs text-muted-foreground mt-1 leading-relaxed"
                    >
                      {{ option.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <span class="text-xs text-muted-foreground">
                      {{ option.min }}
                    </span>
                    <span
                      class="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded-md min-w-[3rem] text-center"
                    >
                      {{ option.value.value[option.id] }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      {{ option.max }}
                    </span>
                  </div>
                </div>
                <div class="relative">
                  <BaseSlider
                    :id="option.id"
                    v-model="option.value.value[option.id]"
                    :min="option.min"
                    :max="option.max"
                    :step="option.step"
                    @update:model-value="updateOptionValue(option, Number($event))"
                  />
                  <!-- Range track indicators -->
                  <div class="flex justify-between text-xs text-muted-foreground/60 mt-1 px-1">
                    <span>{{ option.min }}</span>
                    <span>{{ option.max }}</span>
                  </div>
                </div>
              </div>
              <!-- Color Option -->
              <div
                v-else-if="option.type === 'color'"
                class="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 space-y-3"
              >
                <div>
                  <label
                    :for="option.id"
                    class="text-sm font-medium text-foreground block"
                  >
                    {{ option.label }}
                  </label>
                  <p
                    v-if="option.description"
                    class="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {{ option.description }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    :id="option.id"
                    :value="option.value.value[option.id]"
                    type="color"
                    class="w-12 h-8 rounded-md border border-border cursor-pointer"
                    @input="
                      updateOptionValue(
                        option,
                        ($event.target as HTMLInputElement).value
                      )
                    "
                  >
                  <span class="text-sm font-mono text-muted-foreground">
                    {{ option.value.value[option.id] }}
                  </span>
                </div>
              </div>
              <!-- Number Input Option -->
              <div
                v-else-if="option.type === 'number'"
                class="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 space-y-3"
              >
                <div>
                  <label
                    :for="option.id"
                    class="text-sm font-medium text-foreground block"
                  >
                    {{ option.label }}
                  </label>
                  <p
                    v-if="option.description"
                    class="text-xs text-muted-foreground mt-1 leading-relaxed"
                  >
                    {{ option.description }}
                  </p>
                </div>
                <input
                  :id="option.id"
                  :value="option.value.value[option.id]"
                  type="number"
                  :min="option.min"
                  :max="option.max"
                  :step="option.step"
                  class="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                  @input="
                    updateOptionValue(
                      option,
                      Number(($event.target as HTMLInputElement).value)
                    )
                  "
                >
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- Empty state -->
      <div
        v-if="groupedOptions.length === 0"
        class="text-center py-8"
      >
        <Settings class="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p class="text-sm text-muted-foreground">
          No options available for this tool
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, Settings } from 'lucide-vue-next';
import type { ToolConfig, ToolOption } from '@stores/toolSettings';
import { BaseButton, SelectBar, ToggleBar, BaseSlider } from '@components/ui'
import { RadioGroupRoot, RadioGroupItem } from 'radix-vue';

interface Props {
  toolOptions: ToolConfig;
}

const props = defineProps<Props>();
defineEmits<{
  close: [];
}>();

// Update option value with proper reactivity
const updateOptionValue = (option: ToolOption, newValue: any) => {
  option.value.value[option.id] = newValue;
};

// Group options by section
const groupedOptions = computed(() => {
  const sections = new Map<string, typeof props.toolOptions.options>();
  props.toolOptions.options.forEach((option) => {
    const sectionName = option.section || 'General';
    if (!sections.has(sectionName)) {
      sections.set(sectionName, []);
    }
    sections.get(sectionName)!.push(option);
  });
  return Array.from(sections.entries()).map(([name, options]) => ({
    name,
    options,
  }));
});
</script>

<style scoped>
.radio-item {
  position: relative;
}

.radio-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: hsl(var(--primary));
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
}

.radio-item[data-state='checked']::before {
  opacity: 1;
  transform: scale(0.5);
}

.focus-enhanced:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: hsl(var(--ring));
  ring-offset: 2px;
  ring-offset-color: hsl(var(--background));
}

.option-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

input[type='color'] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

input[type='color']::-moz-color-swatch,
input[type='color']::-webkit-color-swatch {
  @apply rounded-md border-border border;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0px,
    hsl(var(--muted-foreground) / 0.1) 40px,
    hsl(var(--muted)) 80px
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
</style>
