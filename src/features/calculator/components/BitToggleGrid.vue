<template>
  <div class="bit-toggle-grid mt-2 md:mt-5 text-md flex flex-col gap-3 w-full h-full">
    <div
      v-for="rowIndex in rowCount"
      :key="rowIndex"
      class="bit-row grid grid-cols-16 gap-1 w-full h-full"
    >
      <div
        v-for="colIndex in 16"
        :key="`cell-${rowIndex}-${colIndex}`"
        class="flex flex-col items-center"
      >
        <div class="h-3 flex items-end">
          <span
            v-if="shouldShowLabel(rowIndex, 16 - colIndex)"
            class="text-[10px] text-muted-foreground"
          >
            {{ getBitLabel(rowIndex, 16 - colIndex) }}
          </span>
        </div>
        <CalculatorButton
          :value="
            getDisplayBit(getBitPosition(rowIndex, 16 - colIndex)) ? '1' : '0'
          "
          :variant="
            getDisplayBit(getBitPosition(rowIndex, 16 - colIndex))
              ? 'operator'
              : 'number'
          "
          :disabled="!isActiveBit(getBitPosition(rowIndex, 16 - colIndex))"
          class="bit-btn font-mono"
          @click="onToggle(getBitPosition(rowIndex, 16 - colIndex))"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CalculatorButton from '@calculator/components/CalculatorButton.vue';
import {
  decimalToBits,
  type BitWidth,
} from '@calculator/utils/core/BitManipulation';

interface Props {
  value: number;
  bitWidth: BitWidth;
}
const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'bit-toggle', bitPosition: number): void }>();

// Always render 64 bits (4 rows × 16 cols)
const rowCount = computed(() => 64 / 16);

// Display from full 64-bit backing — no masking here
const fullBits = computed(() => decimalToBits(props.value, 64).bits);

// Absolute bit position (0-based, LSB = 0), with rowIndex starting at 1
const getBitPosition = (rowIndex: number, col: number) =>
  (rowCount.value - rowIndex) * 16 + col;

// Labels every 4 bits from 0 upward
const shouldShowLabel = (rowIndex: number, col: number) =>
  getBitPosition(rowIndex, col) % 4 === 0;
const getBitLabel = (rowIndex: number, col: number) =>
  String(getBitPosition(rowIndex, col));

// Disable outside active width
const isActiveBit = (pos: number) => pos < props.bitWidth;

// Display always reflects backing state
const getDisplayBit = (pos: number) => fullBits.value[pos];

// Strict toggle guard
const onToggle = (pos: number) => {
  if (!isActiveBit(pos)) return;
  emit('bit-toggle', pos);
};
</script>

<style scoped>
.bit-toggle-grid {
  @apply w-full;
}
.bit-row {
  @apply w-full;
}
.bit-btn {
  @apply min-w-0 flex min-h-0 px-2 py-0 text-sm md:size-6 md:px-3 md:py-6 md:text-base;
}
.bit-btn:disabled {
  opacity: 0.45;
  pointer-events: none;
  cursor: not-allowed;
}
.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
}
@media (max-width: 640px) {
  .bit-row {
    @apply grid grid-cols-8;
  }
}
</style>
