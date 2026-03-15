import { useToast } from '@composables/ui/useToast'
import { downloadBlob } from '@shared/utils/file/download'

/**
 * Generic function to export data as JSON.
 * @param data - The data payload to export.
 * @param filename - The filename for the download.
 * @param metadata - Optional metadata to include in the export.
 * @returns An object indicating success or failure.
 */
export function exportJSON(data: any, filename: string, metadata?: Record<string, any>) {
  try {
    const payload = {
      data,
      metadata: {
        ...metadata,
        exportedAt: new Date().toISOString()
      }
    }
    const jsonString = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    downloadBlob(blob, filename)
    
    const { success } = useToast()
    success(`Successfully exported to ${filename}`, { title: 'Exported!' })
    return { success: true }
  } catch(error) {
    console.error('Export failed:', error)
    return { success: false, error }
  }
}
