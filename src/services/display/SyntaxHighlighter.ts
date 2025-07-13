import { CacheManager } from '@/services/cache/CacheManager'
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants'
import type { ParenthesesTracker } from '@/utils/core/ParenthesesTracker'

interface Token {
  type: string
  content: string
  parentLevel?: number
}

interface FormattedPart {
  type: string
  content: string
  level: number
}

interface FormatOptions {
  base?: string
  mode?: string
  options?: Record<string, any> // Calculator options from toolSettings
}

export class SyntaxHighlighter {
  private static readonly CACHE_KEY = 'syntax-highlighting'
  private static cache = CacheManager.getCache<Token[]>(this.CACHE_KEY, 100)
  
  /**
   * Format an expression with both parentheses and syntax highlighting
   */
  static format(
    expr: string, 
    parenthesesTracker: ParenthesesTracker | null, 
    syntaxHighlightingEnabled: boolean = true,
    options: FormatOptions = {}
  ): Token[] {
    if (!expr) {
      return [{ type: 'text', content: '0' }]
    }
    
    // Include calculator options in cache key for proper invalidation
    const optionsKey = options.options ? JSON.stringify(options.options) : ''
    const cacheKey = `${expr}-${parenthesesTracker?.getOpenCount() || 0}-${syntaxHighlightingEnabled}-${options.mode || 'Standard'}-${options.base || 'DEC'}-${optionsKey}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // First format parentheses (including ghost parentheses)
    const parts = this.formatParentheses(expr, options)

    // Then apply syntax highlighting if enabled
    const result = syntaxHighlightingEnabled 
      ? this.applySyntaxHighlighting(parts, options)
      : parts.map(part => ({ type: part.type, content: part.content, parentLevel: part.level }))
    
    this.cache.set(cacheKey, result)
    return result
  }
  
  /**
   * Apply syntax highlighting to formatted parts
   */
  static applySyntaxHighlighting(parts: FormattedPart[], options: FormatOptions = {}): Token[] {
    const result: Token[] = []
    
    for (const part of parts) {
      if (part.type === 'text') {
        // Tokenize the text content while preserving whitespace
        const tokens = this.tokenizeWithSyntax(part.content, options)
        for (const token of tokens) {
          result.push({
            ...token,
            parentLevel: part.level
          })
        }
      } else {
        // Keep parentheses, ghost, open, close as-is
        result.push({
          type: part.type,
          content: part.content,
          parentLevel: part.level
        })
      }
    }
    
    return result
  }
  
  /**
   * Format an expression with parentheses (including ghost parentheses)
   */
  static formatParentheses(expr: string, options: FormatOptions = {}): FormattedPart[] {
    const parts: FormattedPart[] = []
    let currentIndex = 0
    let nestLevel = 0
    
    const { REGEX } = CalculatorConstants
    
    const isOperator = (char: string, nextChar?: string): boolean => {
      if (REGEX.OPERATOR.test(char)) return true
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) return true
      // Scientific mode: handle power operator
      if (options.mode === 'Scientific' && char === '^') return true
      return false
    }
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i]
      const nextChar = expr[i + 1]

      if (char === '(' || char === '|') {
        // Add text before opening parenthesis
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i)
          if (beforeText) parts.push({ type: 'text', content: beforeText, level: nestLevel })
        }
        
        parts.push({ type: 'open', content: char, level: nestLevel })
        currentIndex = i + 1
        nestLevel++
      } else if (char === ')' || (char === '|' && nestLevel > 0)) {
        // Add text before closing parenthesis
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i)
          if (content) parts.push({ type: 'text', content: content, level: nestLevel })
        }
        
        nestLevel--
        parts.push({ type: 'close', content: char, level: nestLevel })
        currentIndex = i + 1
      } else if (isOperator(char, nextChar)) {
        // Add text before operator
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i)
          if (beforeOp) parts.push({ type: 'text', content: beforeOp, level: nestLevel })
        }
        
        // Add operator with spaces
        if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i + 2)} `, level: nestLevel })
          i++
        } else {
          parts.push({ type: 'text', content: ` ${char} `, level: nestLevel })
        }
        currentIndex = i + 1
      }
    }
  
    // Add remaining text
    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex)
      if (remaining) parts.push({ type: 'text', content: remaining, level: nestLevel })
    }
  
    // Add ghost parentheses for unclosed parentheses
    while (nestLevel > 0) {
      nestLevel--
      parts.push({ type: 'ghost', content: ')', level: nestLevel })
    }
  
    return parts
  }
  
  /**
   * Tokenize text content while preserving whitespace structure
   */
  private static tokenizeWithSyntax(text: string, options: FormatOptions): Token[] {
    if (!text) return []
    
    const tokens: Token[] = []
    const { REGEX, BUTTON_TYPES } = CalculatorConstants
    const isScientificMode = options.mode === 'Scientific'
    const isProgrammerMode = options.mode === 'Programmer'
    
    let i = 0
    while (i < text.length) {
      const char = text[i]
      const nextChar = text[i + 1]
      
      // Preserve whitespace
      if (char === ' ') {
        tokens.push({ type: 'space', content: ' ' })
        i++
        continue
      }
      
      // Handle numbers (including decimals in one token)
      if (REGEX.NUMBER.test(char)) {
        let number = ''
        while (i < text.length && (REGEX.NUMBER.test(text[i]) || text[i] === '.')) {
          number += text[i++]
        }
        tokens.push({ type: 'number', content: number })
        continue
      }
      
      // Handle decimal points separately (when not part of a number)
      if (char === '.') {
        tokens.push({ type: 'decimal', content: '.' })
        i++
        continue
      }
      
      // Handle shift operators (programmer mode)
      if (isProgrammerMode && ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>'))) {
        tokens.push({ type: 'operator', content: char + nextChar })
        i += 2
        continue
      }
      
      // Handle standard operators
      if (BUTTON_TYPES.OPERATORS.includes(char as any) || 
          BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char as any)) {
        tokens.push({ type: 'operator', content: char })
        i++
        continue
      }
      
      // Handle scientific operators
      if (isScientificMode && (char === '^' || char === '!')) {
        tokens.push({ type: 'operator', content: char })
        i++
        continue
      }
      
      // Handle parentheses and absolute value bars
      if ('()|'.includes(char)) {
        tokens.push({ type: 'parenthesis', content: char })
        i++
        continue
      }
      
      // Handle scientific constants
      if (isScientificMode && (char === 'π' || char === 'e')) {
        tokens.push({ type: 'constant', content: char })
        i++
        continue
      }
      
      // Handle scientific symbols
      if (isScientificMode && (char === '√' || char === '∛')) {
        tokens.push({ type: 'function', content: char })
        i++
        continue
      }
      
      // Handle scientific functions (sin, cos, tan, log, etc.)
      if (isScientificMode && this.isScientificFunction(text, i)) {
        const func = this.extractFunction(text, i)
        tokens.push({ type: 'function', content: func })
        i += func.length
        continue
      }
      
      // Handle modulo operator
      if (text.substr(i, 3) === 'mod') {
        tokens.push({ type: 'operator', content: 'mod' })
        i += 3
        continue
      }
      
      // Default case - treat as text
      tokens.push({ type: 'text', content: char })
      i++
    }
    
    return tokens
  }
  
  /**
   * Check if current position starts a scientific function
   */
  private static isScientificFunction(text: string, index: number): boolean {
    const functions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'ln', 'sqrt', 'cbrt', 'abs', 'floor', 'ceil',
      'round', 'exp', 'pow'
    ]
    
    return functions.some(func => {
      const substr = text.substr(index, func.length)
      const nextChar = text[index + func.length]
      // Make sure it's a complete function name (followed by '(' or end of string)
      return substr === func && (nextChar === '(' || nextChar === undefined || nextChar === ' ')
    })
  }
  
  /**
   * Extract function name from current position
   */
  private static extractFunction(text: string, index: number): string {
    const functions = [
      'asinh', 'acosh', 'atanh', // Check longer functions first
      'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh',
      'sqrt', 'cbrt', 'floor', 'ceil', 'round',
      'sin', 'cos', 'tan', 'log', 'exp', 'pow', 'abs'
    ]
    
    for (const func of functions) {
      const substr = text.substr(index, func.length)
      const nextChar = text[index + func.length]
      if (substr === func && (nextChar === '(' || nextChar === undefined || nextChar === ' ')) {
        return func
      }
    }
    
    return text[index]
  }
  
  /**
   * Clear cache when calculator options change
   */
  static clearCache(): void {
    this.cache.clear()
  }
}
