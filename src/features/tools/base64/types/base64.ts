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
  preserveMode: boolean;
  autoProcess: boolean;
  validateInput: boolean;
  showCharacterCount: boolean;
}

export interface Base64ProcessingResult {
  success: boolean;
  output?: string;
  binary?: Uint8Array;
  mime?: string | null;
  isBinary?: boolean;
  error?: string;
}

export type Base64Tab = 'encode' | 'decode';

export interface Base64State {
  currentTab: Base64Tab;
  selectedFileName: string;
  activePreviewUrl: string | null;
  singleInput: string;
  encodeBuffer: string;
  decodeBuffer: string;
  isFileProcessing: boolean;
  outputValidationError: string;
}

export type Base64StateUpdates = Partial<Base64State>;

export type Base64ServiceType = 'encoder' | 'decoder';

export interface Base64EncodingOptions {
  outputFormat: 'standard' | 'url-safe' | 'mime';
  lineLength: number;
  preserveWhitespace: boolean;
}

export interface Base64DecodingOptions {
  detectBinary: boolean;
  detectMimeType: boolean;
}

export interface Base64EncodingResult {
  encoded: string;
  originalSize: number;
  encodedSize: number;
}

export interface Base64DecodingResult extends Base64ProcessingResult {
  decoded: string;
  binary?: Uint8Array;
  mime?: string | null;
  isBinary: boolean;
  originalSize: number;
  decodedSize: number;
}

export interface IBase64Service {
  readonly serviceType: Base64ServiceType;
  process(input: string, options: Base64EncodingOptions | Base64DecodingOptions): Promise<Base64EncodingResult | Base64DecodingResult>;
}

export interface IBase64Encoder extends IBase64Service {
  encode(text: string, options: Base64EncodingOptions): Promise<Base64EncodingResult>;
  encodeFromFile(file: File, options: Base64EncodingOptions): Promise<Base64EncodingResult>;
}

export interface IBase64Decoder extends IBase64Service {
  decode(base64: string, options: Base64DecodingOptions): Promise<Base64DecodingResult>;
  validate(base64: string): boolean;
}