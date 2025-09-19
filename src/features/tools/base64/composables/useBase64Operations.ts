import { ref, computed, type Ref } from 'vue';
import { Base64Options, TextStats, Base64ProcessingResult } from '../types/base64';

export function useBase64Operations(
  input: Ref<string>,
  options: Ref<Base64Options>
) {
  const output = ref('');
  const isProcessing = ref(false);
  const validationError = ref('');

  const inputStats = computed((): TextStats => ({
    characters: input.value.length,
    bytes: new Blob([input.value]).size,
    lines: input.value.split('\n').length
  }));

  const outputStats = computed((): TextStats => ({
    characters: output.value.length,
    bytes: new Blob([output.value]).size,
    lines: output.value.split('\n').length
  }));

  const isValidBase64 = computed((): boolean => {
    if (!input.value.trim()) return true;
    
    try {
      const cleanInput = input.value.replace(/\s/g, '');
      const base64Regex = new RegExp('^[A-Za-z0-9+\\/\\-_]*={0,2}$');
      
      if (!base64Regex.test(cleanInput)) return false;
      if (options.value.outputFormat !== 'url-safe' && cleanInput.length % 4 !== 0) return false;
      
      // Try decoding after normalizing URL-safe characters
      atob(cleanInput.replace(/-/g, '+').replace(/_/g, '/'));
      return true;
    } catch {
      return false;
    }
  });

  const compressData = async (data: string): Promise<string> => {
    if (options.value.compressionLevel === 'none') return data;
    
    try {
      const compressed = new TextEncoder().encode(data);
      return new TextDecoder().decode(compressed);
    } catch (error) {
      console.warn("Compression failed:", error);
      return data;
    }
  };

  const encodeToBase64 = async (text: string): Promise<string> => {
    try {
      const processedText = options.value.preserveWhitespace ? text : text.trim();
      const compressedText = await compressData(processedText);

      // Properly convert Unicode string to a binary string for btoa
      const bytes = new TextEncoder().encode(compressedText);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      let encoded = btoa(binary);

      switch (options.value.outputFormat) {
        case 'url-safe':
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
          break;
        case 'mime': {
          const chunks = encoded.match(new RegExp(`.{1,${options.value.lineLength}}`, 'g')) || [];
          encoded = chunks.join('\n');
          break;
        }
      }

      return encoded;
    } catch {
      throw new Error("Failed to encode text");
    }
  };

  const decodeFromBase64 = async (base64: string): Promise<string> => {
    try {
      let cleanBase64 = base64.replace(/\s/g, '');

      // Normalize URL-safe to standard chars
      cleanBase64 = cleanBase64.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if missing
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new TextDecoder().decode(bytes);
    } catch {
      throw new Error("Invalid Base64 string");
    }
  };

  const processInput = async (currentTab: 'encode' | 'decode'): Promise<Base64ProcessingResult> => {
    if (!input.value.trim()) {
      output.value = "";
      return { success: true };
    }

    isProcessing.value = true;
    
    try {
      if (currentTab === "encode") {
        output.value = await encodeToBase64(input.value);
      } else {
        if (!isValidBase64.value) {
          throw new Error("Invalid Base64 format");
        }
        output.value = await decodeFromBase64(input.value);
      }
      
      return { success: true, output: output.value };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Processing failed";
      output.value = "";
      return { success: false, error: errorMessage };
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    output,
    isProcessing,
    validationError,
    inputStats,
    outputStats,
    isValidBase64,
    processInput
  };
}