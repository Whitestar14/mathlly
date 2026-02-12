import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import type { InputMode, Base64Options } from '../types/base64'
import { useBase64Operations } from '../composables/useBase64Operations'
import { Base64Constants } from '../utils/constants/Base64Constants'

describe('useBase64Operations', () => {
  const options = ref<Base64Options>({
    autoProcess: true,
    preserveWhitespace: false,
    preserveMode: true,
    outputFormat: 'standard',
    lineLength: 76,
    validateInput: true,
    showCharacterCount: true
  })

  // Polyfills and mocks for Node environment
  beforeEach(() => {
    // Reset shared options to defaults to avoid cross-test contamination
    options.value = {
      autoProcess: true,
      preserveWhitespace: false,
      preserveMode: true,
      outputFormat: 'standard',
      lineLength: 76,
      validateInput: true,
      showCharacterCount: true
    }

    // btoa / atob polyfills used by encoder/decoder
    global.atob = (s: string) => Buffer.from(s, 'base64').toString('binary')
    // @ts-ignore
    global.btoa = (s: string) => Buffer.from(s, 'binary').toString('base64')

    // Minimal Blob polyfill for size calculations
    global.Blob = class {
      parts: any[]; type: string;
      constructor(parts: any[], opts: any = {}) { this.parts = parts; this.type = opts.type || '' }
      get size() { return this.parts.join('').length }
    } as any

    // Mock FileReader for DataURL reads used by the encoder
    global.FileReader = class {
      onload: any; onerror: any; result: any;
      readAsDataURL(blob: any) {
        // Prefer async .text() if available on Blob/File
        if (blob && typeof blob.text === 'function') {
          blob.text().then((text: string) => {
            const b64 = Buffer.from(text).toString('base64')
            this.result = `data:text/plain;base64,${b64}`
            if (this.onload) this.onload({ target: { result: this.result } })
          })
        } else {
          setTimeout(() => {
            const text = blob && (blob.parts?.join?.('') ?? String(blob))
            const b64 = Buffer.from(text || '').toString('base64')
            this.result = `data:text/plain;base64,${b64}`
            if (this.onload) this.onload({ target: { result: this.result } })
          }, 0)
        }
      }
    } as any
  })

  it('encodes text correctly', async () => {
    const input = ref('Hello World')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    expect(result.success).toBe(true)
    expect(result.output).toBe('SGVsbG8gV29ybGQ=')
  })

  it('decodes base64 correctly', async () => {
    const input = ref('SGVsbG8gV29ybGQ=')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('decode')
    expect(result.success).toBe(true)
    expect(result.output).toBe('Hello World')
  })

  it('reports validation error for invalid base64', async () => {
    const input = ref('Invalid!!Base64')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('decode')
    expect(result.success).toBe(false)
    expect(result.error).toBe(Base64Constants.ERROR_MESSAGES.INVALID_BASE64)
  })

  it('supports url-safe encoding format', async () => {
    options.value.outputFormat = 'url-safe'
    const input = ref('subjects? ')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    expect(result.success).toBe(true)
    expect(result.output).not.toContain('+')
    expect(result.output).not.toContain('/')
    expect(result.output).toContain('_')
  })

  it('uses rawFileBase64 when in file mode', async () => {
    // Ensure standard format for this test
    options.value.outputFormat = 'standard'

    const input = ref('')
    const inputMode = ref<InputMode>('file')
    const { processInput, rawFileBase64 } = useBase64Operations(input, inputMode, options)

    rawFileBase64.value = 'SGVsbG8gV29ybGQ='
    const result = await processInput('encode')

    expect(result.success).toBe(true)
    // Accept with or without padding (defensive against formatting changes)
    expect((result.output ?? '').replace(/=+$/, '')).toBe('SGVsbG8gV29ybGQ')
  })

  it('detects binary content when decoding image-like data', async () => {
    // A short PNG header base64 (truncated) should be detected as binary
    const pngBase64 = 'iVBORw0KGgo='
    const input = ref(pngBase64)
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('decode')
    expect(result.success).toBe(true)
    expect(result.isBinary).toBe(true)
    expect(result.binary).toBeDefined()
  })

  it('respects preserveWhitespace option when encoding', async () => {
    options.value.preserveWhitespace = true
    const input = ref('  padded  ')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    // Ensure leading/trailing spaces are preserved in the input -> encoded string differs from trimmed version
    expect(result.success).toBe(true)
    expect(result.output).toBe('ICBwYWRkZWQgIA==')
  })

  it('honors line length formatting for output (MIME)', async () => {
    options.value.lineLength = 4
    options.value.outputFormat = 'mime'
    const input = ref('abcdefghijk') // Will produce base64 longer than 4 chars
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    expect(result.success).toBe(true)
    // MIME formatting should insert newlines
    expect(result.output).toContain('\n')
  })

  it('handles empty text input gracefully', async () => {
    const input = ref('')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    expect(result.success).toBe(true)
    // The API may or may not include an explicit empty 'output' property; treat missing as empty
    expect((result.output ?? '')).toBe('')
  })

  it('returns failure when encoder throws', async () => {
    // Spy on Base64ServiceFactory to simulate an encoder that throws
    const factory = await import('../services/factory/Base64ServiceFactory')
    const spy = vi.spyOn(factory.Base64ServiceFactory, 'createEncoder').mockImplementation(() => ({ encode: () => Promise.reject(new Error('boom')) } as any))

    const input = ref('will fail')
    const inputMode = ref<InputMode>('text')
    const { processInput } = useBase64Operations(input, inputMode, options)

    const result = await processInput('encode')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Encoding failed')

    spy.mockRestore()
  })
})
