import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFileOperations } from '../composables/useFileOperations'

// Simple helper to create files
const createMockFile = (name: string, type: string, content = 'content') => {
  return new File([content], name, { type })
}

// Helper to wait for FileReader
const waitForFileReader = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('useFileOperations Smart Logic', () => {
  const input = ref('')
  const selectedFileName = ref('')
  const toastMock = vi.fn()
  const currentTab = ref<'encode' | 'decode'>('encode')
  const rawCache = ref('')

  // Mock global objects
  beforeEach(() => {
    vi.resetAllMocks()
    input.value = ''
    currentTab.value = 'encode'
    selectedFileName.value = ''
    
    // Mock DataTransfer for Drop tests
    global.DataTransfer = class {
      items = { _files: [] as File[], add(f: File) { this._files.push(f) } }
      get files() { return this.items._files }
    } as any
  })

  describe('Smart Tab Switching', () => {
    it('switches to ENCODE if a binary file (PNG) is dropped while in DECODE tab', async () => {
      // 1. Start in Decode mode
      currentTab.value = 'decode'

      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      // 2. Upload an Image
      const file = createMockFile('image.png', 'image/png')
      const event = { target: { files: [file] } } as unknown as Event

      // 3. Run Handler
      await handleFileUpload(event)
      await waitForFileReader()

      // 4. Assert: Should have switched to 'encode'
      expect(currentTab.value).toBe('encode')
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('Switched to \'Encode\''), expect.any(Object))
      // Input should show binary placeholder
      expect(input.value).toContain('[Binary File Loaded')
    })

    it('switches to ENCODE if a Zip file is dropped while in DECODE tab', async () => {
      currentTab.value = 'decode'
      const { handleFileUpload } = useFileOperations(
        input, selectedFileName, toastMock, currentTab, rawCache
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
        input, selectedFileName, toastMock, currentTab, rawCache
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
        input, selectedFileName, toastMock, currentTab, rawCache
      )

      const file = createMockFile('image.png', 'image/png')
      const event = { target: { files: [file] } } as unknown as Event

      await handleFileUpload(event)
      await waitForFileReader()

      expect(currentTab.value).toBe('encode')
      expect(input.value).toContain('[Binary File Loaded')
    })
  })
})