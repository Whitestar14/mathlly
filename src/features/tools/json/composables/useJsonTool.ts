import { ref, computed, shallowRef } from 'vue'
import { generateTypeScript } from '../utils/typeGenerator'
import { useToast } from '@composables/ui/useToast'
import { useClipboard } from '@vueuse/core'

export type ViewMode = 'tree' | 'code' | 'typescript' | 'xml' | 'csv'

export interface ParseError {
  message: string
  line?: number
}

export function useJsonTool() {
  const input = ref('')
  const parsed = shallowRef<any>(null)
  const error = ref<ParseError | null>(null)
  const viewMode = ref<ViewMode>('tree')
  const indentation = ref<number | string>(2)
  
  const { toast } = useToast()
  const { copy } = useClipboard()

  const parseJson = (raw: string) => {
    if (!raw.trim()) {
      parsed.value = null
      error.value = null
      return
    }

    try {
      const data = JSON.parse(raw)
      parsed.value = data
      error.value = null
    } catch (e: any) {
      parsed.value = null
      const msg = e.message || 'Invalid JSON'
      const match = msg.match(/position\s+(\d+)/)
      let line = 0
      if (match) {
        const pos = parseInt(match[1], 10)
        line = raw.substring(0, pos).split('\n').length
      }
      error.value = { message: msg, line }
    }
  }

  const getIndent = () => {
    return typeof indentation.value === 'string' ? '\t' : Number(indentation.value)
  }

  const formatInput = () => {
    if (!parsed.value) return
    input.value = JSON.stringify(parsed.value, null, getIndent())
  }

  const minifyInput = () => {
    if (!parsed.value) return
    input.value = JSON.stringify(parsed.value)
  }

  const typeScriptOutput = computed(() => {
    if (!parsed.value) return '// Valid JSON required'
    try {
      return generateTypeScript(parsed.value)
    } catch (e) {
      return '// Error generating types'
    }
  })

  // --- CSV Conversion ---
  const csvOutput = computed(() => {
    if (!parsed.value) return ''
    const data = Array.isArray(parsed.value) ? parsed.value : [parsed.value]
    if (data.length === 0) return ''

    // Get all unique keys from all objects to build headers
    const headers = Array.from(new Set(
      data.reduce((acc: string[], item: any) => {
        if (typeof item === 'object' && item !== null) {
          return [...acc, ...Object.keys(item)]
        }
        return acc
      }, [])
    )) as string[]

    const csvRows = [
      headers.join(','), // Header row
      ...data.map((row: any) => {
        return headers.map(fieldName => {
          const val = row[fieldName]
          if (val === null || val === undefined) return ''
          const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val)
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`
          }
          return stringVal
        }).join(',')
      })
    ]

    return csvRows.join('\n')
  })

  // --- XML Conversion ---
  const toXml = (obj: any, rootName = 'root'): string => {
    const indent = getIndent() === '\t' ? '\t' : ' '.repeat(Number(indentation.value))
    
    const convert = (data: any, level = 0): string => {
        const padding = typeof indent === 'string' && indent === '\t' 
            ? '\t'.repeat(level) 
            : ' '.repeat(level * (typeof indentation.value === 'number' ? indentation.value : 2))
            
        if (data === null) return ''
        
        if (typeof data !== 'object') {
            return String(data)
        }

        if (Array.isArray(data)) {
            return data.map(item => {
                // For arrays, we repeat the tag for each item, typically handled by parent call
                // But if we are at root array, we wrap items in 'item' tag
                return `${padding}<item>\n${convert(item, level + 1)}\n${padding}</item>`
            }).join('\n')
        }

        return Object.entries(data).map(([key, value]) => {
            // Clean key for XML tag validity (basic check)
            const tag = key.replace(/[^a-zA-Z0-9_:-]/g, '_')
            
            if (Array.isArray(value)) {
                return value.map(item => {
                    return `${padding}<${tag}>\n${convert(item, level + 1)}\n${padding}</${tag}>`
                }).join('\n')
            } else if (typeof value === 'object' && value !== null) {
                 return `${padding}<${tag}>\n${convert(value, level + 1)}\n${padding}</${tag}>`
            } else {
                 return `${padding}<${tag}>${value}</${tag}>`
            }
        }).join('\n')
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${convert(obj, 1)}\n</${rootName}>`
  }

  const xmlOutput = computed(() => {
    if (!parsed.value) return ''
    try {
        return toXml(parsed.value)
    } catch (e) {
        return 'Error converting to XML'
    }
  })

  const copyResult = async () => {
    let content = ''
    switch (viewMode.value) {
      case 'typescript': content = typeScriptOutput.value; break
      case 'xml': content = xmlOutput.value; break
      case 'csv': content = csvOutput.value; break
      case 'code': content = input.value; break // Raw JSON
      default: content = JSON.stringify(parsed.value, null, getIndent()); break // Tree view fallback
    }
    
    await copy(content)
    toast({ title: 'Copied', description: 'Content copied to clipboard', type: 'success' })
  }

  const clear = () => {
    input.value = ''
    parsed.value = null
    error.value = null
  }

  const loadSample = () => {
    const sample = {
      "project": "Prism",
      "version": 0.15,
      "features": ["Calculator", "Converter", "Tools"],
      "settings": {
        "theme": "dark",
        "notifications": true
      },
      "users": [
        { "id": 1, "name": "Dev", "roles": ["admin", "contributor"] }
      ]
    }
    input.value = JSON.stringify(sample, null, getIndent())
    parseJson(input.value)
  }

  return {
    input,
    parsed,
    error,
    viewMode,
    indentation,
    parseJson,
    formatInput,
    minifyInput,
    typeScriptOutput,
    xmlOutput,
    csvOutput,
    copyResult,
    clear,
    loadSample
  }
}
