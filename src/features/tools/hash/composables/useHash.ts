import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { md5 } from '../utils/md5'

export interface HashResult {
  algorithm: string
  hash: string
}

export const AVAILABLE_ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

export function useHash() {
  const input = ref('')
  const isUppercase = ref(false)
  const isProcessing = ref(false)

  // Initialize with all algorithms enabled by default
  const enabledAlgorithms = ref<string[]>([...AVAILABLE_ALGORITHMS])
  const results = ref<HashResult[]>([])

  // Determine content type status string
  const inputStatus = computed(() => {
    if (!input.value) return 'Ready'
    return 'Text/Plain (UTF-8)'
  })

  // Input statistics
  const inputStats = computed(() => {
    if (!input.value) return ''
    const chars = input.value.length
    const bytes = new TextEncoder().encode(input.value).length
    return `${chars} chars • ${bytes} bytes`
  })

  const calculateHash = async(text: string, algorithm: string): Promise<string> => {
    if (algorithm === 'MD5') {
      const hash = md5(text)
      return isUppercase.value ? hash.toUpperCase() : hash
    }

    // Use Web Crypto for SHA family
    const msgBuffer = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return isUppercase.value ? hashHex.toUpperCase() : hashHex
  }

  const processAll = async() => {
    // Clear results if input is empty
    if (!input.value) {
      results.value = []
      return
    }

    isProcessing.value = true
    try {
      // Filter based on enabled algorithms
      const activeAlgos = AVAILABLE_ALGORITHMS.filter(algo => enabledAlgorithms.value.includes(algo))

      // Execute all hashing in parallel
      const promises = activeAlgos.map(async algo => {
        const hash = await calculateHash(input.value, algo)
        return { algorithm: algo, hash }
      })

      results.value = await Promise.all(promises)
    } catch(e) {
      console.error('Hashing failed', e)
    } finally {
      isProcessing.value = false
    }
  }

  const debouncedProcess = useDebounceFn(processAll, 300)

  const clear = () => {
    input.value = ''
    results.value = []
  }

  const toggleAlgorithm = (algo: string) => {
    if (enabledAlgorithms.value.includes(algo)) {
      enabledAlgorithms.value = enabledAlgorithms.value.filter(a => a !== algo)
    } else {
      enabledAlgorithms.value.push(algo)
    }
  }

  watch([input, isUppercase, enabledAlgorithms], () => {
    debouncedProcess()
  }, { deep: true })

  return {
    input,
    isUppercase,
    enabledAlgorithms,
    results,
    isProcessing,
    inputStatus,
    inputStats,
    processAll,
    clear,
    toggleAlgorithm
  }
}
