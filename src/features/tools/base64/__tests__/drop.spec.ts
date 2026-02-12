import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock toast before importing module
const toastMock = vi.fn()
vi.mock('@composables/ui/useToast', () => ({ useToast: () => ({ toast: toastMock }) }))

import { ref } from 'vue'
import { useFileOperations } from '../composables/useFileOperations'

// Simple helper to create files (stable mock with readable content)
const createMockFile = (name: string, type: string, content = 'content') => {
  // Provide a small mock that supports .text() (used by FileReader) and holds readable content
  return ({
    name,
    type,
    size: content.length,
    _content: content,
    text: async () => content
  } as unknown) as File
}

// Helper to wait for FileReader
const waitForFileReader = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('useFileOperations Smart Logic', () => {
  const input = ref('')
  const inputMode = ref<'text' | 'file'>('text')
  const fileDetails = ref<any>(null)
  const currentTab = ref<'encode' | 'decode'>('encode')
  const rawCache = ref('')

  // Mock global objects
  beforeEach(() => {
    vi.resetAllMocks()
    input.value = ''
    currentTab.value = 'encode'
    fileDetails.value = null
    inputMode.value = 'text'
    rawCache.value = ''    
    // Mock DataTransfer for Drop tests
    global.DataTransfer = class {
      items = { _files: [] as File[], add(f: File) { this._files.push(f) } }
      get files() { return this.items._files }
    } as any

    // Minimal FileReader mock used by the composable
    global.FileReader = class { onload: any; onerror: any; result: any; readAsDataURL(f:any){ if (f && typeof f.text === 'function') { f.text().then((text: string)=>{ const b64 = Buffer.from(text).toString('base64'); this.result = `data:text/plain;base64,${b64}`; if(this.onload) this.onload({ target: { result: this.result } }) }) } else { setTimeout(()=>{ const text = f instanceof Blob ? (f as any).parts?.join?.('') ?? '' : f; const b64 = Buffer.from(text).toString('base64'); this.result = `data:text/plain;base64,${b64}`; if(this.onload) this.onload({ target: { result: this.result } }) }, 0) } } readAsText(f:any){ if (f && typeof f.text === 'function') { f.text().then((text: string)=>{ this.result = text; if(this.onload) this.onload({ target: { result: this.result } }) }) } else { setTimeout(()=>{ this.result = f instanceof Blob ? (f as any).parts?.join?.('') ?? '' : f; if(this.onload) this.onload({ target: { result: this.result } }) }, 0) } } } as any
  })

  describe('Smart Tab Switching', () => {
    it('switches to ENCODE if a binary file (PNG) is dropped while in DECODE tab', async () => {
      // 1. Start in Decode mode
      currentTab.value = 'decode'

      const { handleFileUpload } = useFileOperations(
        input, inputMode, fileDetails, currentTab, rawCache
      )

      // 2. Upload an Image
      const file = createMockFile('image.png', 'image/png')
      const event = { target: { files: [file] } } as unknown as Event

      // 3. Run Handler
      await handleFileUpload(event)
      await waitForFileReader()

      // 4. Assert: Should have switched to 'encode'
      expect(currentTab.value).toBe('encode')
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining("Switched to 'Encode'"), expect.any(Object))

      // Composable should set file-mode metadata
      expect(inputMode.value).toBe('file')
      expect(fileDetails.value?.name).toBe('image.png')
      expect(rawCache.value).toBeDefined()
    })

    it('switches to ENCODE if a Zip file is dropped while in DECODE tab', async () => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(
        input, inputMode, fileDetails, currentTab, rawCache
      )

      const file = createMockFile('archive.zip', 'application/zip')
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)
      await waitForFileReader()

      expect(currentTab.value).toBe('encode')
    })

    it('stays in DECODE mode if a standard .txt file is dropped', async () => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(
        input, inputMode, fileDetails, currentTab, rawCache
      )

      // A text file containing base64 data
      const file = createMockFile('data.txt', 'text/plain', 'SGVsbG8=')
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)
      await waitForFileReader()

      // Should stay in decode
      expect(currentTab.value).toBe('decode')
      // Input should contain the text content
      expect(input.value).toBe('SGVsbG8=')
    })

    it('stays in ENCODE mode if an Image is dropped (Normal behavior)', async () => {
      currentTab.value = 'encode'
      const { handleFileUpload } = useFileOperations(
        input, inputMode, fileDetails, currentTab, rawCache
      )

      const file = createMockFile('image.png', 'image/png')
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)
      await waitForFileReader()

      expect(currentTab.value).toBe('encode')
      expect(inputMode.value).toBe('file')
      expect(fileDetails.value?.name).toBe('image.png')
    })
  })
})