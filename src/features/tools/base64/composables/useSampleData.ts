export function useSampleData() {
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

  const loadSampleText = (): string => {
    const samples = [
      'Hello, World! This is a sample text for Base64 encoding.',
      'Base64 is a group of binary-to-text encoding schemes.',
      'Mathlly/Prism is an awesome tool!',
      'Vue.js is a progressive JavaScript framework.',
      'TypeScript extends JavaScript by adding types.'
    ]
    return pick(samples)
  }

  const loadSampleBase64 = (): string => {
    const samples = [
      'SGVsbG8sIFdvcmxkIQ==',
      'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4=',
      'QmFzZTY0IGlzIGEgZ3JvdXAgb2YgYmluYXJ5LXRvLXRleHQgZW5jb2Rpbmcgc2NoZW1lcy4=',
      'TWF0aGxseSBpcyBhbiBhd2Vzb21lIHRvb2wh',
      'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4='
    ]
    return pick(samples)
  }

  const generateRandomData = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    let s = ''
    for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
    return s
  }

  return { loadSampleText, loadSampleBase64, generateRandomData }
}
