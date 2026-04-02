<template>
  <BasePage
    title="Regex Tester"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative bg-background">
    <div
      class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 grid grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-2 gap-4">
      <!-- Left / Top: Input Panel -->
      <Suspense>
        <RegexInputPanel
          v-model:pattern="pattern"
          v-model:flags="flags"
          v-model:test-string="testString"
          :available-flags="availableFlags"
          :error="error"
          :matches="matches"
          @clear="clear"
          @sample="loadSample" />
        <template #fallback>
          <div
            class="flex-1 min-h-[300px] lg:min-h-0 border border-border rounded-lg bg-card animate-pulse"></div>
        </template>
      </Suspense>

      <!-- Right / Bottom: Matches Panel -->
      <Suspense>
        <RegexMatchesPanel
          :matches="matches"
          :test-string="testString"
          class="flex-1 min-h-[300px] lg:min-h-0"
          @jump-to-index="handleJumpToIndex" />
        <template #fallback>
          <div
            class="flex-1 min-h-[300px] lg:min-h-0 border border-border rounded-lg bg-card animate-pulse"></div>
        </template>
      </Suspense>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useKeyboardStore } from '@stores/keyboard'
import { BasePage } from '@components/ui'
import { useRegexTool } from '../composables/useRegexTool'

const RegexInputPanel = defineAsyncComponent(
  () => import('../components/RegexInputPanel.vue')
)
const RegexMatchesPanel = defineAsyncComponent(
  () => import('../components/RegexMatchesPanel.vue')
)

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'Regex Tester' }]

const keyboard = useKeyboardStore()

const {
  pattern,
  flags,
  testString,
  availableFlags,
  error,
  matches,
  evaluate,
  clear,
  loadSample
} = useRegexTool()

const handleJumpToIndex = (index: number) => {
  // Try to find the BaseEditor text input (usually a textarea or contenteditable) in the RegexInputPanel
  const editorInput = document.querySelector(
    '.regex-test-string-editor textarea'
  ) as HTMLTextAreaElement
  if (editorInput) {
    editorInput.focus()
    editorInput.setSelectionRange(index, index)
    // Scroll cursor into view roughly
    editorInput.blur()
    editorInput.focus()
  }
}

onMounted(() => {
  keyboard.pushContext('tools.regex')
  keyboard.attachAllForContext('tools.regex', {
    'Ctrl+Enter': evaluate,
    'Ctrl+Delete': clear
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.regex')
})
</script>
