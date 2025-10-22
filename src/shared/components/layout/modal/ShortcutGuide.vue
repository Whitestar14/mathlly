<template>
  <BaseModal :open="show" @update:open="handleModalUpdate">
    <template #title>
      <div class="flex items-center">
        <div>
          <h2 class="text-xl font-medium text-foreground">Keyboard Shortcuts</h2>
          <p class="text-sm text-muted-foreground mt-1">Quick access to available shortcuts</p>
        </div>
      </div>
    </template>

    <div class="mt-2">
      <BaseTabs ref="tabsRef" v-model:model-value="currentTab" :tabs="tabs" />
      <div class="relative overflow-hidden h-[260px] overflow-y-auto">
        <TransitionGroup
          enter-active-class="transition-transform duration-200 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
        >
          <div
            v-for="(subgroups, top) in grouped"
            v-show="currentTab === top"
            :key="top"
            class="p-4 space-y-4"
          >
            <div v-for="(items, subgroup) in subgroups" :key="subgroup">
              <div class="text-xs font-medium text-muted-foreground mb-2">
                {{ subgroupLabel(top, subgroup) }}
              </div>
              <div
                v-for="item in items"
                :key="item.id"
                :class="[
                  'flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                  item.enabled ? 'hover:bg-muted/50' : 'opacity-60'
                ]"
              >
                <span class="text-sm text-foreground">
                  {{ item.description }}
                  <span v-if="!item.enabled" class="ml-2 text-xs text-muted-foreground">
                    (available when {{ item.context }} is active)
                  </span>
                </span>
                <div class="flex items-center gap-1.5">
                  <template v-if="item.key.includes('+')">
                    <div v-for="(part, idx) in item.key.split('+')" :key="idx" class="inline-flex items-center">
                      <kbd class="px-2 py-1 text-xs font-medium bg-background text-primary rounded-md border border-border shadow-sm">{{ part }}</kbd>
                      <span v-if="idx < item.key.split('+').length - 1" class="text-muted-foreground">+</span>
                    </div>
                  </template>
                  <kbd v-else class="px-2 py-1 text-xs font-medium bg-background text-primary rounded-md border border-border shadow-sm">{{ item.key }}</kbd>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div v-if="collisions.length" class="p-4 border-t border-border mt-2">
        <div class="text-xs font-medium text-destructive mb-2">Conflicts detected</div>
        <div class="space-y-2">
          <div v-for="c in collisions" :key="c.key + c.context" class="rounded-lg bg-muted p-3">
            <div class="text-xs text-muted-foreground mb-1">
              {{ c.context }} — {{ c.key }}
            </div>
            <ul class="space-y-1">
              <li v-for="b in c.bindings" :key="b.id" class="flex items-center justify-between">
                <span class="text-sm">{{ b.description }}</span>
                <span class="text-xs text-muted-foreground">priority {{ b.priority ?? 0 }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { BaseModal, BaseTabs } from '@components/ui'
import { useKeyboardStore } from '@stores/keyboard'

interface Props { show: boolean }
interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}
defineProps<Props>()
const emit = defineEmits<Emits>()

const tabsRef = ref<InstanceType<typeof BaseTabs> | null>(null)
const keyboard = useKeyboardStore()
const summary = computed(() => keyboard.guideSummary)
const collisions = computed(() => keyboard.collisions)

const grouped = computed(() => {
  const tree = new Map<string, Map<string, typeof summary.value>>()
  for (const item of summary.value) {
    const parts = item.context.split('.')
    const top = parts[0] || 'global'
    const subgroup = parts.length > 1 ? parts.join('.') : top
    const sub = tree.get(top) ?? new Map<string, any[]>()
    const arr = sub.get(subgroup) ?? []
    arr.push(item)
    sub.set(subgroup, arr)
    tree.set(top, sub)
  }
  const obj: Record<string, Record<string, any[]>> = {}
  for (const [top, sub] of tree.entries()) {
    const sortedSub: Record<string, any[]> = {}
    for (const [sg, items] of Array.from(sub.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
      sortedSub[sg] = items.sort((a, b) => a.key.localeCompare(b.key))
    }
    obj[topLabel(top)] = sortedSub
  }
  return obj
})

function topLabel(top: string) {
  switch (top) {
    case 'global': return 'Global'
    case 'calculator': return 'Calculator'
    case 'tools': return 'Tools'
    default: return top[0].toUpperCase() + top.slice(1)
  }
}

function subgroupLabel(top: string, subgroup: string) {
  const parts = subgroup.split('.')
  if (parts.length <= 1) return topLabel(top)
  return parts.slice(1).join(' › ')
}

const tabs = computed(() => Object.keys(grouped.value).map(k => ({ value: k, label: k })))
const currentTab = ref('Global')

function handleModalUpdate(isOpen: boolean) {
  emit('update:show', isOpen)
  if (!isOpen) emit('close')
}

nextTick(() => {
  tabsRef.value?.initializePills?.(currentTab.value)
})
</script>
