import { generateTypeScript } from '../utils/typeGenerator'

type WorkerMessage = 
  | { type: 'PROCESS'; code: string; indent: number | string }
  | { type: 'FORMAT'; code: string; indent: number | string }
  | { type: 'MINIFY'; code: string }

// --- Helper Functions (Moved from Composable) ---

function getIndentString(indent: number | string): string {
    return typeof indent === 'string' ? '\t' : ' '.repeat(indent)
}

function toXml(obj: any, indentVal: number | string): string {
    const indentStr = getIndentString(indentVal)
    
    const convert = (data: any, level = 0): string => {
        const padding = indentStr.repeat(level)
            
        if (data === null) return ''
        
        if (typeof data !== 'object') {
            return String(data)
        }

        if (Array.isArray(data)) {
            return data.map(item => {
                return `${padding}<item>\n${convert(item, level + 1)}\n${padding}</item>`
            }).join('\n')
        }

        return Object.entries(data).map(([key, value]) => {
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

    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${convert(obj, 1)}\n</root>`
}

function toCsv(obj: any): string {
    const data = Array.isArray(obj) ? obj : [obj]
    if (data.length === 0) return ''

    // Collect all unique keys
    const headers = Array.from(new Set(
      data.reduce((acc: string[], item: any) => {
        if (typeof item === 'object' && item !== null) {
          return [...acc, ...Object.keys(item)]
        }
        return acc
      }, [])
    )) as string[]

    const csvRows = [
      headers.join(','),
      ...data.map((row: any) => {
        return headers.map(fieldName => {
          const val = row[fieldName]
          if (val === null || val === undefined) return ''
          const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val)
          if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`
          }
          return stringVal
        }).join(',')
      })
    ]

    return csvRows.join('\n')
}

// --- Message Handler ---

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, code } = e.data

    try {
        if (type === 'PROCESS') {
            if (!code.trim()) {
                self.postMessage({ type: 'PROCESS_SUCCESS', payload: null })
                return
            }

            const parsed = JSON.parse(code)
            const indent = e.data.indent

            // Run conversions
            let ts = ''
            let xml = ''
            let csv = ''

            try { ts = generateTypeScript(parsed) } catch (err) { ts = '// Error generating TypeScript' }
            try { xml = toXml(parsed, indent) } catch (err) { xml = '<!-- Error generating XML -->' }
            try { csv = toCsv(parsed) } catch (err) { csv = 'Error generating CSV' }

            self.postMessage({
                type: 'PROCESS_SUCCESS',
                payload: {
                    parsed,
                    ts,
                    xml,
                    csv
                }
            })
        } 
        
        else if (type === 'FORMAT') {
            if (!code.trim()) return
            const parsed = JSON.parse(code)
            const indentVal = typeof e.data.indent === 'string' ? '\t' : Number(e.data.indent)
            const formatted = JSON.stringify(parsed, null, indentVal)
            self.postMessage({ type: 'FORMAT_SUCCESS', result: formatted })
        }

        else if (type === 'MINIFY') {
            if (!code.trim()) return
            const parsed = JSON.parse(code)
            const minified = JSON.stringify(parsed)
            self.postMessage({ type: 'MINIFY_SUCCESS', result: minified })
        }

    } catch (error: any) {
        let line = 0
        const msg = error.message || 'Unknown Error'
        const match = msg.match(/position\s+(\d+)/)
        if (match) {
            const pos = parseInt(match[1], 10)
            line = code.substring(0, pos).split('\n').length
        }
        
        self.postMessage({ 
            type: 'ERROR', 
            error: { message: msg, line } 
        })
    }
}
