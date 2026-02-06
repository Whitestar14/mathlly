import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils' // Added flushPromises
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Base64Tool from '../pages/Base64Tool.vue'

// --- 1. ROBUST MOCKS ---

HTMLElement.prototype.focus = vi.fn()
// Mock execCommand for older VueUse versions/JSDOM
document.execCommand = vi.fn(() => true)

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Fix JSDOM FileList restriction
Object.defineProperty(HTMLInputElement.prototype, 'files', {
  set(value) { this._files = value },
  get() { return this._files },
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

  // Helper to skip debounce and process all async tasks
  const runAsyncLogic = async () => {
    vi.advanceTimersByTime(400) // Pass 300ms debounce
    await flushPromises()       // Handle FileReader and internal async/await
  }

  it('encodes text input to Base64 output', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    
    // Set value and trigger logic
    vm.tool.input.value = 'Hello World'
    vm.tool.handleInput() // Do NOT 'await' a debounced function when timers are fake

    await runAsyncLogic()

    const textareas = wrapper.findAll('textarea')
    expect(textareas[1].element.value).toBe('SGVsbG8gV29ybGQ=')
  })

  it('decodes Base64 input to Text output', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any

    vm.tool.currentTab.value = 'decode'
    await flushPromises()

    vm.tool.input.value = 'SGVsbG8gV29ybGQ='
    vm.tool.handleInput()

    await runAsyncLogic()

    const textareas = wrapper.findAll('textarea')
    expect(textareas[1].element.value).toBe('Hello World')
  })

  it('swaps input and output', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    
    vm.tool.input.value = 'A'
    vm.tool.handleInput()
    await runAsyncLogic()

    // Swap
    vm.tool.handleSwap()
    await flushPromises()

    expect(vm.tool.currentTab.value).toBe('decode')
    expect(vm.tool.input.value).toBe('QQ==')
  })

  it('clears all fields', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any

    vm.tool.input.value = 'Dirty'
    vm.tool.handleClear()
    await flushPromises()

    expect(vm.tool.input.value).toBe('')
    expect(vm.tool.ops.output.value).toBe('')
  })

  it('copies output to clipboard', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any

    vm.tool.input.value = 'Copy Me'
    vm.tool.handleInput()
    await runAsyncLogic()

    await vm.tool.copy(vm.tool.ops.output.value)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Q29weSBNZQ==')
  })

  it('processes file upload (Encoding)', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    
    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })
    const input = wrapper.find('input[type="file"]')
    
    // @ts-ignore
    input.element.files = [file]
    
    // Use the component's internal handler
    await input.trigger('change')
    
    // Handle the Promise in useFileOperations + debounce in Tool
    await runAsyncLogic()

    expect(vm.tool.input.value).toContain('Binary File Loaded: foo.txt')
    expect(vm.tool.ops.output.value).toBe('Zm9v')
  })

  it('smart-switches to Encode if binary file dropped in Decode tab', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    
    vm.tool.currentTab.value = 'decode'
    await flushPromises()

    const file = new File(['binary'], 'image.png', { type: 'image/png' })
    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] }
    }

    // Call drop handler directly
    const dummyRef = { value: wrapper.find('input[type="file"]').element }
    vm.tool.onDrop(dropEvent, dummyRef)
    
    await runAsyncLogic()

    expect(vm.tool.currentTab.value).toBe('encode')
    expect(vm.tool.ops.output.value).toBe('YmluYXJ5') // "binary" in base64
  })
})