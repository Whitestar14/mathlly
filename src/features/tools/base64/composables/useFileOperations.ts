import { type Ref } from 'vue'
import { useToast } from '@composables/ui/useToast'
import { isBinaryExtension, isImageExtension, isMediaExtension } from '../utils/detectors/fileExtensionDetector'
import { validateFileSize, generateDownloadFilename, downloadBlob, createBlobFromBinary, createBlobFromText } from '../utils/helpers/fileHelpers'
import { getMimeTypeExtension, getDefaultMimeType } from '../utils/detectors/mimeDetector'

export function useFileOperations(
  input: Ref<string>,
  selectedFileName: Ref<string>,
  toast: ReturnType<typeof useToast>['toast'],
  currentTab: Ref<'encode' | 'decode'>,
  rawFileBase64Cache?: Ref<string>
) {
  
  // Helper: Checks if a string looks like a standard Base64 string (no spaces, valid chars)
  // Not sure where to use this yet, if I'll even ever need it

  // const isValidBase64String = (str: string) => {
  //   if (str.length === 0 || str.length % 4 !== 0) return false
  //   // Allow whitespace but check main chars
  //   return /^[A-Za-z0-9+/=]+$/.test(str.trim())
  // }

  const handleFileUpload = (event: Event): Promise<boolean> => {
    return new Promise((resolve) => {
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

      selectedFileName.value = file.name
      const reader = new FileReader()

      reader.onerror = () => {
        toast('Failed to read file', { type: 'error' })
        resolve(false)
      }

      if (isBinaryExtension(file.name) || isImageExtension(file.name) || isMediaExtension(file.name)) {
        if (currentTab.value === 'decode') {
          toast(`Switched to 'Encode' for binary file: ${file.name}`, { type: 'info' })
          currentTab.value = 'encode'
        }
      }

      if (currentTab.value === 'encode') {
        input.value = `[Binary File Loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)]`
        
        reader.onload = (e) => {
          const result = e.target?.result as string
          const base64 = result.split(',')[1] || ''

          if (rawFileBase64Cache) {
            rawFileBase64Cache.value = base64
          }
          
          resolve(true)
        }
        reader.readAsDataURL(file)
       } else {
        reader.onload = (e) => {
          const result = e.target?.result as string
          input.value = result
          
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