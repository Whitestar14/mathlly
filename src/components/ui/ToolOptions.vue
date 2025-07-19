<template>
  <div class="space-y-6">
    <slot name="header">
      <div class="flex items-center gap-2 pb-3 border-b border-border">
        <BaseButton
          variant="ghost"
          size="icon"
          @click="$emit('close')"
          class="shrink-0 hover:bg-accent/50 transition-colors duration-200"
        >
          <ArrowLeft class="h-4 w-4" />
        </BaseButton>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-foreground">
            Tool Options
          </h3>
        </div>
      </div>
    </slot>

    <!-- Options grouped by section -->
    <div class="space-y-6 p-3">
      <template v-for="section in groupedOptions" :key="section.name">
        <div v-if="section.options.length > 0" class="space-y-4">
          <!-- Section Header -->
          <div class="flex items-center gap-2">
            <div class="h-px flex-1 bg-border"></div>
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              {{ section.name }}
            </h4>
            <div class="h-px flex-1 bg-border"></div>
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
                  <Switch
                    :id="option.id"
                    :model-value="option.value.value"
                    @update:model-value="updateOptionValue(option, $event)"
                    class="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <!-- Select Option -->
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
                <Select
                  :id="option.id"
                  :model-value="option.value.value"
                  :options="option.options || []"
                  @update:model-value="updateOptionValue(option, $event)"
                  class="w-full"
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
                  :model-value="option.value.value"
                  @update:model-value="updateOptionValue(option, $event)"
                  class="space-y-2"
                >
                  <div
                    v-for="radioOption in option.options"
                    :key="radioOption.value"
                    class="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/30 transition-colors duration-200"
                  >
                    <RadioGroupItem
                      :id="`${option.id}-${radioOption.value}`"
                      :value="radioOption.value"
                      class="w-4 h-4 rounded-full border-2 border-border text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
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
                    <span class="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded-md min-w-[3rem] text-center">
                      {{ option.value.value }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      {{ option.max }}
                    </span>
                  </div>
                </div>
                
                <div class="relative">
                  <input
                    :id="option.id"
                    :value="option.value.value"
                    @input="updateOptionValue(option, Number(($event.target as HTMLInputElement).value))"
                    type="range"
                    :min="option.min"
                    :max="option.max"
                    :step="option.step"
                    class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
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
                    :value="option.value.value"
                    @input="updateOptionValue(option, ($event.target as HTMLInputElement).value)"
                    type="color"
                    class="w-12 h-8 rounded-md border border-border cursor-pointer"
                  />
                  <span class="text-sm font-mono text-muted-foreground">
                    {{ option.value.value }}
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
                  :value="option.value.value"
                  @input="updateOptionValue(option, Number(($event.target as HTMLInputElement).value))"
                  type="number"
                  :min="option.min"
                  :max="option.max"
                  :step="option.step"
                  class="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="groupedOptions.length === 0" class="text-center py-8">
        <Settings class="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p class="text-sm text-muted-foreground">
          No options available for this tool
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Settings } from 'lucide-vue-next'
import type { ToolConfig } from '@/stores/toolSettings'
import BaseButton from '@/components/base/BaseButton.vue'
import Switch from '@/components/ui/ToggleBar.vue'
import Select from '@/components/ui/SelectBar.vue'
import { RadioGroupRoot, RadioGroupItem } from 'radix-vue'

interface Props {
  toolOptions: ToolConfig
}

defineEmits<{
  close: []
}>()

const props = defineProps<Props>()

// Update option value with proper reactivity
const updateOptionValue = (option: ToolOption, newValue: any) => {
  option.value.value = newValue
}

// Group options by section
const groupedOptions = computed(() => {
  const sections = new Map<string, typeof props.toolOptions.options>()
  
  props.toolOptions.options.forEach(option => {
    const sectionName = option.section || 'General'
    if (!sections.has(sectionName)) {
      sections.set(sectionName, [])
    }
    sections.get(sectionName)!.push(option)
  })
  
  return Array.from(sections.entries()).map(([name, options]) => ({
    name,
    options
  }))
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: hsl(var(--primary));
  cursor: pointer;
  border: 3px solid hsl(var(--background));
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: hsl(var(--primary));
  cursor: pointer;
  border: 3px solid hsl(var(--background));
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 0 0 3px hsl(var(--ring) / 0.2);
}

.slider:focus::-moz-range-thumb {
  box-shadow: 0 0 0 1px hsl(var(--border)), 0 0 0 3px hsl(var(--ring) / 0.2);
}

.slider::-webkit-slider-track {
  background: hsl(var(--muted));
  border-radius: 4px;
  height: 8px;
}

.slider::-moz-range-track {
  background: hsl(var(--muted));
  border-radius: 4px;
  height: 8px;
  border: none;
}

.slider::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    hsl(var(--primary)) 0%,
    hsl(var(--primary)) var(--progress, 50%),
    hsl(var(--muted)) var(--progress, 50%),
    hsl(var(--muted)) 100%
  );
  border-radius: 4px;
  height: 8px;
}

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

.radio-item[data-state="checked"]::before {
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

input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch {
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
}

input[type="color"]::-moz-color-swatch {
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
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
