import type { Base64ServiceType, Base64EncodingOptions, Base64EncodingResult, IBase64Encoder, Base64DecodingOptions, Base64DecodingResult } from '../../types/base64';

/**
 * Service class for encoding data to Base64 format.
 * Implements IBase64Encoder interface, providing methods to encode text and files.
 */
export class Base64Encoder implements IBase64Encoder {
  readonly serviceType: Base64ServiceType = 'encoder';

  /**
   * Encodes a text string to Base64 format with specified options.
   * @param text - The text string to encode.
   * @param options - Encoding options including format, line length, and whitespace preservation.
   * @returns A promise resolving to the encoding result with encoded string and size metrics.
   */
  async encode(text: string, options: Base64EncodingOptions): Promise<Base64EncodingResult> {
    const processed = options.preserveWhitespace ? text : text.trim();
    const originalSize = new Blob([processed]).size;

    const blob = new Blob([processed], { type: 'text/plain' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const formatted = this.applyFormat(base64, options);
        const encodedSize = new Blob([formatted]).size;
        resolve({
          encoded: formatted,
          originalSize,
          encodedSize
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Encodes a file to Base64 format with specified options.
   * @param file - The file to encode.
   * @param options - Encoding options including format, line length, and whitespace preservation.
   * @returns A promise resolving to the encoding result with encoded string and size metrics.
   */
  async encodeFromFile(file: File, options: Base64EncodingOptions): Promise<Base64EncodingResult> {
    const originalSize = file.size;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binaryString);
        const formatted = this.applyFormat(base64, options);
        const encodedSize = new Blob([formatted]).size;
        resolve({
          encoded: formatted,
          originalSize,
          encodedSize
        });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Processes input by encoding it, for interface compliance.
   * @param input - The text string to encode.
   * @param options - Encoding options (cast to Base64EncodingOptions).
   * @returns A promise resolving to the encoding result.
   */
  async process(input: string, options: Base64EncodingOptions | Base64DecodingOptions): Promise<Base64EncodingResult | Base64DecodingResult> {
    return this.encode(input, options as Base64EncodingOptions);
  }

  /**
   * Applies formatting to the base64 string based on options.
   * @private
   * @param base64 - The raw base64 string.
   * @param options - Encoding options.
   * @returns The formatted base64 string.
   */
  private applyFormat(base64: string, options: Base64EncodingOptions): string {
    if (options.outputFormat === 'url-safe') {
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } else if (options.outputFormat === 'mime') {
      return this.chunkString(base64, options.lineLength);
    }
    return base64;
  }

  /**
   * Chunks a string into lines of specified length.
   * @private
   * @param str - The string to chunk.
   * @param length - The length of each chunk.
   * @returns The chunked string.
   */
  private chunkString(str: string, length: number): string {
    const chunks = [];
    for (let i = 0; i < str.length; i += length) {
      chunks.push(str.slice(i, i + length));
    }
    return chunks.join('\n');
  }
}