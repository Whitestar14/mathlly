import type { RGB } from './index'

export interface ColorFrequency {
  color: RGB;
  count: number;
}

export function rgbDistance(c1: RGB, c2: RGB): number {
  const dr = c1.r - c2.r
  const dg = c1.g - c2.g
  const db = c1.b - c2.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

export function extractDominantColors(imageData: ImageData, maxColors: number = 8): RGB[] {
  const { data, width, height } = imageData
  const step = 5 // Sample every 5th pixel
  const frequencyMap = new Map<string, ColorFrequency>()

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      const qr = Math.round(r / 10) * 10
      const qg = Math.round(g / 10) * 10
      const qb = Math.round(b / 10) * 10
      const key = `${qr}-${qg}-${qb}`
      const color: RGB = { r: qr, g: qg, b: qb }
      if (frequencyMap.has(key)) {
        frequencyMap.get(key)!.count++
      } else {
        frequencyMap.set(key, { color, count: 1 })
      }
    }
  }

  const sorted = Array.from(frequencyMap.values()).sort((a, b) => b.count - a.count)

  const result: RGB[] = []
  for (const freq of sorted) {
    const { color } = freq
    const sum = color.r + color.g + color.b
    if (sum < 30 || sum > 735) continue // Filter very dark or light
    const isSimilar = result.some(existing => rgbDistance(existing, color) < 30)
    if (!isSimilar) {
      result.push(color)
      if (result.length >= maxColors) break
    }
  }

  return result
}

export function resizeImage(img: HTMLImageElement, maxWidth: number, maxHeight: number): { width: number; height: number } {
  const aspectRatio = img.width / img.height
  let newWidth = maxWidth
  let newHeight = maxHeight

  if (aspectRatio > maxWidth / maxHeight) {
    newHeight = maxWidth / aspectRatio
  } else {
    newWidth = maxHeight * aspectRatio
  }

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight)
  }
}
