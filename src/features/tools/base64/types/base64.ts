export interface Tab {
  value: 'encode' | 'decode';
  label: string;
}

export interface TextStats {
  characters: number;
  bytes: number;
  lines: number;
}

export interface Base64Options {
  outputFormat: 'standard' | 'url-safe' | 'mime';
  lineLength: number;
  preserveWhitespace: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  autoProcess: boolean;
  validateInput: boolean;
  showCharacterCount: boolean;
  handleBinaryFiles: boolean;
}

export interface Base64ProcessingResult {
  success: boolean;
  output?: string;
  error?: string;
}