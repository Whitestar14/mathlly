<template>
  <div class="space-y-4">
    <BaseCard title="Palettes">
      <template #head>
        <SegmentedControl
          v-model="selectedPaletteIdComputed"
          :options="paletteTabs"
          :max-visible="2"
        />
      </template>

      <template #header>
        <div class="flex items-center gap-2">
          <!-- Import -->
          <input
            id="import-palette"
            type="file"
            accept=".json"
            class="hidden"
            @change="importPalette"
          >
          <BaseButton
            size="icon"
            variant="outline"
            aria-label="Import palette"
            @click="openImport"
            v-tippy="{ content: 'Import palette from JSON' }"
          >
            <Upload class="h-4 w-4" />
          </BaseButton>

          <!-- Create -->
          <BaseButton
            size="icon"
            variant="outline"
            aria-label="Create palette"
            @click="setIsCreateDialogOpen(true)"
            v-tippy="{ content: 'Create new palette' }"
          >
            <Plus class="h-4 w-4" />
          </BaseButton>
        </div>
      </template>

      <!-- Active palette content -->
      <div
        v-for="palette in props.palettes"
        v-show="props.selectedPaletteId === palette.id"
        :key="palette.id"
        class="space-y-3 mt-2"
      >
        <!-- Header row: inline rename + compact actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <template v-if="editingPaletteId === palette.id">
              <input
                :ref="el => setEditingInputRef(el, palette.id)"
                v-model="editingName"
                class="flex-1 w-1/2 border-0 bg-transparent border-b border-primary text-sm font-medium focus:ring-0 focus:border-primary px-0 py-0"
                :maxlength="MAX_NAME_LENGTH"
                v-tippy="{ content: `${editingName.length}/${MAX_NAME_LENGTH}` }"
                @keydown.enter.prevent="saveEditingPalette"
                @keydown.esc="cancelEditing"
                @blur="saveEditingPalette"
              />
            </template>
            <template v-else>
              <button
                class="group flex flex-row gap-0.5 flex-1 justify-center items-center flex flex-row gap-1 text-sm font-medium truncate hover:border-px hover:border-b hover:border-dotted border-primary rounded-none px-1 -mx-1 transition-all duration-200"
                :disabled="palette.id === 'default'"
                :title="palette.name"
                @click="startEditingPalette(palette)"
              >
                <span>{{ palette.name }}</span>
                <Edit3 class="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </template>
            <span class="text-xs text-muted-foreground">• {{ palette.colors.length }} colors</span>
          </div>

          <div class="flex items-center gap-1">
            <BaseButton
              size="sm"
              variant="ghost"
              class="h-7 px-2"
              aria-label="Add current color"
              @click="addColorToPalette(palette.id)"
              v-tippy="{ content: 'Add current color to palette' }"
            >
              <Plus class="size-3" />
            </BaseButton>

            <BaseButton
              size="sm"
              variant="ghost"
              class="h-7 px-2"
              :disabled="palette.id === 'default'"
              aria-label="Rename palette"
              @click="startEditingPalette(palette)"
              v-tippy="{ content: palette.id === 'default' ? 'Default palette cannot be renamed' : 'Rename palette' }"
            >
              <Edit3 class="size-3" />
            </BaseButton>

            <!-- Overflow actions -->
            <BasePopover>
              <template #trigger>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  class="h-7 px-2"
                  aria-label="More"
                >
                  <MoreVertical class="size-3" />
                </BaseButton>
              </template>

              <!-- PopoverItem ensures popover closes on select -->
              <PopoverItem
                label="Export JSON"
                :icon="Download"
                @click="exportPalette(palette, 'json')"
              />
              <PopoverItem
                label="Export HEX"
                :icon="Download"
                @click="exportPalette(palette, 'hex')"
              />
              <PopoverItem
                label="Export CSS"
                :icon="Download"
                @click="exportPalette(palette, 'css')"
              />
              <PopoverItem
                label="Export SVG"
                :icon="Download"
                @click="exportPalette(palette, 'svg')"
              />

              <PopoverItem
                v-if="palette.id !== 'default'"
                label="Delete"
                :icon="Trash2"
                destructive
                @click="deletePalette(palette.id)"
              />
            </BasePopover>
          </div>
        </div>

        <!-- Colors grid -->
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="(color, index) in palette.colors"
            :key="swatchKey(palette.id, color, index)"
            class="relative"
          >
            <Swatch
              :color="color"
              @click="onColorSelect(color)"
            >
              <template #actions>
                <div class="absolute top-0 right-0 flex gap-1 p-1">
                  <BasePopover>
                    <template #trigger>
                      <BaseButton
                        size="xs"
                        variant="secondary"
                        class="h-4 w-4 p-0 text-muted-foreground"
                        aria-label="Swatch actions"
                        @click.stop
                      >
                        <MoreVertical class="size-3" />
                      </BaseButton>
                    </template>

                    <PopoverItem
                      label="Copy HEX"
                      :icon="Copy"
                      @click="copyHex(color)"
                    />
                    <PopoverItem
                      label="Remove"
                      :icon="Trash2"
                      destructive
                      @click="removeColorFromPalette(palette.id, index)"
                    />
                  </BasePopover>
                </div>
              </template>
            </Swatch>
          </div>

          <!-- Empty state -->
          <div
            v-if="palette.colors.length === 0"
            class="col-span-5 text-center py-8 text-muted-foreground"
          >
            <Palette class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">
              No colors in this palette
            </p>
            <BaseButton
              size="sm"
              variant="outline"
              class="mt-2"
              @click="addColorToPalette(palette.id)"
            >
              Add current color
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Create palette modal -->
    <BaseModal
      :open="isCreateDialogOpen"
      @update:open="setIsCreateDialogOpen"
    >
      <template #title>
        Create new palette
      </template>

      <div class="space-y-4">
        <div class="space-y-2">
          <BaseLabel for="palette-name">
            Palette name
          </BaseLabel>
          <BaseInput
            id="palette-name"
            ref="createInputRef"
            v-model="newPaletteName"
            :maxlength="MAX_NAME_LENGTH"
            placeholder="Enter palette name"
            @keydown.enter.prevent="handleCreateSubmit"
          />
          <p class="text-xs text-muted-foreground">
            {{ newPaletteName.length }}/{{ MAX_NAME_LENGTH }}
          </p>
        </div>

        <div class="flex justify-end gap-2">
          <BaseButton
            variant="outline"
            @click="setIsCreateDialogOpen(false)"
          >
            Cancel
          </BaseButton>
          <BaseButton
            :disabled="creating || !newPaletteName.trim()"
            @click="handleCreateSubmit"
          >
            Create
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { PopoverItem, BaseCard, BasePopover, BaseButton, BaseInput, BaseModal, BaseLabel } from '@components/ui'
import SegmentedControl from '@components/ui/SegmentedControl.vue'
import Swatch from './Swatch.vue'
import { Plus, Download, Upload, Trash2, Edit3, Palette, MoreVertical, Copy } from 'lucide-vue-next'
import { type RGB, rgbToHex } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'
import { useClipboard, useVModel } from '@vueuse/core'

// Service
import {
  nameExists,
  createPalette,
  updatePaletteName,
  deletePalette as removePalette,
  addColor as serviceAddColor,
  removeColor as serviceRemoveColor,
  serializePalette,
  importPaletteFromJSON,
  sanitizeColor,
  type PaletteEntity,
  type ExportFormat,
} from '@color/services/palette'

export interface PaletteManagerProps {
  currentColor: RGB
  onColorSelect: (color: RGB) => void
  palettes: PaletteEntity[]
  selectedPaletteId: string
}

const props = defineProps<PaletteManagerProps>()

const emit = defineEmits<{
  'update:selectedPaletteId': [value: string]
  'update:palettes': [value: PaletteEntity[]]
}>()

const { toast } = useToast()
const { copy } = useClipboard()

const MAX_NAME_LENGTH = 15

// State
const newPaletteName = ref('')
const isCreateDialogOpen = ref(false)
const creating = ref(false)
const editingPaletteId = ref<string | null>(null)
const editingName = ref('')
const editingInputRef = ref<HTMLInputElement | undefined>(undefined)
const createInputRef = ref<any>(null)


// Segmented control options
const paletteTabs = computed(() =>
  props.palettes.map((p) => ({ value: p.id, label: p.name.length <= MAX_NAME_LENGTH ? p.name : `${p.name.slice(0, MAX_NAME_LENGTH - 1)}…` }))
)

// Computed for v-model: RESTORING useVModel
const selectedPaletteIdComputed = useVModel(props, 'selectedPaletteId', emit)

// Helpers
const setIsCreateDialogOpen = (v: boolean) => {
  isCreateDialogOpen.value = v
  if (v) {
    focusCreateInput()
  }
  if (!v) {
    newPaletteName.value = ''
    creating.value = false
  }
}

const focusCreateInput = async () => {
  await nextTick();
  (createInputRef.value as any)?.focus()
}

const openImport = () => document.getElementById('import-palette')?.click()

function swatchKey(pid: string, c: RGB, i: number) {
  return `${pid}-${c.r}-${c.g}-${c.b}-${i}`
}

// Create (single entry point for Enter + button)
const handleCreateSubmit = async () => {
  if (creating.value) return

  creating.value = true
  const name = newPaletteName.value.trim()
  if (!name) return
  if (name.length > MAX_NAME_LENGTH) {
    toast({ title: 'Name too long', description: `Max ${MAX_NAME_LENGTH} characters` })
    return
  }
  if (await nameExists(name)) {
    toast({ title: 'Name in use', description: 'Try a different palette name' })
    return
  }

  try {
    const palette = await createPalette(name, sanitizeColor(props.currentColor))
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    newPalettes.push(palette)
    emit('update:palettes', newPalettes)
    emit('update:selectedPaletteId', palette.id)
    newPaletteName.value = ''
    isCreateDialogOpen.value = false
    toast({ title: 'Palette created!', description: `"${palette.name}" has been created` })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message || 'Failed to create palette' })
  } finally {
    setTimeout(() => { creating.value = false }, 150)
  }
}

// Rename
const startEditingPalette = (palette: PaletteEntity) => {
  if (palette.id === 'default') return
  editingPaletteId.value = palette.id
  editingName.value = palette.name
  nextTick(() => {
    editingInputRef.value?.focus()
    editingInputRef.value?.select()
  })
}

const saveEditingPalette = async () => {
  const id = editingPaletteId.value
  if (!id) return

  const name = editingName.value.trim()
  const current = props.palettes.find(p => p.id === id)
  if (!current) {
    cancelEditing()
    return
  }
  if (!name || name === current.name) {
    cancelEditing()
    return
  }
  if (name.length > MAX_NAME_LENGTH) {
    toast({ title: 'Name too long', description: `Max ${MAX_NAME_LENGTH} characters` })
    return
  }
  if (await nameExists(name, id)) {
    toast({ title: 'Name in use', description: 'Try a different palette name' })
    return
  }

  try {
    await updatePaletteName(id, name)
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    const idx = newPalettes.findIndex(p => p.id === id)
    if (idx !== -1) {
      newPalettes[idx].name = name
    }
    emit('update:palettes', newPalettes)
    cancelEditing()
    toast({ title: 'Renamed', description: `Palette is now "${name}"` })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message || 'Failed to rename palette' })
  }
}

const cancelEditing = () => {
  editingPaletteId.value = null
  editingName.value = ''
}

// Delete: jump to nearest neighbor instead of default
const deletePalette = async (id: string) => {
  try {
    const idx = props.palettes.findIndex(p => p.id === id)

    await removePalette(id)
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    const delIdx = newPalettes.findIndex(p => p.id === id)
    if (delIdx !== -1) {
      newPalettes.splice(delIdx, 1)
    }
    emit('update:palettes', newPalettes)

    if (props.selectedPaletteId === id) {
      const neighbor = props.palettes[idx - 1] || props.palettes[idx] || props.palettes[0]
      emit('update:selectedPaletteId', neighbor?.id ?? 'default')
    }

    toast({ title: 'Deleted', description: 'Palette removed' })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message || 'Failed to delete palette' })
  }
}

// Add/remove colors
const addColorToPalette = async (id: string) => {
  try {
    const next = await serviceAddColor(id, sanitizeColor(props.currentColor))
    if (!next) return
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    const idx = newPalettes.findIndex(x => x.id === id)
    if (idx !== -1) {
      newPalettes[idx] = next
    }
    emit('update:palettes', newPalettes)
    toast({ title: 'Added!', description: 'Current color added to palette' })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message || 'Failed to add color' })
  }
}

const removeColorFromPalette = async (id: string, index: number) => {
  try {
    const next = await serviceRemoveColor(id, index)
    if (!next) return
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    const idx = newPalettes.findIndex(x => x.id === id)
    if (idx !== -1) {
      newPalettes[idx] = next
    }
    emit('update:palettes', newPalettes)
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message || 'Failed to remove color' })
  }
}

// Export / import
const exportPalette = (palette: PaletteEntity, format: ExportFormat) => {
  const { blob, filename } = serializePalette(palette, format)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const importPalette = async (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const imported = await importPaletteFromJSON(text, MAX_NAME_LENGTH)
    // FIX: Use JSON.parse(JSON.stringify) for reliable deep copy of reactive array
    const newPalettes = JSON.parse(JSON.stringify(props.palettes))
    newPalettes.push(imported)
    emit('update:palettes', newPalettes)
    emit('update:selectedPaletteId', imported.id)
    toast({ title: 'Imported!', description: `"${imported.name}" has been imported` })
  } catch (err: any) {
    toast({
      title: 'Import failed',
      description: err?.message || 'Please select a valid palette JSON',
    })
  } finally {
    (event.target as HTMLInputElement).value = ''
  }
}

// Copy HEX
const copyHex = async (color: RGB) => {
  const hex = rgbToHex(sanitizeColor(color))
  await copy(hex)
  toast({ title: 'Copied!', description: `${hex} copied to clipboard` })
}

const onColorSelect = (color: RGB) => props.onColorSelect(sanitizeColor(color))

const setEditingInputRef = (el: any, paletteId: string) => {
  if (editingPaletteId.value === paletteId) editingInputRef.value = el as HTMLInputElement
}
</script>
