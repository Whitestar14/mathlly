<template>
  <div class="space-y-4">
    <BaseCard title="Palettes">
      <template #header>
        <div class="flex items-center gap-2">
          <input type="file" accept=".json" @change="importPalette" class="hidden" id="import-palette" />
          <BaseButton size="sm" variant="outline" @click="openImport()">
            <Upload class="h-4 w-4" />
          </BaseButton>
          <BaseButton size="sm" variant="outline" @click="setIsCreateDialogOpen(true)">
            <Plus class="h-4 w-4" />
          </BaseButton>
        </div>
      </template>

      <!-- Palette tabs -->
      <BaseTabs
        v-model="selectedPaletteId"
        :tabs="paletteTabs"
        @tab-change="(_, el) => el?.scrollIntoView({ inline: 'nearest' })"
      />

      <!-- Palette content -->
      <div v-for="palette in palettes" :key="palette.id" v-show="selectedPaletteId === palette.id" class="space-y-3 mt-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">{{ palette.colors.length }} colors</span>
          <div class="flex items-center gap-1">
            <BaseButton size="sm" variant="ghost" class="h-7 px-2" @click="addColorToPalette(palette.id)">
              <Plus class="h-3 w-3" />
            </BaseButton>
            <BaseButton size="sm" variant="ghost" class="h-7 px-2" @click="exportPalette(palette)">
              <Download class="h-3 w-3" />
            </BaseButton>
            <template v-if="palette.id !== 'default'">
              <BaseButton size="sm" variant="ghost" class="h-7 px-2" @click="startEditingPalette(palette)">
                <Edit3 class="h-3 w-3" />
              </BaseButton>
              <BaseButton size="sm" variant="ghost" class="h-7 px-2 text-destructive hover:text-destructive" @click="deletePalette(palette.id)">
                <Trash2 class="h-3 w-3" />
              </BaseButton>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <div v-for="(color, index) in palette.colors" :key="index" class="relative group">
            <div
              class="w-full h-12 rounded border cursor-pointer transition-transform hover:scale-105"
              :style="{ backgroundColor: rgbToHex(color) }"
              @click="onColorSelect(color)"
            />
            <BaseButton
              size="sm"
              variant="ghost"
              class="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 bg-background border shadow-sm"
              @click="removeColorFromPalette(palette.id, index)"
            >
              <X class="h-3 w-3" />
            </BaseButton>
          </div>

          <div v-if="palette.colors.length === 0" class="col-span-5 text-center py-8 text-muted-foreground">
            <Palette class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No colors in this palette</p>
            <BaseButton size="sm" variant="outline" class="mt-2" @click="addColorToPalette(palette.id)">
              Add current color
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Create palette modal -->
    <BaseModal :open="isCreateDialogOpen" @update:open="setIsCreateDialogOpen">
      <template #title>Create new palette</template>
      <div class="space-y-4">
        <div class="space-y-2">
          <BaseLabel for="palette-name">Palette name</BaseLabel>
          <BaseInput
            id="palette-name"
            :value="newPaletteName"
            @input="setNewPaletteName(($event.target as HTMLInputElement).value)"
            placeholder="Enter palette name"
            @keydown="(e) => e.key === 'Enter' && createNewPalette()"
          />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton variant="outline" @click="setIsCreateDialogOpen(false)">Cancel</BaseButton>
          <BaseButton @click="createNewPalette" :disabled="!newPaletteName.trim()">Create</BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Rename palette modal -->
    <BaseModal :open="!!editingPaletteId" @update:open="(o) => !o && setEditingPaletteId(null)">
      <template #title>Rename palette</template>
      <div class="space-y-4">
        <BaseInput
          :value="editingName"
          @input="setEditingName(($event.target as HTMLInputElement).value)"
          placeholder="New name"
          @keydown="(e) => { if (e.key === 'Enter') saveEditingPalette(); if (e.key === 'Escape') setEditingPaletteId(null); }"
          autofocus
        />
        <div class="flex justify-end gap-2">
          <BaseButton variant="outline" @click="setEditingPaletteId(null)">Cancel</BaseButton>
          <BaseButton @click="saveEditingPalette" :disabled="!editingName.trim()">Save</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseButton, BaseInput, BaseModal, BaseLabel } from '@components/ui'
import BaseTabs from '@components/ui/BaseTabs.vue'
import { Plus, Download, Upload, Trash2, Edit3, X, FolderOpen, Palette } from 'lucide-vue-next'
import { type RGB, rgbToHex, convertColor } from '@color/composables/useColor'
import { useToast } from '@composables/ui/useToast'

export interface ColorPalette { id: string; name: string; colors: RGB[]; createdAt: Date }
interface PaletteManagerProps { currentColor: RGB; onColorSelect: (color: RGB) => void }

const props = defineProps<PaletteManagerProps>()
const { toast } = useToast()

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

const paletteTabs = computed(() => palettes.value.map(p => ({ value: p.id, label: p.name })))

const setIsCreateDialogOpen = (v: boolean) => { isCreateDialogOpen.value = v }
const setNewPaletteName = (v: string) => { newPaletteName.value = v }
const setEditingPaletteId = (id: string | null) => { editingPaletteId.value = id }
const setEditingName = (v: string) => { editingName.value = v }

const openImport = () => document.getElementById('import-palette')?.click()

const selectedPalette = computed(() => palettes.value.find(p => p.id === selectedPaletteId.value))

const createNewPalette = () => {
  if (!newPaletteName.value.trim()) return
  const newPalette: ColorPalette = {
    id: Date.now().toString(),
    name: newPaletteName.value.trim(),
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
  editingPaletteId.value = palette.id
  editingName.value = palette.name
}
const saveEditingPalette = () => {
  const p = palettes.value.find(p => p.id === editingPaletteId.value)
  if (!p) return
  p.name = editingName.value.trim()
  editingPaletteId.value = null
  editingName.value = ''
  // update tabs
}

const deletePalette = (id: string) => {
  palettes.value = palettes.value.filter(p => p.id !== id)
  if (selectedPaletteId.value === id) selectedPaletteId.value = palettes.value[0]?.id ?? 'default'
}

const addColorToPalette = (id: string) => {
  const p = palettes.value.find(p => p.id === id)
  if (!p) return
  p.colors = [...p.colors, props.currentColor]
  toast({ title: 'Added!', description: 'Current color added to palette' })
}

const removeColorFromPalette = (id: string, index: number) => {
  const p = palettes.value.find(p => p.id === id)
  if (!p) return
  p.colors = p.colors.filter((_, i) => i !== index)
}

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
    palettes.value = [...palettes.value, { ...data, createdAt: new Date(data.createdAt ?? Date.now()) }]
    selectedPaletteId.value = data.id
    toast({ title: 'Imported!', description: `"${data.name}" has been imported` })
  } catch {
    toast({ title: 'Import failed', description: 'Please select a valid palette JSON' })
  } finally {
    (event.target as HTMLInputElement).value = ''
  }
}

const onColorSelect = (color: RGB) => props.onColorSelect(color)
</script>
