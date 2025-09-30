<template>
  <div class="space-y-4">
    <BaseCard title="Palettes">
      <template #header>
        <div class="flex items-center gap-2">
          <!-- Import -->
          <input
            type="file"
            accept=".json"
            @change="importPalette"
            class="hidden"
            id="import-palette"
          />
          <BaseButton size="sm" variant="outline" @click="openImport" aria-label="Import palette">
            <Upload class="h-4 w-4" />
          </BaseButton>

          <!-- Create (modal) -->
          <BaseButton size="sm" variant="outline" @click="setIsCreateDialogOpen(true)" aria-label="Create palette">
            <Plus class="h-4 w-4" />
          </BaseButton>
        </div>
      </template>

      <!-- Tabs -->
      <BaseTabs
        v-model="selectedPaletteId"
        :tabs="paletteTabs"
        @tab-change="(_, el) => el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })"
      />

      <!-- Active palette content -->
      <div
        v-for="palette in palettes"
        :key="palette.id"
        v-show="selectedPaletteId === palette.id"
        class="space-y-3 mt-4"
      >
        <!-- Header row: inline rename + compact actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <template v-if="editingPaletteId === palette.id">
              <BaseInput
                v-model="editingName"
                class="h-8"
                placeholder="New name"
                @keydown.enter="saveEditingPalette"
                @keydown.esc="cancelEditing"
                @blur="saveEditingPalette"
                autofocus
              />
            </template>
            <template v-else>
              <button
                class="text-sm font-medium truncate hover:underline underline-offset-2"
                :disabled="palette.id === 'default'"
                :title="palette.name"
                @click="startEditingPalette(palette)"
              >
                {{ palette.name }}
              </button>
            </template>
            <span class="text-xs text-muted-foreground">• {{ palette.colors.length }} colors</span>
          </div>

          <div class="flex items-center gap-1">
            <BaseButton
              size="sm"
              variant="ghost"
              class="h-7 px-2"
              @click="addColorToPalette(palette.id)"
              aria-label="Add current color"
            >
              <Plus class="h-3 w-3" />
            </BaseButton>

            <BaseButton
              size="sm"
              variant="ghost"
              class="h-7 px-2"
              :disabled="palette.id === 'default'"
              @click="startEditingPalette(palette)"
              aria-label="Rename palette"
            >
              <Edit3 class="h-3 w-3" />
            </BaseButton>

            <!-- Overflow actions via Popover (uncontrolled by default) -->
            <BasePopover>
              <template #trigger>
                <BaseButton size="sm" variant="ghost" class="h-7 px-2" aria-label="More">
                  <MoreVertical class="h-3 w-3" />
                </BaseButton>
              </template>
              <PopoverItem label="Export" :icon="Download" @click="exportPalette(palette)" />
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
            :key="index"
            class="relative"
          >
            <Swatch :color="color" @click="onColorSelect(color)" />

            <!-- Per-swatch actions via Popover trigger -->
            <div class="absolute top-0 right-0 flex gap-1 p-1">
              <BasePopover>
                <template #trigger>
                  <BaseButton
                    size="xs"
                    variant="ghost"
                    class="h-4 w-4 p-0 text-muted-foreground"
                    aria-label="Swatch actions"
                    @click.stop
                  >
                    <MoreVertical class="h-3 w-3" />
                  </BaseButton>
                </template>
                <PopoverItem label="Copy HEX" :icon="Copy" @click="copyHex(color)" />
                <PopoverItem label="Remove" :icon="Trash2" destructive @click="removeColorFromPalette(palette.id, index)" />
              </BasePopover>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="palette.colors.length === 0"
            class="col-span-5 text-center py-8 text-muted-foreground"
          >
            <Palette class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No colors in this palette</p>
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

    <!-- Create palette modal (kept) -->
    <BaseModal :open="isCreateDialogOpen" @update:open="setIsCreateDialogOpen">
      <template #title>Create new palette</template>
      <div class="space-y-4">
        <div class="space-y-2">
          <BaseLabel for="palette-name">Palette name</BaseLabel>
          <BaseInput
            id="palette-name"
            v-model="newPaletteName"
            placeholder="Enter palette name"
            @keydown.enter="createNewPalette"
            autofocus
          />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton variant="outline" @click="setIsCreateDialogOpen(false)">Cancel</BaseButton>
          <BaseButton @click="createNewPalette" :disabled="!newPaletteName.trim()">Create</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseTabs, BasePopover, BaseButton, BaseInput, BaseModal, BaseLabel } from '@components/ui'
import PopoverItem from '@components/ui/PopoverItem.vue'
import Swatch from './Swatch.vue'
import { Plus, Download, Upload, Trash2, Edit3, Palette, MoreVertical, Copy } from 'lucide-vue-next'
import { type RGB, rgbToHex } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'
import { useClipboard } from '@vueuse/core'

export interface ColorPalette {
  id: string
  name: string
  colors: RGB[]
  createdAt: Date
}

interface PaletteManagerProps {
  currentColor: RGB
  onColorSelect: (color: RGB) => void
}

const props = defineProps<PaletteManagerProps>()
const { toast } = useToast()
const { copy } = useClipboard();

const palettes = ref<ColorPalette[]>([
  {
    id: 'default',
    name: 'Default palette',
    colors: [
      { r: 239, g: 68, b: 68 },
      { r: 245, g: 158, b: 11 },
      { r: 34, g: 197, b: 94 },
      { r: 59, g: 130, b: 246 },
      { r: 147, g: 51, b: 234 },
    ],
    createdAt: new Date(),
  },
])

const selectedPaletteId = ref('default')
const newPaletteName = ref('')
const isCreateDialogOpen = ref(false)

const editingPaletteId = ref<string | null>(null)
const editingName = ref('')

const paletteTabs = computed(() =>
  palettes.value.map((p) => ({ value: p.id, label: p.name }))
)

const setIsCreateDialogOpen = (v: boolean) => {
  isCreateDialogOpen.value = v
}

const openImport = () => document.getElementById('import-palette')?.click()

const createNewPalette = () => {
  const name = newPaletteName.value.trim()
  if (!name) return
  const newPalette: ColorPalette = {
    id: Date.now().toString(),
    name,
    colors: [props.currentColor],
    createdAt: new Date(),
  }
  palettes.value = [...palettes.value, newPalette]
  selectedPaletteId.value = newPalette.id
  newPaletteName.value = ''
  isCreateDialogOpen.value = false
  toast({ title: 'Palette created!', description: `"${newPalette.name}" has been created` })
}

const startEditingPalette = (palette: ColorPalette) => {
  if (palette.id === 'default') return
  editingPaletteId.value = palette.id
  editingName.value = palette.name
}

const saveEditingPalette = () => {
  const p = palettes.value.find((p) => p.id === editingPaletteId.value)
  if (!p) return
  const name = editingName.value.trim()
  if (!name || name === p.name) {
    cancelEditing()
    return
  }
  // Basic uniqueness check
  if (palettes.value.some((x) => x.id !== p.id && x.name.toLowerCase() === name.toLowerCase())) {
    toast({ title: 'Name in use', description: 'Try a different palette name' })
    return
  }
  p.name = name
  cancelEditing()
  toast({ title: 'Renamed', description: `Palette is now "${name}"` })
}

const cancelEditing = () => {
  editingPaletteId.value = null
  editingName.value = ''
}

// Delete palette
const deletePalette = (id: string) => {
  palettes.value = palettes.value.filter((p) => p.id !== id)
  if (selectedPaletteId.value === id) {
    selectedPaletteId.value = palettes.value[0]?.id ?? 'default'
  }
}

// Add/remove colors
const addColorToPalette = (id: string) => {
  const p = palettes.value.find((p) => p.id === id)
  if (!p) return
  p.colors = [...p.colors, props.currentColor]
  toast({ title: 'Added!', description: 'Current color added to palette' })
}

const removeColorFromPalette = (id: string, index: number) => {
  const p = palettes.value.find((p) => p.id === id)
  if (!p) return
  p.colors = p.colors.filter((_, i) => i !== index)
}

// Export/import
const exportPalette = (palette: ColorPalette) => {
  const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${palette.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importPalette = async (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text) as ColorPalette
    if (!data?.id || !data?.name || !Array.isArray(data?.colors)) throw new Error('Invalid palette')
    palettes.value = [
      ...palettes.value,
      { ...data, createdAt: new Date((data as any).createdAt ?? Date.now()) },
    ]
    selectedPaletteId.value = data.id
    toast({ title: 'Imported!', description: `"${data.name}" has been imported` })
  } catch {
    toast({ title: 'Import failed', description: 'Please select a valid palette JSON' })
  } finally {
    (event.target as HTMLInputElement).value = ''
  }
}

// Copy HEX
const copyHex = async (color: RGB) => {
  const hex = rgbToHex(color)
  await copy(hex)
  toast({ title: 'Copied!', description: `${hex} copied to clipboard` })
}

const onColorSelect = (color: RGB) => props.onColorSelect(color)
</script>
