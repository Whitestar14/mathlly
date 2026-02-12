<template>
  <!-- 
    VARIANT: OVERLAY 
    Rendered as a full-screen fixed modal.
    Controlled by 'show' prop (usually from a composable).
  -->
  <Transition name="fade" v-if="variant === 'overlay'">
    <div
      v-show="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      @dragover.prevent
      @drop.prevent="onDrop">
      
      <!-- Reusing the Inner Content Layout -->
      <div class="w-full max-w-lg border-2 border-dashed border-primary/50 bg-card rounded-xl p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <ContentSlot :icon="icon" :title="title" :description="description" />
      </div>
    </div>
  </Transition>

  <!-- 
    VARIANT: ZONE (Default)
    Rendered as a static block on the page.
    Clickable to open file dialog.
  -->
  <div
    v-else
    class="group relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer"
    :class="[
      isDragOver 
        ? 'border-primary bg-primary/5 scale-[1.01]' 
        : 'border-border hover:border-primary/50 hover:bg-muted/50',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
    ]"
    @click="triggerInput"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop">
    
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      @change="onFileSelect" 
    />

    <div class="py-10 px-6">
      <ContentSlot :icon="icon" :title="title" :description="description">
        <template #cta>
          <span class="text-primary hover:underline">Click to upload</span> or drag and drop
        </template>
      </ContentSlot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Component, createVNode, defineComponent } from 'vue'
import { UploadCloud } from 'lucide-vue-next'

// --- Props ---
const props = withDefaults(defineProps<{
  variant?: 'overlay' | 'zone'
  show?: boolean           // Only used for 'overlay'
  accept?: string          // e.g. ".json, .txt"
  multiple?: boolean
  disabled?: boolean
  loading?: boolean
  title?: string
  description?: string
  icon?: Component
}>(), {
  variant: 'zone',
  show: false,
  title: 'Drop file here',
  description: 'Max file size: 10MB',
  icon: undefined
})

const emit = defineEmits<{
  (e: 'files', files: FileList): void
}>()

// --- Internal Logic ---
const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const triggerInput = () => {
  if (props.disabled || props.loading) return
  fileInput.value?.click()
}

const onFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) emit('files', target.files)
  target.value = ''
}

const onDragOver = () => {
  if (!props.disabled) isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (e: DragEvent) => {
  isDragOver.value = false
  if (props.disabled || props.loading) return
  const files = e.dataTransfer?.files
  if (files && files.length > 0) emit('files', files)
}

// --- Sub-Component for Shared Layout ---
// Defined inline to share standard styling between Overlay and Zone
const ContentSlot = defineComponent({
  props: ['icon', 'title', 'description'],
  setup(p, { slots }) {
    return () => createVNode('div', { class: 'flex flex-col items-center justify-center space-y-3 text-center pointer-events-none' }, [
      createVNode('div', { class: 'p-3 rounded-full bg-primary/10 text-primary' }, [
        createVNode(p.icon || UploadCloud, { class: 'h-8 w-8' })
      ]),
      createVNode('div', { class: 'space-y-1' }, [
        createVNode('h3', { class: 'text-lg font-semibold text-foreground' }, [
          p.title
        ]),
        p.description && createVNode('p', { class: 'text-sm text-muted-foreground' }, p.description),
        slots.cta && createVNode('p', { class: 'text-sm text-muted-foreground mt-2' }, slots.cta())
      ])    ])
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>