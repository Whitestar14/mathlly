<template>
  <div class="group relative">
    <ContextMenu
      :side-offset="5"
      align="start">
      <template #trigger>
        <div
          class="rounded-lg hover:bg-secondary/80 bg-secondary p-3 transition-colors cursor-pointer relative"
          :class="{ 'animate-highlight': selectedId === memorySlot.id }"
          @click="$emit('recall', memorySlot)">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <span class="text-xs font-medium text-primary">{{ memorySlot.slot }}</span>
              </div>
              <span class="text-sm font-medium text-foreground/90">
                {{ memorySlot.label }}
              </span>
            </div>

            <BaseButton
              v-if="memorySlot.id !== undefined"
              v-tippy="{ content: 'Delete slot' }"
              variant="ghost"
              size="icon"
              class="w-6 h-6 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              :class="buttonClasses"
              @click.stop="actionHandlers.delete">
              <TrashIcon class="h-3 w-3" />
            </BaseButton>
          </div>

          <div class="text-lg font-medium text-foreground break-all">
            {{ formatValue(memorySlot.value) }}
          </div>

          <div class="flex items-end justify-between mt-2">
            <div class="text-xs text-muted-foreground">
              {{ timeAgo }}
            </div>

            <div
              class="flex items-center gap-1"
              :class="isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'"
              @click.stop>
              <BaseButton
                v-for="action in availableActions"
                :key="action.key"
                v-tippy="{ content: action.tooltip }"
                variant="ghost"
                size="icon"
                :class="buttonClasses"
                @click="action.handler">
                <component
                  :is="action.icon"
                  class="h-3 w-3" />
              </BaseButton>
            </div>
          </div>
        </div>
      </template>

      <template
        v-for="item in contextMenuItems"
        :key="item.key">

        <ContextMenuSeparator
          v-if="item.type === 'separator'"
          class="h-px bg-muted my-1" />

        <ContextMenuItem
          v-else
          :class="item.class"
          @click="item.handler">
          <component
            :is="item.icon"
            class="mr-2 h-4 w-4" />
          <span>{{ item.label }}</span>
        </ContextMenuItem>
      </template>
    </ContextMenu>

    <BaseModal
      v-if="memorySlot.id !== undefined"
      id="edit-label-memory-modal"
      v-model:open="showEditLabel"
      description="edit-label-dialog">
      <template #title>
        <div class="flex items-center">
          <EditIcon class="h-5 w-5 text-primary mr-2" />
          Edit Memory Label
        </div>
      </template>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            Label for Memory Slot {{ memorySlot.slot }}
          </label>
          <input
            v-model="editLabelValue"
            type="text"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter label..."
            maxlength="50"
            @keydown.enter="handleSaveLabel" />
        </div>
        <div class="flex justify-end space-x-2">
          <BaseButton
            variant="outline"
            @click="showEditLabel = false">
            Cancel
          </BaseButton>
          <BaseButton @click="handleSaveLabel">
            Save Label
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Ref, type ComputedRef } from 'vue'
import {
  TrashIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  PlusIcon,
  MinusIcon
} from 'lucide-vue-next'
import {
  ContextMenuItem,
  ContextMenuSeparator
} from 'radix-vue'
import { BaseButton, BaseModal, ContextMenu } from '@components/ui'
import type { MemorySlot } from '@calculator/composables/useMemory'
import type { Calculator } from '@calculator/services/factory/CalculatorFactory'
import { useTimeAgo } from '@vueuse/core'

interface Props {
  memorySlot: MemorySlot;
  selectedId?: number | null;
}

interface Emits {
  (e: 'recall', slot: MemorySlot): void;
  (e: 'delete', id: number): void;
  (e: 'copy', slot: MemorySlot): void;
  (e: 'edit-label', id: number, label: string): void;
  (e: 'add-to-slot', slot: MemorySlot, value: number): void;
  (e: 'subtract-from-slot', slot: MemorySlot, value: number): void;
  (e: 'save-to-slot', slot: MemorySlot, value: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null
})

const emit = defineEmits<Emits>()

const calculator = inject<Ref<Calculator>>('calculator')!
const currentInput = inject<ComputedRef<string>>('currentInput')!
const isMobile = inject<ComputedRef<boolean>>('isMobile')!

const showEditLabel: Ref<boolean> = ref(false)
const editLabelValue: Ref<string> = ref(props.memorySlot.label || '')

const formatValue = (value: any): string => {
  if (typeof value === 'object' && value.toString) {
    return value.toString()
  }
  return String(value)
}

const timeAgo = useTimeAgo(props.memorySlot.timestamp)

const buttonClasses = computed(() =>
  isMobile.value ?
    'w-7 h-7 bg-background/80 hover:bg-background border border-border/50' :
    'w-6 h-6'
)

const getCurrentValue = (): number => {
  if (!calculator.value || !currentInput.value) {
    console.warn('Calculator or current input not available')
    return 0
  }

  try {
    const value = calculator.value.evaluateExpression(currentInput.value)
    return typeof value === 'number' ? value : parseFloat(String(value))
  } catch(error) {
    console.error('Error evaluating current input:', error)
    return 0
  }
}

const actionHandlers = {
  save: () => emit('save-to-slot', props.memorySlot, getCurrentValue()),
  edit: () => {
    editLabelValue.value = props.memorySlot.label || ''
    showEditLabel.value = true
  },
  add: () => emit('add-to-slot', props.memorySlot, getCurrentValue()),
  subtract: () => emit('subtract-from-slot', props.memorySlot, getCurrentValue()),
  delete: () => {
    if (props.memorySlot.id !== undefined) {
      emit('delete', props.memorySlot.id)
    }
  },
  recall: () => emit('recall', props.memorySlot),
  copy: () => emit('copy', props.memorySlot)
}

const availableActions = computed(() => [
  {
    key: 'save',
    icon: CheckIcon,
    tooltip: 'Save current value',
    handler: actionHandlers.save
  },
  ...(props.memorySlot.id !== undefined ? [{
    key: 'edit',
    icon: EditIcon,
    tooltip: 'Edit label',
    handler: actionHandlers.edit
  }] : []),
  {
    key: 'add',
    icon: PlusIcon,
    tooltip: 'Add current value',
    handler: actionHandlers.add
  },
  {
    key: 'subtract',
    icon: MinusIcon,
    tooltip: 'Subtract current value',
    handler: actionHandlers.subtract
  }
])

const contextMenuItems = computed(() => {
  const items = [

    {
      key: 'recall',
      type: 'item',
      icon: CheckIcon,
      label: 'Recall Value',
      class: 'context-menu-item',
      handler: actionHandlers.recall
    },
    {
      key: 'copy',
      type: 'item',
      icon: CopyIcon,
      label: 'Copy Value',
      class: 'context-menu-item',
      handler: actionHandlers.copy
    },

    ...(props.memorySlot.id !== undefined ? [{
      key: 'edit-context',
      type: 'item' as const,
      icon: EditIcon,
      label: 'Edit Label',
      class: 'context-menu-item',
      handler: actionHandlers.edit
    }] : []),

    {
      key: 'separator1',
      type: 'separator' as const
    },

    {
      key: 'add-context',
      type: 'item' as const,
      icon: PlusIcon,
      label: 'Add Value',
      class: 'context-menu-item',
      handler: actionHandlers.add
    },
    {
      key: 'subtract-context',
      type: 'item' as const,
      icon: MinusIcon,
      label: 'Subtract Value',
      class: 'context-menu-item',
      handler: actionHandlers.subtract
    },

    ...(props.memorySlot.id !== undefined ? [{
      key: 'separator2',
      type: 'separator' as const
    }] : []),

    ...(props.memorySlot.id !== undefined ? [{
      key: 'delete-context',
      type: 'item' as const,
      icon: TrashIcon,
      label: 'Delete Slot',
      class: 'context-menu-item-danger',
      handler: actionHandlers.delete
    }] : [])
  ]

  return items
})

const handleSaveLabel = (): void => {
  if (editLabelValue.value.trim() && props.memorySlot.id !== undefined) {
    emit('edit-label', props.memorySlot.id, editLabelValue.value.trim())
  }
  showEditLabel.value = false
}
</script>

<style>
.animate-highlight {
  animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    @apply bg-muted/30;
  }
  100% {
    @apply bg-muted;
  }
}
</style>
