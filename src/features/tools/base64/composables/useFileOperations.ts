import { type Ref } from 'vue'
import { useToast } from '@composables/ui/useToast'

export function useFileOperations(
  input: Ref<string>,
  selectedFileName: Ref<string>,
  toast: ReturnType<typeof useToast>['toast'],
  currentTab: Ref<'encode' | 'decode'>,
  rawFileBase64Cache?: Ref<string>
) {
  
  const isBinaryExtension = (name: string) => {
    return /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|zip|rar|7z|tar|gz|pdf|doc|docx|xls|xlsx|ppt|pptx|mp3|mp4|wav|avi|mov|woff|woff2|ttf|eot|otf|bin|exe|dll|so|dat)$/i.test(name)
  }

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

      if (file.size > 25 * 1024 * 1024) { 
        toast('File size exceeds 25MB limit', { type: 'error' })
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

      if (isBinaryExtension(file.name) || file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
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
      const mime = resultState.mime || 'application/octet-stream'
      blob = new Blob([resultState.binary as any], { type: mime })
      
      let ext = 'bin'
      if (mime.includes('/')) {
        ext = mime.split('/')[1].split('+')[0]
      }
      filename = `decoded_${Date.now()}.${ext}`
    } else {
      blob = new Blob([outputContent], { type: 'text/plain' })
      filename = currentTabValue === 'encode' ? 
        `encoded_${Date.now()}.txt` : 
        `decoded_${Date.now()}.txt`
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
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