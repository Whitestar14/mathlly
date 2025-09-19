import { type Ref } from 'vue';

export function useSampleData(input: Ref<string>, selectedFileName: Ref<string>) {
  const loadSampleText = (): void => {
    const sampleTexts = [
      "Hello, World! This is a sample text for Base64 encoding.",
      "The quick brown fox jumps over the lazy dog. 🦊",
      "Base64 is a group of binary-to-text encoding schemes.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ];
    
    input.value = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    selectedFileName.value = "";
  };

  const loadSampleBase64 = (): void => {
    const sampleBase64s = [
      "SGVsbG8sIFdvcmxkIQ==",
      "VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4=",
      "QmFzZTY0IGlzIGEgZ3JvdXAgb2YgYmluYXJ5LXRvLXRleHQgZW5jb2Rpbmcgc2NoZW1lcy4=",
      "TWF0aGxseSBpcyBhbiBhd2Vzb21lIHRvb2wh"
    ];
    
    input.value = sampleBase64s[Math.floor(Math.random() * sampleBase64s.length)];
    selectedFileName.value = "";
  };

  const generateRandomData = (): void => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const length = Math.floor(Math.random() * 200) + 50;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    input.value = result;
    selectedFileName.value = "";
  };

  return {
    loadSampleText,
    loadSampleBase64,
    generateRandomData
  };
}