import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useFileOperations } from '../composables/useFileOperations'

// Helper to wait for FileReader async operations
const waitForFileReader = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('useFileOperations', () => {
  // 1. Setup default refs
  const input = ref('')
  const selectedFileName = ref('')
  const toastMock = vi.fn()
  const currentTab = ref<'encode' | 'decode'>('encode')
  const rawCache = ref('')

  // 2. Global Mocks for Browser APIs
  const createObjectURLMock = vi.fn(() => 'mock-blob-url')
  const revokeObjectURLMock = vi.fn()
  
  // Mock console error
  vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.resetAllMocks()
    
    // Reset refs
    input.value = ''
    selectedFileName.value = ''
    currentTab.value = 'encode'
    rawCache.value = ''
    
    // Setup URL mocks
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    // Mock DataTransfer
    global.DataTransfer = class {
      items = {
        _files: [] as File[],
        add(file: File) {
          this._files.push(file)
        },
      }
      get files() {
        return this.items._files
      }
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('handleFileUpload', () => {
    it('shows error toast if file is too large (>25MB)', async () => {
      // FIX: Arguments aligned with new signature (Removed output & options)
      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      const largeFile = { size: 26 * 1024 * 1024, name: 'big.file' }
      const event = { target: { files: [largeFile] } } as unknown as Event

      const success = await handleFileUpload(event)

      expect(success).toBe(false)
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('exceeds 25MB'), { type: 'error' })
      expect(selectedFileName.value).toBe('')
    })

    it('ENCODE mode: reads file and caches raw base64', async () => {
      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      const blob = new Blob(['Hello World'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      const event = { target: { files: [file] } } as unknown as Event

      const success = await handleFileUpload(event)
      await waitForFileReader()

      expect(success).toBe(true)
      expect(selectedFileName.value).toBe('test.txt')
      
      // UI Input should show the binary placeholder
      expect(input.value).toContain('[Binary File Loaded')
      
      // Raw Cache should contain the actual base64 ("Hello World" -> "SGVsbG8gV29ybGQ=")
      // The composable no longer sets 'output', it sets 'rawCache'
      expect(rawCache.value).toBe('SGVsbG8gV29ybGQ=') 
    })

    it('DECODE mode: reads file as text into input', async () => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      const fileContent = 'SGVsbG8=' // Valid base64 string in a text file
      const file = new File([fileContent], 'encoded.txt', { type: 'text/plain' })
      const event = { target: { files: [file] } } as unknown as Event

      const success = await handleFileUpload(event)
      await waitForFileReader()

      expect(success).toBe(true)
      expect(input.value).toBe(fileContent)
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('Loaded "encoded.txt"'), { type: 'success' })
    })

    // New Test for the Smart Switching Logic
    it('SMART SWITCH: switches to encode if binary file dropped in decode tab', async () => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      // Mock an image file
      const file = new File(['binary'], 'image.png', { type: 'image/png' })
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)
      
      expect(currentTab.value).toBe('encode')
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('Switched to \'Encode\''), expect.any(Object))
    })
  })

  describe('downloadOutput', () => {
    it('downloads text output', () => {
      const { downloadOutput } = useFileOperations(
        input, selectedFileName, toastMock, currentTab
      )
      
      const linkClickMock = vi.fn()
      const linkRemoveMock = vi.fn()
      
      vi.spyOn(document, 'createElement').mockReturnValue({
        click: linkClickMock,
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement)
      
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node))
      vi.spyOn(document.body, 'removeChild').mockImplementation(linkRemoveMock)

      downloadOutput('some-content', 'encode')

      expect(createObjectURLMock).toHaveBeenCalled()
      expect(linkClickMock).toHaveBeenCalled()
      expect(toastMock).toHaveBeenCalledWith('File downloaded!', { type: 'success' })
    })

    it('downloads binary content in decode mode', () => {
      const { downloadOutput } = useFileOperations(
        input, selectedFileName, toastMock, currentTab
      )
      
      const linkSpy = { click: vi.fn(), href: '', download: '' }
      vi.spyOn(document, 'createElement').mockReturnValue(linkSpy as unknown as HTMLAnchorElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node))
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node))

      const binaryData = new Uint8Array([1, 2, 3])
      const resultState = {
        success: true,
        isBinary: true,
        binary: binaryData,
        mime: 'image/png',
        text: ''
      }

      downloadOutput('', 'decode', resultState as any)

      expect(linkSpy.download).toContain('.png')
      expect(createObjectURLMock).toHaveBeenCalled()
    })

    it('shows warning if nothing to download', () => {
      const { downloadOutput } = useFileOperations(
        input, selectedFileName, toastMock, currentTab
      )
      
      downloadOutput('', 'encode')
      expect(toastMock).toHaveBeenCalledWith('Nothing to download', { type: 'warning' })
    })
  })

  describe('handleDrop', () => {
    it('processes dropped files', async () => {
      const { handleDrop } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      const file = new File(['content'], 'drop.txt')
      const mockFileInput = ref<HTMLInputElement>({ files: null } as unknown as HTMLInputElement)
      
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          files: [file]
        }
      } as unknown as DragEvent

      await handleDrop(event, mockFileInput)
      await waitForFileReader()

      expect(event.preventDefault).toHaveBeenCalled()
      expect(selectedFileName.value).toBe('drop.txt')
    })
  })
})