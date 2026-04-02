<template>
  <div class="flex flex-col border border-border rounded-lg bg-card overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] flex-shrink-0">
      <span class="text-sm font-medium px-2">Diff Output: {{ diffMode === 'lines' ? 'Line Diff' : 'Word Diff' }} ({{ diffView === 'split' ? 'Split View' : 'Unified View' }})</span>
      <div class="flex items-center gap-4 text-sm px-2">
        <span class="flex items-center gap-1 text-green-600 dark:text-green-400"><PlusIcon class="w-3 h-3" /> Added</span>
        <span class="flex items-center gap-1 text-red-600 dark:text-red-400"><MinusIcon class="w-3 h-3" /> Removed</span>
      </div>
    </div>

    <!-- Output Area -->
    <div class="flex-1 min-h-0 overflow-auto bg-background font-mono text-sm leading-6">

      <!-- Word Diff or Unified Line Diff -->
      <div v-if="diffMode === 'words' || diffView === 'unified'" class="p-4 whitespace-pre-wrap break-all">
        <template v-for="part in diffResult" :key="part.value">
          <span
            :class="{
              'bg-green-500/20 text-green-700 dark:text-green-400': part.added,
              'bg-red-500/20 text-red-700 dark:text-red-400 line-through': part.removed
            }">{{ part.value }}</span>
        </template>
      </div>

      <!-- Split Line Diff -->
      <div v-else-if="diffMode === 'lines' && diffView === 'split'" class="flex flex-col lg:flex-row w-full min-w-max">

        <!-- Left Side (Original) -->
        <div class="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col overflow-x-auto">
          <div v-if="splitViewLines.length === 0" class="flex items-center justify-center p-8 text-muted-foreground/50 italic h-full">No edits detected.</div>
          <div
            v-for="(line, index) in splitViewLines"
            v-else
            :key="'orig-'+index"
            class="flex pr-2 w-max min-w-full"
            :class="{
              'bg-red-500/10': line.type === 'removed',
              'bg-muted/30': line.type === 'added'
            }">
            <div class="w-10 flex-shrink-0 bg-muted/10 border-r border-border text-right py-0 pr-2 text-muted-foreground/50 select-none">
              {{ line.originalLineNumber || '&nbsp;' }}
            </div>
            <div class="flex-1 pl-4 whitespace-pre font-mono" :class="{'text-red-700 dark:text-red-400': line.type === 'removed', 'text-transparent': line.type === 'added'}">
              {{ line.type === 'added' ? ' ' : line.value }}
            </div>
          </div>
        </div>

        <!-- Right Side (Modified) -->
        <div class="w-full lg:w-1/2 flex flex-col overflow-x-auto">
          <div v-if="splitViewLines.length === 0" class="flex items-center justify-center p-8 text-muted-foreground/50 italic h-full">No edits detected.</div>
          <div
            v-for="(line, index) in splitViewLines"
            v-else
            :key="'mod-'+index"
            class="flex pr-2 w-max min-w-full"
            :class="{
              'bg-green-500/10': line.type === 'added',
              'bg-muted/30': line.type === 'removed'
            }">
            <div class="w-10 flex-shrink-0 bg-muted/10 border-r border-border text-right py-0 pr-2 text-muted-foreground/50 select-none">
              {{ line.modifiedLineNumber || '&nbsp;' }}
            </div>
            <div class="flex-1 pl-4 whitespace-pre font-mono" :class="{'text-green-700 dark:text-green-400': line.type === 'added', 'text-transparent': line.type === 'removed'}">
              {{ line.type === 'removed' ? ' ' : line.value }}
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from 'lucide-vue-next'
import type { Change } from 'diff'

interface Props {
  diffResult: Change[]
  splitViewLines: Array<{
    type: 'added' | 'removed' | 'unchanged'
    originalLineNumber: number | null
    modifiedLineNumber: number | null
    value: string
  }>
  diffMode: 'lines' | 'words'
  diffView: 'split' | 'unified'
}

defineProps<Props>()
</script>
