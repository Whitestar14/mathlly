import { describe, it, expect, beforeEach } from 'vitest'
import { useBase64Operations } from '../composables/useBase64Operations'
import { ref } from 'vue'
import type { Base64Options } from '../types/base64'

describe('Base64 Operations', () => {
  const options = ref<Base64Options>({
    autoProcess: true,
    preserveWhitespace: false,
    preserveMode: true,
    outputFormat: 'standard',
    lineLength: 76,
    handleBinaryFiles: true,
    validateInput: true,
    showCharacterCount: true
  })

  // Polyfills for Node environment
  beforeEach(() => {
    global.Blob = class {
      parts: any[]; type: string;
      constructor(parts: any[], opts: any = {}) { this.parts = parts; this.type = opts.type || '' }
      get size() { return this.parts.join('').length }
    } as any

    // Mock FileReader
    global.FileReader = class {
      onload: any; onerror: any; result: any;
      readAsDataURL(blob: any) {
        setTimeout(() => {
           // Basic mock mapping for text -> base64 using Buffer
           const text = blob.parts.join('')
           const b64 = Buffer.from(text).toString('base64')
           this.result = `data:text/plain;base64,${b64}`
           
           if (this.onload) {
             this.onload({ target: { result: this.result } })
           }
        }, 10)
      }
    } as any
  })

  it('encodes text correctly', async() => {
    const input = ref('Hello World')
    const { processInput } = useBase64Operations(input, options)
    
    const result = await processInput('encode')
    expect(result.output).toBe('SGVsbG8gV29ybGQ=')
  })

  it('decodes base64 correctly', async() => {
    const input = ref('SGVsbG8gV29ybGQ=')
    const { processInput } = useBase64Operations(input, options)

    const result = await processInput('decode')
    expect(result.output).toBe('Hello World')
  })

  it('handles invalid base64 during decode', async() => {
    const input = ref('Invalid!!Base64')
    const { processInput } = useBase64Operations(input, options)

    const result = await processInput('decode')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid Base64')
  })

  it('handles url-safe encoding', async() => {
    options.value.outputFormat = 'url-safe'
    // 'subjects? ' encodes to 'c3ViamVjdHM/IA==' in standard
    // In url-safe: 'c3ViamVjdHM_IA' (no padding, / -> _, + -> -)
    
    const input = ref('subjects? ')
    const { processInput } = useBase64Operations(input, options)
    const result = await processInput('encode')
    
    expect(result.output).not.toContain('+')
    expect(result.output).not.toContain('/')
    // Ensure the known char is replaced
    expect(result.output).toContain('_')
  })
})
