import { ref, computed } from 'vue'
import { diffLines, diffWords, type Change } from 'diff'

export type DiffMode = 'lines' | 'words'
export type DiffView = 'split' | 'unified'

export function useDiffTool() {
  const originalText = ref('')
  const modifiedText = ref('')

  const diffMode = ref<DiffMode>('lines')
  const diffView = ref<DiffView>('split')
  const ignoreWhitespace = ref(false)
  const caseInsensitive = ref(false)

  const diffResult = computed<Change[]>(() => {
    if (!originalText.value && !modifiedText.value) return []

    const options = {
      ignoreWhitespace: ignoreWhitespace.value,
      ignoreCase: caseInsensitive.value
    }

    if (diffMode.value === 'lines') {
      return diffLines(originalText.value, modifiedText.value, options)
    } else {
      return diffWords(originalText.value, modifiedText.value, options)
    }
  })

  // Utility to count lines ignoring added/removed for alignment in split view
  const splitViewLines = computed(() => {
    let originalLine = 1
    let modifiedLine = 1
    const lines: Array<{
      type: 'added' | 'removed' | 'unchanged'
      originalLineNumber: number | null
      modifiedLineNumber: number | null
      value: string
    }> = []

    // For line diff, each change has a count of lines
    if (diffMode.value === 'lines') {
      diffResult.value.forEach(change => {
        const changeLines = change.value.replace(/\n$/, '').split('\n')

        changeLines.forEach(line => {
          if (change.added) {
            lines.push({
              type: 'added',
              originalLineNumber: null,
              modifiedLineNumber: modifiedLine++,
              value: line
            })
          } else if (change.removed) {
            lines.push({
              type: 'removed',
              originalLineNumber: originalLine++,
              modifiedLineNumber: null,
              value: line
            })
          } else {
            lines.push({
              type: 'unchanged',
              originalLineNumber: originalLine++,
              modifiedLineNumber: modifiedLine++,
              value: line
            })
          }
        })
      })
    }
    return lines
  })

  const clear = () => {
    originalText.value = ''
    modifiedText.value = ''
  }

  const swap = () => {
    const temp = originalText.value
    originalText.value = modifiedText.value
    modifiedText.value = temp
  }

  const loadSample = () => {
    originalText.value = `function calculateTotal(price, tax) {
  const subtotal = price;
  const totalTax = price * tax;
  return subtotal + totalTax;
}`
    modifiedText.value = `function calculateTotal(price, tax, discount = 0) {
  const subtotal = price - discount;
  const totalTax = subtotal * tax;
  return subtotal + totalTax;
}`
  }

  const handleOriginalFileUpload = async(file: File) => {
    originalText.value = await file.text()
  }

  const handleModifiedFileUpload = async(file: File) => {
    modifiedText.value = await file.text()
  }

  return {
    originalText,
    modifiedText,
    diffMode,
    diffView,
    ignoreWhitespace,
    caseInsensitive,
    diffResult,
    splitViewLines,
    clear,
    swap,
    loadSample,
    handleOriginalFileUpload,
    handleModifiedFileUpload
  }
}
