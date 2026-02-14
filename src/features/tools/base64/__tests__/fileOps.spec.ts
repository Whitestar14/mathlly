import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the toast composable before importing the module under test
const toastMock = vi.fn()
vi.mock('@composables/ui/useToast', () => ({ useToast: () => ({ toast: toastMock }) }))

import { ref } from 'vue'
import { useFileOperations } from '../composables/useFileOperations'
import { Base64Constants } from '../utils/constants/Base64Constants'

// Helper to wait for FileReader async operations
const flushPromises = () => new Promise(resolve => setImmediate(resolve))

describe('useFileOperations', () => {
  // 1. Setup default refs aligned with new signature
  const input = ref('')
  const inputMode = ref<'text' | 'file'>('text')
  const fileDetails = ref<any>(null)
  const currentTab = ref<'encode' | 'decode'>('encode')
  const rawCache = ref('')

  // Helper to create readable mock files for testing
  const createMockFile = (name: string, type = 'text/plain', content = 'content') => ({ name, type, size: content.length, _content: content, text: async() => content } as unknown as File)

  // URL mocks
  const createObjectURLMock = vi.fn(() => 'mock-blob-url')
  const revokeObjectURLMock = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()

    input.value = ''
    inputMode.value = 'text'
    fileDetails.value = null
    currentTab.value = 'encode'
    rawCache.value = ''

    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    // Fix JSDOM FileList constraint for tests
    Object.defineProperty(HTMLInputElement.prototype, 'files', {
      set(value) { (this as any)._files = value },
      get() { return (this as any)._files },
      configurable: true
    })

    // Simple FileReader mock used for readAsDataURL and readAsText (supports _content)
    global.FileReader = class {
      onload: any; onerror: any; result: any
      readAsDataURL(file: any) {
        setTimeout(() => {
          const content = (file && (file as any)._content) ?? (file instanceof Blob ? (file as any).parts?.join?.('') ?? '' : '')
          const b64 = Buffer.from(content).toString('base64')
          this.result = `data:text/plain;base64,${b64}`
          if (this.onload) this.onload({ target: { result: this.result } })
        }, 0)
      }
      readAsText(file: any) {
        setTimeout(() => {
          const content = (file && (file as any)._content) ?? (file instanceof Blob ? (file as any).parts?.join?.('') ?? '' : '')
          this.result = content
          if (this.onload) this.onload({ target: { result: this.result } })
        }, 0)
      }
    } as any

    // DataTransfer mock
    global.DataTransfer = class {
      items = { _files: [] as File[], add(f: File) { this._files.push(f) } }
      get files() { return this.items._files }
    } as any
  })

  describe('handleFileUpload', () => {
    it('shows error toast if file is too large (>25MB)', async() => {
      const { handleFileUpload } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      // Minimal object with size > limit to trigger validation
      const largeFile = { size: 26 * 1024 * 1024, name: 'big.file' } as unknown as File
      const event = { target: { files: [largeFile] } } as unknown as Event

      const success = await handleFileUpload(event)

      expect(success).toBe(false)
      expect(toastMock).toHaveBeenCalledWith(Base64Constants.ERROR_MESSAGES.FILE_TOO_LARGE, { type: 'error' })
      expect(fileDetails.value).toBe(null)
    })

    it('ENCODE mode: reads file and caches raw base64', async() => {
      const { handleFileUpload } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const file = createMockFile('test.txt', 'text/plain', 'Hello World')
      const event = { target: { files: [file] } } as unknown as Event

      const success = await handleFileUpload(event)
      await flushPromises()

      expect(success).toBe(true)
      expect(fileDetails.value?.name).toBe('test.txt')
      expect(inputMode.value).toBe('file')
      expect(rawCache.value).toBe('SGVsbG8gV29ybGQ=')
      // The composable clears the text input for encode mode
      expect(input.value).toBe('')
    })

    it('DECODE mode: reads file as text into input', async() => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const fileContent = 'SGVsbG8='
      const file = createMockFile('encoded.txt', 'text/plain', fileContent)
      const event = { target: { files: [file] } } as unknown as Event

      const success = await handleFileUpload(event)
      await flushPromises()

      expect(success).toBe(true)
      expect(inputMode.value).toBe('text')
      expect(input.value).toBe(fileContent)
      expect(fileDetails.value).toBeNull()
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('Loaded "encoded.txt"'), { type: 'success' })
    })

    it('SMART SWITCH: switches to encode if binary file dropped in decode tab', async() => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const file = createMockFile('image.png', 'image/png', 'binary')
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)

      expect(currentTab.value).toBe('encode')
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining("Switched to 'Encode'"), expect.any(Object))
    })
  })

  describe('downloadOutput', () => {
    it('downloads text output', () => {
      const { downloadOutput } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const linkClickMock = vi.fn()
      vi.spyOn(document, 'createElement').mockReturnValue({ click: linkClickMock, href: '', download: '' } as unknown as HTMLAnchorElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node))
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node))

      downloadOutput('some-content', 'encode')

      expect(createObjectURLMock).toHaveBeenCalled()
      expect(linkClickMock).toHaveBeenCalled()
      expect(toastMock).toHaveBeenCalledWith('File downloaded!', { type: 'success' })
    })

    it('downloads binary content in decode mode', () => {
      const { downloadOutput } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const linkSpy = { click: vi.fn(), href: '', download: '' }
      vi.spyOn(document, 'createElement').mockReturnValue(linkSpy as unknown as HTMLAnchorElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node))
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node))

      const binaryData = new Uint8Array([1, 2, 3])
      const resultState = { success: true, isBinary: true, binary: binaryData, mime: 'image/png', text: '' }

      downloadOutput('', 'decode', resultState as any)

      expect(linkSpy.download).toContain('.png')
      expect(createObjectURLMock).toHaveBeenCalled()
    })

    it('shows warning if nothing to download', () => {
      const { downloadOutput } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)
      downloadOutput('', 'encode')
      expect(toastMock).toHaveBeenCalledWith('Nothing to download', { type: 'warning' })
    })
  })

  describe('handleDrop', () => {
    it('processes dropped files', async() => {
      const { handleDrop } = useFileOperations(input, inputMode, fileDetails, currentTab, rawCache)

      const file = createMockFile('drop.txt', 'text/plain', 'content')
      const mockFileInput = ref<HTMLInputElement>({ files: null } as unknown as HTMLInputElement)

      const event = { preventDefault: vi.fn(), dataTransfer: { files: [file] } } as unknown as DragEvent

      await handleDrop(event, mockFileInput)
      await flushPromises()

      expect(event.preventDefault).toHaveBeenCalled()
      expect(fileDetails.value?.name).toBe('drop.txt')
    })
  })
})
