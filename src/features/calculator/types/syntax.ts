export interface Token {
  type: string
  content: string
  parentLevel?: number
}

export interface FormattedPart {
  type: string
  content: string
  level: number
}

export interface FormatOptions {
  base?: string
  mode?: string
  options?: Record<string, any> // Calculator options from toolSettings
}

export type TokenType =
  | 'number' |
  'operator' |
  'function' |
  'parenthesis' |
  'constant' |
  'decimal' |
  'space' |
  'text' |
  'open' |
  'close' |
  'ghost'
