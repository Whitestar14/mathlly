<template>
  <BasePage
    title="Diff Checker"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative bg-background">
    <div
      class="flex flex-col flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 gap-4">
      <!-- Header Settings / Progressive Disclosure -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-card p-2 md:p-4 rounded-lg border border-border">
        <div class="flex items-center gap-2 md:gap-4 flex-wrap">
          <SegmentedControl
            v-model="diffMode"
            :options="[
              { label: 'Line Diff', value: 'lines' },
              { label: 'Word Diff', value: 'words' },
            ]" />

          <SegmentedControl
            v-model="diffView"
            :options="[
              { label: 'Split View', value: 'split' },
              { label: 'Unified View', value: 'unified' },
            ]" />
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <BaseCheckbox v-model="ignoreWhitespace" label="Ignore Whitespace" />
          <BaseCheckbox v-model="caseInsensitive" label="Ignore Case" />
        </div>
      </div>

      <!-- Main Compare Areas -->
      <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        <!-- Left: Input Area -->
        <Suspense>
          <DiffInputPanel
            v-model:original="originalText"
            v-model:modified="modifiedText"
            class="flex-1 min-h-0 h-full lg:w-1/2"
            @sample="loadSample"
            @clear="clear"
            @swap="swap"
            @upload-original="handleOriginalFileUpload"
            @upload-modified="handleModifiedFileUpload" />
          <template #fallback>
            <div
              class="flex-1 min-h-0 border border-border rounded-lg bg-card animate-pulse"></div>
          </template>
        </Suspense>

        <!-- Right: Results Area -->
        <Suspense>
          <DiffOutputPanel
            class="flex-1 min-h-0 h-full lg:w-1/2"
            :diff-result="diffResult"
            :split-view-lines="splitViewLines"
            :diff-mode="diffMode"
            :diff-view="diffView" />
          <template #fallback>
            <div
              class="flex-1 min-h-0 border border-border rounded-lg bg-card animate-pulse"></div>
          </template>
        </Suspense>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { BasePage, BaseCheckbox } from '@components/ui'
import SegmentedControl from '@components/ui/SegmentedControl.vue'
import { useDiffTool } from '../composables/useDiffTool'
import { useKeyboardStore } from '@stores/keyboard'

const DiffInputPanel = defineAsyncComponent(
  () => import('../components/DiffInputPanel.vue')
)
const DiffOutputPanel = defineAsyncComponent(
  () => import('../components/DiffOutputPanel.vue')
)

const keyboard = useKeyboardStore()

const {
  originalText,
  modifiedText,
  diffMode,
  diffView,
  ignoreWhitespace,
  caseInsensitive,
  diffResult,
  splitViewLines,
  clear,
  swap,
  loadSample,
  handleOriginalFileUpload,
  handleModifiedFileUpload
} = useDiffTool()

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'Diff Checker' }]

onMounted(() => {
  keyboard.pushContext('tools.diff')
  keyboard.attachAllForContext('tools.diff', {
    'Ctrl+S': swap,
    'Ctrl+Delete': clear
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.diff')
})
</script>
