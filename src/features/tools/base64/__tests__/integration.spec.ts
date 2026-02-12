import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import Base64Tool from '../pages/Base64Tool.vue'


HTMLElement.prototype.focus = vi.fn()
document.execCommand = vi.fn(() => true)

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(HTMLInputElement.prototype, 'files', {
  set(value) { ;(this as any)._files = value },
  get() { return (this as any)._files },
  configurable: true
})

global.DataTransfer = class {
  items = { _files: [] as File[], add(f: File) { this._files.push(f) } }
  get files() { return this.items._files }
} as any

describe('Base64Tool Integration', () => {
  let router: any

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }]
    })

    Object.assign(navigator, {
      clipboard: {
        readText: vi.fn(),
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
    
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()

    // Minimal Blob polyfill so FileReader reads content from Blobs created by the encoder
    global.Blob = class {
      parts: any[]; type: string
      constructor(parts: any[], opts: any = {}) { this.parts = parts; this.type = opts.type || '' }
      text() { return Promise.resolve(this.parts.join('')) }
      get size() { return this.parts.join('').length }
    } as any

    // FileReader mock that supports Blob/File with .text() or .parts
    global.FileReader = class {
      onload: any; onerror: any; result: any
      readAsDataURL(file: any) {
        if (file && typeof file.text === 'function') {
          file.text().then((txt: string) => {
            const b64 = Buffer.from(txt).toString('base64')
            this.result = `data:text/plain;base64,${b64}`
            if (this.onload) this.onload({ target: { result: this.result } })
          })
        } else {
          setTimeout(() => {
            const content = (file && ((file as any).parts?.join?.('') ?? (file as any)._content ?? ''))
            const b64 = Buffer.from(content).toString('base64')
            this.result = `data:text/plain;base64,${b64}`
            if (this.onload) this.onload({ target: { result: this.result } })
          }, 0)
        }
      }
      readAsText(file: any) {
        if (file && typeof file.text === 'function') {
          file.text().then((txt: string) => {
            this.result = txt
            if (this.onload) this.onload({ target: { result: this.result } })
          })
        } else {
          setTimeout(() => {
            const content = (file && ((file as any).parts?.join?.('') ?? (file as any)._content ?? ''))
            this.result = content
            if (this.onload) this.onload({ target: { result: this.result } })
          }, 0)
        }
      }
    } as any

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  const createWrapper = () => {
    return mount(Base64Tool, {
      global: {
        plugins: [router],
        directives: { tippy: {} }
      }
    })
  }

  const runAsyncLogic = async () => {
    await flushPromises()
    vi.advanceTimersByTime(400)
    await flushPromises()
    await nextTick()
  }

  it('encodes text input to Base64 output', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.setInput('Hello World')

    await runAsyncLogic()

    expect(vm.tool.ops.output.value).toBe('SGVsbG8gV29ybGQ=')
  })

  it('decodes Base64 input to Text output', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.currentTab.value = 'decode'
    await runAsyncLogic()

    vm.tool.setInput('SGVsbG8gV29ybGQ=')

    await runAsyncLogic()

    expect(vm.tool.ops.output.value).toBe('Hello World')
  })

  it('swaps input and output', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.setInput('A')
    await runAsyncLogic()

    // Swap
    vm.tool.handleSwap()
    await runAsyncLogic()

    // Validate via composable state
    expect(vm.tool.currentTab.value).toBe('decode')
    expect(vm.tool.input.value).toBe('QQ==')
  })

  it('clears all fields', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.input.value = 'Dirty'
    vm.tool.ops.output.value = 'Something'
    vm.tool.handleClear()
    await runAsyncLogic()

    expect(vm.tool.input.value).toBe('')
    expect(vm.tool.ops.output.value).toBe('')
  })

  it('copies output to clipboard', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.setInput('Copy Me')
    await runAsyncLogic()

    await vm.tool.copy(vm.tool.ops.output.value)
    await runAsyncLogic()

    // Environment-specific: the copy helper may use Clipboard API or execCommand fallback.
    if ((navigator.clipboard.writeText as any)?.mock?.calls?.length === 0) {
      expect(document.execCommand).toHaveBeenCalled()
    } else {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Q29weSBNZQ==')
    }
  })

  it('processes file upload (Encoding)', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    const file = ({ name: 'foo.txt', type: 'text/plain', size: 3, _content: 'foo', text: async () => 'foo' } as unknown) as File
    const dt = new DataTransfer()
    dt.items.add(file)

    // Call the composable API directly with a FileList
    await vm.tool.processFiles(dt.files)
    await runAsyncLogic()

    expect(vm.tool.fileDetails.value?.name).toBe('foo.txt')
    expect(vm.tool.ops.output.value).toBe('Zm9v')
  }, 10000)

  it('smart-switches to Encode if binary file dropped in Decode tab', async () => {
    const wrapper = createWrapper()
    await runAsyncLogic()
    const vm = wrapper.vm as any

    vm.tool.currentTab.value = 'decode'
    await runAsyncLogic()

    const file = ({ name: 'image.png', type: 'image/png', size: 6, _content: 'binary', text: async () => 'binary' } as unknown) as File

    const dt = new DataTransfer()
    dt.items.add(file)
    await vm.tool.processFiles(dt.files)

    await runAsyncLogic()

    expect(vm.tool.currentTab.value).toBe('encode')
    expect(vm.tool.ops.output.value).toBe('YmluYXJ5')
  }, 10000)
})