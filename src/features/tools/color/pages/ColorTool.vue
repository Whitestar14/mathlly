<template>
  <div class="space-y-4">
    <h1 class="text-lg font-semibold">Color Converter</h1>

    <div class="flex gap-4 items-start">
      <div class="w-72">
        <label class="block text-sm font-medium mb-1">Hex</label>
        <input v-model="hexInput" class="w-full input" placeholder="#RRGGBB or #RGB" />
      </div>

      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">Output</label>
        <div class="p-3 border rounded bg-card">
          <div class="mb-2"><strong>Hex:</strong> {{ result.hex ?? '-' }}</div>
          <div class="mb-2"><strong>RGB:</strong> {{ result.rgb ? `${Math.round(result.rgb.r)}, ${Math.round(result.rgb.g)}, ${Math.round(result.rgb.b)}` : '-' }}</div>
          <div class="mb-2"><strong>CMYK:</strong> {{ result.cmyk ? `${(result.cmyk.c*100).toFixed(1)}%, ${(result.cmyk.m*100).toFixed(1)}%, ${(result.cmyk.y*100).toFixed(1)}%, ${(result.cmyk.k*100).toFixed(1)}%` : '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useColorConversions } from '../composables/useColorConversions';

const hexInput = ref('#3498db');
const result = ref({} as any);

const { parseHex } = useColorConversions();

watch(hexInput, (v) => {
  result.value = parseHex(v);
}, { immediate: true });
</script>
