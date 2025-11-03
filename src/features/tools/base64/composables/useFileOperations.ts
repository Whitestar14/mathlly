import { type Ref } from 'vue'
import { useToast } from '@composables/ui/useToast'

export function useFileOperations(
  input: Ref<string>,
  selectedFileName: Ref<string>,
  toast: ReturnType<typeof useToast>['toast']
) {
  const handleFileUpload = async(event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast('File size exceeds 10MB limit', { type: 'error' })
      return
    }

    selectedFileName.value = file.name

    try {
      const reader = new FileReader()

      return new Promise(resolve => {
        reader.onload = e => {
          const result = e.target?.result as string
          input.value = result
          toast(`File "${file.name}" loaded successfully`, { type: 'success' })
          resolve()
        }

        reader.onerror = () => {
          toast('Failed to read file', { type: 'error' })
          resolve()
        }

        if (file.type.startsWith('text/') || file.type === 'application/json') {
          reader.readAsText(file)
        } else {
          reader.readAsDataURL(file)
        }
      })
    } catch(error) {
      console.error('File upload error:', error)
      toast('Failed to read file', { type: 'error' })
    }
  }

  const handleDrop = async(event: DragEvent, fileInput: Ref<HTMLInputElement | null>): Promise<void> => {
    event.preventDefault()

    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (fileInput.value) {
      const dt = new DataTransfer()
      dt.items.add(file)
      fileInput.value.files = dt.files

      await handleFileUpload({ target: fileInput.value } as any)
    }
  }

  const downloadOutput = (output: string, currentTab: 'encode' | 'decode'): void => {
    if (!output) {
      toast('Nothing to download', { type: 'warning' })
      return
    }

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = currentTab === 'encode' ?
      `encoded_${Date.now()}.txt` :
      `decoded_${Date.now()}.txt`

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast('File downloaded!', { type: 'success' })
  }

  return {
    handleFileUpload,
    handleDrop,
    downloadOutput
  }
}
