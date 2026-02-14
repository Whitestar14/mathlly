import { ref, shallowRef, onBeforeUnmount, watch, triggerRef } from 'vue'
import { useToast } from '@composables/ui/useToast'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import JsonWorker from '../services/json.worker?worker'

export type ViewMode = 'tree' | 'code' | 'typescript' | 'xml' | 'csv'

export interface ParseError {
  message: string
  line?: number
}

export function useJsonTool() {
  // Use shallowRef for large strings to prevent Vue from traversing them for reactivity
  const input = shallowRef('')
  const parsed = shallowRef<any>(null)

  const error = ref<ParseError | null>(null)
  const viewMode = ref<ViewMode>('tree')
  const indentation = ref<number | string>(2)
  const isProcessing = ref(false)

  // Outputs
  const typeScriptOutput = shallowRef('')
  const xmlOutput = shallowRef('')
  const csvOutput = shallowRef('')

  const { toast } = useToast()
  const { copy } = useClipboard()

  // Worker Setup
  const worker = new JsonWorker()

  worker.onmessage = (e: MessageEvent) => {
    const { type, payload, error: workerError, result } = e.data

    if (type === 'PROCESS_SUCCESS') {
      parsed.value = payload.parsed
      typeScriptOutput.value = payload.ts
      xmlOutput.value = payload.xml
      csvOutput.value = payload.csv
      error.value = null
      isProcessing.value = false
    } else if (type === 'ERROR') {
      error.value = workerError
      // We don't nullify parsed here, allowing the user to see the "stale" tree while fixing errors
      isProcessing.value = false
    } else if (type === 'FORMAT_SUCCESS' || type === 'MINIFY_SUCCESS') {
      input.value = result
      triggerRef(input) // Manually trigger update since it's a shallowRef
      // After formatting, we re-parse to update the tree/outputs
      parseJsonImmediate(result)
    }
  }

  // --- Core Logic ---

  // The actual worker call
  const parseJsonImmediate = (raw: string) => {
    if (!raw.trim()) {
      parsed.value = null
      error.value = null
      isProcessing.value = false
      return
    }
    // We don't set isProcessing = true here to avoid UI flickering on every keypress
    worker.postMessage({
      type: 'PROCESS',
      code: raw,
      indent: indentation.value
    })
  }

  // DEBOUNCED version for user typing (300ms delay)
  const parseJsonDebounced = useDebounceFn((raw: string) => {
    parseJsonImmediate(raw)
  }, 300)

  // Watch indentation to re-process (debounce not strictly needed here but safe)
  watch(indentation, () => {
    if (input.value) parseJsonImmediate(input.value)
  })

  // --- Actions ---

  const setInput = (val: string) => {
    input.value = val
    parseJsonDebounced(val)
  }

  const formatInput = () => {
    if (!input.value) return
    isProcessing.value = true
    worker.postMessage({ type: 'FORMAT', code: input.value, indent: indentation.value })
  }

  const minifyInput = () => {
    if (!input.value) return
    isProcessing.value = true
    worker.postMessage({ type: 'MINIFY', code: input.value })
  }

  const copyResult = async() => {
    let content = ''
    switch (viewMode.value) {
      case 'typescript': content = typeScriptOutput.value; break
      case 'xml': content = xmlOutput.value; break
      case 'csv': content = csvOutput.value; break
      default: content = JSON.stringify(parsed.value, null, typeof indentation.value === 'string' ? '\t' : Number(indentation.value)); break
    }

    if (!content) return toast({ title: 'Nothing to copy', type: 'warning' })

    await copy(content)
    toast({ title: 'Copied', description: 'Content copied to clipboard', type: 'success' })
  }

  const clear = () => {
    input.value = ''
    parsed.value = null
    error.value = null
    typeScriptOutput.value = ''
    xmlOutput.value = ''
    csvOutput.value = ''
  }

  const loadSample = () => {
    const sample = {
      'project': 'Prism',
      'version': 0.15,
      'features': ['Calculator', 'Converter', 'Tools'],
      'settings': { 'theme': 'dark', 'notifications': true },
      'users': [{ 'id': 1, 'name': 'Dev', 'roles': ['admin', 'contributor'] }]
    }
    const str = JSON.stringify(sample, null, 2)
    input.value = str
    parseJsonImmediate(str)
  }

  const handleFileUpload = (file: File) => {
    if (!file) return
    isProcessing.value = true
    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      input.value = content
      parseJsonImmediate(content)
      isProcessing.value = false
      toast({ title: 'File Loaded', description: file.name, type: 'success' })
    }
    reader.readAsText(file)
  }

  const downloadFile = () => {
    let content = ''
    let ext = 'json'
    let mime = 'application/json'

    switch (viewMode.value) {
      case 'typescript':
        content = typeScriptOutput.value; ext = 'ts'; mime = 'text/plain'; break
      case 'xml':
        content = xmlOutput.value; ext = 'xml'; mime = 'application/xml'; break
      case 'csv':
        content = csvOutput.value; ext = 'csv'; mime = 'text/csv'; break
      default:
        content = JSON.stringify(parsed.value, null, typeof indentation.value === 'string' ? '\t' : Number(indentation.value))
        ext = 'json'; mime = 'application/json'; break
    }

    if (!content || !parsed.value) return

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prism_export.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({ title: 'Download Started', description: `Exporting as .${ext}`, type: 'success' })
  }

  onBeforeUnmount(() => worker.terminate())

  return {
    input,
    parsed,
    error,
    viewMode,
    indentation,
    isProcessing,
    setInput, // New setter that triggers debounce
    parseJson: parseJsonImmediate, // Direct access if needed
    formatInput,
    minifyInput,
    typeScriptOutput,
    xmlOutput,
    csvOutput,
    copyResult,
    clear,
    loadSample,
    handleFileUpload,
    downloadFile
  }
}
