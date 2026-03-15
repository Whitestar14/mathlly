import { type Ref } from 'vue'
import { useToast } from '@composables/ui/useToast'
import { isBinaryExtension, isImageExtension, isMediaExtension } from '../utils/detectors/fileExtensionDetector'
import { validateFileSize, generateDownloadFilename, createBlobFromBinary, createBlobFromText } from '../utils/helpers/fileHelpers'
import { getMimeTypeExtension, getDefaultMimeType } from '../utils/detectors/mimeDetector'
import { downloadBlob } from '@shared/utils/file/download'
import type { FileDetails, InputMode } from '../types/base64'

export function useFileOperations(
  input: Ref<string>,
  inputMode: Ref<InputMode>,
  fileDetails: Ref<FileDetails | null>,
  currentTab: Ref<'encode' | 'decode'>,
  rawFileBase64Cache: Ref<string>
) {
  const { toast } = useToast()

  const handleFileUpload = (event: Event): Promise<boolean> => {
    return new Promise(resolve => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]

      if (!file) {
        resolve(false)
        return
      }

      const sizeValidation = validateFileSize(file.size)
      if (!sizeValidation.valid) {
        toast(sizeValidation.error!, { type: 'error' })
        target.value = ''
        resolve(false)
        return
      }

      // Detect mode switch requirement
      if (isBinaryExtension(file.name) || isImageExtension(file.name) || isMediaExtension(file.name)) {
        if (currentTab.value === 'decode') {
          toast(`Switched to 'Encode' for binary file: ${file.name}`, { type: 'info' })
          currentTab.value = 'encode'
        }
      }

      const reader = new FileReader()
      reader.onerror = () => {
        toast('Failed to read file', { type: 'error' })
        resolve(false)
      }

      if (currentTab.value === 'encode') {
        reader.onload = e => {
          const result = e.target?.result as string
          // Extract base64 part from Data URL
          const base64 = result.split(',')[1] || ''

          rawFileBase64Cache.value = base64
          inputMode.value = 'file'
          fileDetails.value = {
            name: file.name,
            size: file.size,
            type: file.type
          }

          // Clear text input to avoid confusion
          input.value = ''
          resolve(true)
        }
        reader.readAsDataURL(file)
      } else {
        // Decode Mode: Read as text
        reader.onload = e => {
          const result = e.target?.result as string
          // In decode mode, we usually treat uploaded files as text containing base64 string
          inputMode.value = 'text'
          input.value = result
          fileDetails.value = null // Not "file mode" in the UI logic sense for decode

          toast(`Loaded "${file.name}"`, { type: 'success' })
          resolve(true)
        }
        reader.readAsText(file)
      }
    })
  }

  const handleDrop = async(event: DragEvent, fileInput: Ref<HTMLInputElement | null>): Promise<boolean> => {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return false

    const file = files[0]

    if (fileInput.value) {
      // Manually assign files to input to reuse handleFileUpload logic
      const dt = new DataTransfer()
      dt.items.add(file)
      fileInput.value.files = dt.files

      return await handleFileUpload({ target: fileInput.value } as unknown as Event)
    }
    return false
  }

  const downloadOutput = (
    outputContent: string,
    currentTabValue: 'encode' | 'decode',
    resultState?: any
  ): void => {
    if (!outputContent && !resultState?.binary) {
      toast('Nothing to download', { type: 'warning' })
      return
    }

    let blob: Blob
    let filename: string

    if (currentTabValue === 'decode' && resultState?.success && resultState?.isBinary && resultState?.binary) {
      blob = createBlobFromBinary(resultState.binary, resultState.mime || getDefaultMimeType())
      filename = generateDownloadFilename('decode', getMimeTypeExtension(resultState.mime || getDefaultMimeType()))
    } else {
      blob = createBlobFromText(outputContent)
      filename = generateDownloadFilename(currentTabValue)
    }

    downloadBlob(blob, filename)

    toast('File downloaded!', { type: 'success' })
  }

  return {
    handleFileUpload,
    handleDrop,
    downloadOutput
  }
}
