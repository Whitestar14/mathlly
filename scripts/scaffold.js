import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = query => new Promise(resolve => rl.question(query, resolve))

// --- String Utilities ---
const toKebabCase = str => str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
const toPascalCase = str => str.replace(/(^\w|-\w)/g, m => m.replace('-', '').toUpperCase())
const toCamelCase = str => {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// --- Templates ---

const composableTemplate = name => `import { ref } from 'vue'
import { useToast } from '@composables/ui/useToast'

export function use${name}() {
  const input = ref('')
  const { toast } = useToast()

  const process = () => {
    toast({ title: 'Processing', description: 'Operation started...' })
    // Add logic here
  }

  const clear = () => {
    input.value = ''
  }

  return {
    input,
    process,
    clear
  }
}
`

const pageTemplate = (name, kebabName, type, title) => `
<template>
  <BasePage
    title="${title}"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex p-2 md:p-4 overflow-hidden h-full flex-col">
    
    <div class="max-w-4xl mx-auto w-full space-y-4">
      <BaseCard>
        <template #header>
            <!-- Header Actions -->
        </template>
        
        <div class="space-y-4">
           <p class="text-sm text-muted-foreground">Tool description goes here.</p>
           
           <div class="grid gap-2">
             <label class="text-sm font-medium">Input</label>
             <textarea 
                v-model="input"
                class="w-full min-h-[200px] p-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-ring"
                placeholder="Enter content..."
             ></textarea>
           </div>
           
           <div class="flex justify-end gap-2">
              <BaseButton variant="outline" @click="clear">Clear</BaseButton>
              <BaseButton @click="process">Run Action</BaseButton>
           </div>
        </div>
      </BaseCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { BasePage, BaseCard, BaseButton } from '@components/ui'
import { use${name} } from '../composables/use${name}'
import { useKeyboardStore } from '@stores/keyboard'
import { ${toCamelCase(name)}Manifest } from '../lib/shortcuts'

const { input, process, clear } = use${name}()
const keyboard = useKeyboardStore()

const breadcrumbs = [
  { label: '${type === 'tool' ? 'Tools' : 'Features'}', path: '/' }, 
  { label: '${title}' }
]

onMounted(() => {
    keyboard.register(${toCamelCase(name)}Manifest[0])
    keyboard.pushContext('${type === 'tool' ? 'tools' : 'features'}.${kebabName}')
    
    keyboard.attachAllForContext('${type === 'tool' ? 'tools' : 'features'}.${kebabName}', {
        'Ctrl+Enter': process,
        'Escape': clear
    })
})

onUnmounted(() => {
    keyboard.popContext('${type === 'tool' ? 'tools' : 'features'}.${kebabName}')
})
</script>
`

const shortcutsTemplate = contextId => `import type { KeyBinding } from '@stores/keyboard'

export const ${toCamelCase(contextId)}Manifest: KeyBinding[] = [
  { 
    key: 'Ctrl+Enter', 
    description: 'Run Action', 
    context: '${contextId}', 
    enabled: false, 
    priority: 10 
  },
  { 
    key: 'Escape', 
    description: 'Clear Input', 
    context: '${contextId}', 
    enabled: false, 
    priority: 5 
  }
]
`

const indexTypeTemplate = () => `// Export types here
export interface ToolOptions {
  // options
}
`

const componentTemplate = name => `<template>
  <div class="p-4 border border-border rounded-lg">
    <h3 class="font-medium mb-2">${name} Component</h3>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>
`

// --- Main Execution ---

async function main() {
  console.log('\x1b[36m%s\x1b[0m', 'Prism Feature Scaffolder')
  console.log('------------------------')

  const typeInput = await question('Is this a (t)ool or a top-level (f)eature/calculator? [t/f]: ')
  const isTool = typeInput.toLowerCase().startsWith('t')

  const nameInput = await question(`Enter ${isTool ? 'tool' : 'feature'} ID (e.g. uuid-generator): `)
  const titleInput = await question('Enter Display Title (e.g. UUID Generator): ')

  const kebabName = toKebabCase(nameInput)
  const pascalName = toPascalCase(nameInput)
  const camelName = toCamelCase(nameInput)

  const baseDir = path.join(process.cwd(), 'src', 'features', isTool ? 'tools' : '', kebabName)

  // Paths
  const dirs = [
    baseDir,
    path.join(baseDir, 'components'),
    path.join(baseDir, 'composables'),
    path.join(baseDir, 'lib'),
    path.join(baseDir, 'pages'),
    path.join(baseDir, 'types'),
    path.join(baseDir, 'utils')
  ]

  console.log(`\n\x1b[33mCreating structure at: ${baseDir}\x1b[0m`)

  if (fs.existsSync(baseDir)) {
    console.error('\x1b[31mError: Directory already exists!\x1b[0m')
    rl.close()
    return
  }

  // Create Dirs
  dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }))

  // Create Files
  const contextId = `${isTool ? 'tools' : 'features'}.${kebabName}`

  // 1. Composable
  fs.writeFileSync(
    path.join(baseDir, 'composables', `use${pascalName}.ts`),
    composableTemplate(pascalName)
  )

  // 2. Page
  fs.writeFileSync(
    path.join(baseDir, 'pages', `${pascalName}${isTool ? 'Tool' : 'Page'}.vue`),
    pageTemplate(pascalName, kebabName, isTool ? 'tool' : 'feature', titleInput)
  )

  // 3. Shortcuts
  fs.writeFileSync(
    path.join(baseDir, 'lib', 'shortcuts.ts'),
    shortcutsTemplate(contextId)
  )

  // 4. Types
  fs.writeFileSync(
    path.join(baseDir, 'types', 'index.ts'),
    indexTypeTemplate()
  )

  // 5. Example Component
  fs.writeFileSync(
    path.join(baseDir, 'components', `${pascalName}Output.vue`),
    componentTemplate(pascalName)
  )

  console.log('\x1b[32m✔ Files generated successfully!\x1b[0m')
  console.log('\n------------------------')
  console.log('MANUAL STEPS REQUIRED:')
  console.log('------------------------')

  console.log('\n1. \x1b[36mRegister Routes (src/router/router.ts):\x1b[0m')
  console.log(`{
    path: '/${isTool ? 'tools/' : ''}${kebabName}',
    name: '${camelName}',
    component: () => import('@features/${isTool ? 'tools/' : ''}${kebabName}/pages/${pascalName}${isTool ? 'Tool' : 'Page'}.vue'),
    meta: { transition: 'fade', group: '${isTool ? 'tools' : 'calculators'}' }
  },`)

  console.log('\n2. \x1b[36mAdd to Sidebar (src/shared/composables/ui/useSidebarNavigation.ts):\x1b[0m')
  console.log(`{
    name: '${titleInput}',
    path: '/${isTool ? 'tools/' : ''}${kebabName}',
    icon: SomeLucideIcon, // Import from lucide-vue-next
    isNew: true,
    description: 'Description here...'
  },`)

  console.log('\n3. \x1b[36mRegister Shortcuts (src/shared/components/layout/app/AppSetup.vue):\x1b[0m')
  console.log(`import { ${camelName}Manifest } from '@features/${isTool ? 'tools/' : ''}${kebabName}/lib/shortcuts'`)
  console.log('// Add to the array:')
  console.log(`[..., ${camelName}Manifest].flat().forEach(...)`)

  console.log('\n------------------------')
  rl.close()
}

main()
