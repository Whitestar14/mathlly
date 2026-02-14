import { ref } from 'vue'
import QRCode from 'qrcode'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import type { QrOptions, QrContentState, QrStyle, QrEyeStyle } from '../types'

export function useQrCode() {
  const dataUrl = ref<string | null>(null)
  const svgContent = ref<string | null>(null)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const { toast } = useToast()

  // --- Content Formatting ---
  const formatContent = (content: QrContentState): string => {
    switch (content.type) {
      case 'url':
      case 'pdf':
        return content.url || content.pdf.url
      case 'wifi': {
        const enc = content.wifi.encryption === 'None' ? 'nopass' : content.wifi.encryption
        return `WIFI:T:${enc};S:${content.wifi.ssid};P:${content.wifi.password};H:${content.wifi.hidden};;`
      }
      case 'email':
        return `mailto:${content.email.to}?subject=${encodeURIComponent(content.email.subject)}&body=${encodeURIComponent(content.email.body)}`
      case 'twitter': {
        let tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.twitter.text)}`
        if (content.twitter.url) tweetUrl += `&url=${encodeURIComponent(content.twitter.url)}`
        if (content.twitter.hashtags) tweetUrl += `&hashtags=${encodeURIComponent(content.twitter.hashtags)}`
        if (content.twitter.via) tweetUrl += `&via=${encodeURIComponent(content.twitter.via)}`
        return tweetUrl
      }
      case 'app':
        if (content.app.platform === 'ios') return `https://apps.apple.com/app/id${content.app.appId}`
        if (content.app.platform === 'android') return `https://play.google.com/store/apps/details?id=${content.app.appId}`
        return content.app.appId // Universal link provided by user
      case 'crypto': {
        const prefix = content.crypto.currency === 'ethereum' ? 'ethereum:' :
          content.crypto.currency === 'solana' ? 'solana:' : 'bitcoin:'
        let cryptoUri = `${prefix}${content.crypto.address}`
        if (content.crypto.amount || content.crypto.label) {
          cryptoUri += '?'
          const params = []
          if (content.crypto.amount) params.push(`amount=${content.crypto.amount}`)
          if (content.crypto.label) params.push(`label=${encodeURIComponent(content.crypto.label)}`)
          cryptoUri += params.join('&')
        }
        return cryptoUri
      }
      case 'text':
      default:
        return content.text
    }
  }

  // --- Main Generation Logic ---
  const generate = async(contentState: QrContentState, options: QrOptions) => {
    const text = formatContent(contentState)

    if (!text.trim()) {
      dataUrl.value = null
      svgContent.value = null
      error.value = null
      return
    }

    isGenerating.value = true
    error.value = null

    try {
      // 1. Get Raw Modules
      const qrRaw = QRCode.create(text, {
        errorCorrectionLevel: (options.logo || options.backgroundImage) ? 'H' : options.errorCorrectionLevel
      })

      // 2. Render to Canvas
      await renderCanvas(qrRaw, options)

      // 3. Render to SVG
      renderSvg(qrRaw, options)
    } catch(e: any) {
      console.error('QR Generation failed:', e)
      error.value = e.message || 'Failed to generate QR code'
      dataUrl.value = null
    } finally {
      isGenerating.value = false
    }
  }

  // --- Canvas Renderer ---
  const renderCanvas = (qrRaw: any, options: QrOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Wrap logic in an IIFE to allow async
      (async() => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('No canvas context')

        const moduleCount = qrRaw.modules.size

        // Sizing Logic
        let moduleSize = options.scale
        let margin = options.margin * moduleSize

        // Handle explicit pixel size
        if (options.pixelSize && options.pixelSize > 0) {
          // totalSize = (moduleCount * size) + (marginModules * 2 * size)
          // We assume margin is defined in modules.
          const totalModules = moduleCount + (options.margin * 2)
          moduleSize = options.pixelSize / totalModules
          margin = options.margin * moduleSize
        }

        // Calculate base dimensions
        const qrSize = moduleCount * moduleSize
        const totalWidth = qrSize + (margin * 2)
        let totalHeight = totalWidth

        const hasFrame = options.frame === 'bottom-text' && options.frameText
        const frameHeight = hasFrame ? 60 : 0

        if (hasFrame) {
          totalHeight += frameHeight
        }

        canvas.width = totalWidth
        canvas.height = totalHeight

        // --- Background Logic ---
        if (options.backgroundImage) {
          try {
            const bgImg = await loadImage(options.backgroundImage)
            ctx.drawImage(bgImg, 0, 0, totalWidth, totalHeight)
          } catch {
            ctx.fillStyle = options.color.light
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
        } else {
          ctx.fillStyle = options.color.light
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // --- Draw Modules ---
        const modules = qrRaw.modules.data
        const eyeColor = options.color.eye || options.color.dark
        const dataColor = options.color.dark

        // Helper to check if a coordinate is inside a Finder Pattern (Eye) 7x7 zone
        const isFinderZone = (row: number, col: number): boolean => {
          // Top Left
          if (row < 7 && col < 7) return true
          // Top Right
          if (row < 7 && col >= moduleCount - 7) return true
          // Bottom Left
          if (row >= moduleCount - 7 && col < 7) return true
          return false
        }

        // 1. Draw Data Modules (Skip Finder Zones)
        ctx.fillStyle = dataColor
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            // Skip drawing if it's inside the 7x7 eye zones. We draw eyes separately.
            if (isFinderZone(row, col)) continue

            const idx = row * moduleCount + col
            if (modules[idx]) {
              const x = margin + col * moduleSize
              const y = margin + row * moduleSize
              drawModule(ctx, x, y, moduleSize, options.style)
            }
          }
        }

        // 2. Draw Finder Patterns (Eyes) explicitly
        ctx.fillStyle = eyeColor
        // Top Left
        drawFinderPattern(ctx, margin, margin, moduleSize, options.eyeStyle)
        // Top Right
        drawFinderPattern(ctx, margin + (moduleCount - 7) * moduleSize, margin, moduleSize, options.eyeStyle)
        // Bottom Left
        drawFinderPattern(ctx, margin, margin + (moduleCount - 7) * moduleSize, moduleSize, options.eyeStyle)

        // --- Draw Frame Text ---
        if (hasFrame) {
          ctx.fillStyle = options.frameColor || options.color.dark
          ctx.font = 'bold 24px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(options.frameText, totalWidth / 2, totalHeight - (frameHeight / 2))
        }

        // --- Composite Logo ---
        if (options.logo) {
          try {
            const logoImg = await loadImage(options.logo)
            const logoSize = totalWidth * 0.2
            const logoX = (totalWidth - logoSize) / 2
            const logoY = margin + (qrSize - logoSize) / 2

            // White background for logo to ensure contrast
            ctx.fillStyle = options.color.light
            if (options.style === 'rounded' || options.style === 'dots') {
              ctx.beginPath(); ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, 2 * Math.PI); ctx.fill()
            } else {
              ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
            }

            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
          } catch(e) {
            console.warn('Logo load failed', e)
          }
        }

        dataUrl.value = canvas.toDataURL('image/png')
        resolve()
      })().catch(reject)
    })
  }

  const drawModule = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, style: QrStyle) => {
    // Small overlap to prevent sub-pixel rendering gaps
    const drawSize = size + 0.3

    if (style === 'dots') {
      const r = size / 2
      ctx.beginPath()
      ctx.arc(x + r, y + r, r, 0, 2 * Math.PI)
      ctx.fill()
    } else if (style === 'rounded') {
      const r = size * 0.4
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, r)
      ctx.fill()
    } else {
      // Square
      ctx.fillRect(x, y, drawSize, drawSize)
    }
  }

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number, style: QrEyeStyle) => {
    const outerSize = moduleSize * 7
    const innerSize = moduleSize * 3
    const offset = moduleSize * 2 // Offset to center inner block (2 modules in from 7)

    if (style === 'circle') {
      // Outer Ring
      ctx.beginPath()
      // Outer circle (radius 3.5 modules)
      const center = outerSize / 2
      ctx.arc(x + center, y + center, outerSize / 2, 0, Math.PI * 2)
      // Subtract Inner circle (radius 2.5 modules)
      ctx.arc(x + center, y + center, outerSize / 2 - moduleSize, 0, Math.PI * 2, true)
      ctx.fill()

      // Center Dot (radius 1.5 modules)
      ctx.beginPath()
      ctx.arc(x + center, y + center, innerSize / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (style === 'rounded') {
      const rOuter = moduleSize * 2
      const rInner = moduleSize

      // Outer Box (Hollow)
      // We draw full rect then clear center is messy. Better to path it.
      // Or just draw outer, clear inner, draw center.

      ctx.beginPath()
      ctx.roundRect(x, y, outerSize, outerSize, rOuter)
      ctx.fill()

      // Clear middle band
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.roundRect(x + moduleSize, y + moduleSize, outerSize - 2 * moduleSize, outerSize - 2 * moduleSize, rOuter * 0.7)
      ctx.fill()

      // Reset composite
      ctx.globalCompositeOperation = 'source-over'

      // Inner Box
      ctx.beginPath()
      ctx.roundRect(x + offset, y + offset, innerSize, innerSize, rInner)
      ctx.fill()
    } else {
      // Square (Classic)
      // Outer Box
      ctx.fillRect(x, y, outerSize, outerSize)
      // Clear Inner
      ctx.clearRect(x + moduleSize, y + moduleSize, outerSize - 2 * moduleSize, outerSize - 2 * moduleSize)
      // Draw Center
      ctx.fillRect(x + offset, y + offset, innerSize, innerSize)
    }
  }

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // --- SVG Generator (Simplified - Only Squares for now to keep valid paths) ---
  const renderSvg = (qrRaw: any, options: QrOptions) => {
    const moduleCount = qrRaw.modules.size
    const moduleSize = options.scale
    const margin = options.margin * moduleSize

    let pathData = ''
    const modules = qrRaw.modules.data

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row * moduleCount + col]) {
          const x = margin + col * moduleSize
          const y = margin + row * moduleSize
          pathData += `M${x} ${y}h${moduleSize}v${moduleSize}h-${moduleSize}z `
        }
      }
    }

    const size = (moduleCount * moduleSize) + (margin * 2)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
       <rect width="100%" height="100%" fill="${options.color.light}"/>
       <path d="${pathData}" fill="${options.color.dark}"/>
    </svg>`

    svgContent.value = svg
  }

  const debouncedGenerate = useDebounceFn(generate, 500)

  const download = (format: 'png' | 'svg' = 'png') => {
    if (format === 'svg' && svgContent.value) {
      const blob = new Blob([svgContent.value], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      triggerDownload(url, 'qrcode.svg')
    } else if (dataUrl.value) {
      triggerDownload(dataUrl.value, 'qrcode.png')
    }
  }

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Downloaded', description: filename, type: 'success' })
  }

  return {
    dataUrl,
    svgContent,
    isGenerating,
    error,
    generate,
    debouncedGenerate,
    download
  }
}
