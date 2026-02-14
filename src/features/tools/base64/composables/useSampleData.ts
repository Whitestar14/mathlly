export function useSampleData() {
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

  const loadSampleText = (): string => {
    const samples = [
      '   Indented Text   \n\tWith Tabs and Newlines\n', // Dirty sample
      'Hello, World!',
      'Vue.js + TypeScript = ❤️',
      'The quick brown fox jumps over the lazy dog.'
    ]
    return pick(samples)
  }

  const loadSampleBase64 = (): string => {
    // A small 1x1 Red Dot (PNG)
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  }

  const generateRandomData = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let s = ''
    for (let i = 0; i < 64; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
    return s
  }

  return { loadSampleText, loadSampleBase64, generateRandomData }
}
