import { CacheManager } from '@utils/cache/CacheManager'
import { TokenUtils } from '@calculator/utils/syntax/TokenUtils'
import { FunctionUtils } from '@calculator/utils/syntax/FunctionUtils'
import { CacheUtils } from '@calculator/utils/syntax/CacheUtils'
import type { ParenthesesTracker } from '@calculator/utils/core/ParenthesesTracker'
import type { Token, FormattedPart, FormatOptions } from '@calculator/types/syntax'

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
      return [TokenUtils.createToken('0', 'text')]
    }
    
    const cacheKey = CacheUtils.generateCacheKey(
      expr,
      parenthesesTracker?.getOpenCount() || 0,
      syntaxHighlightingEnabled,
      options
    )
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // First format parentheses (including ghost parentheses)
    const parts = this.formatParentheses(expr, options)

    // Then apply syntax highlighting if enabled
    const result = syntaxHighlightingEnabled 
      ? this.applySyntaxHighlighting(parts, options)
      : parts.map(part => TokenUtils.createToken(part.content, part.type as any, part.level))
    
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
          result.push(TokenUtils.createToken(token.content, token.type as any, part.level))
        }
      } else {
        // Keep parentheses, ghost, open, close as-is
        result.push(TokenUtils.createToken(part.content, part.type as any, part.level))
      }
    }
    
    return result
  }
  
  /**
   * Helper function to detect if an operator is unary (negative sign) rather than binary.
   * Unary operators (negative signs) should not have spaces to improve readability and match mathematical notation conventions.
   */
  static isUnaryOperator(expr: string, i: number): boolean {
    const char = expr[i]
    if (char !== '-') return false
    
    let prevChar: string | undefined
    if (i > 0) {
      prevChar = expr[i - 1]
      // If previous character is space, find the actual previous non-space character
      if (prevChar === ' ') {
        let j = i - 2
        while (j >= 0 && expr[j] === ' ') j--
        prevChar = j >= 0 ? expr[j] : undefined
      }
    }
    
    if (prevChar === undefined) return true
    if (TokenUtils.isStandardOperator(prevChar)) return true
    if (prevChar === '(' || prevChar === '|') return true
    return false
  }
  
  /**
   * Format an expression with parentheses (including ghost parentheses)
   */
  static formatParentheses(expr: string, options: FormatOptions = {}): FormattedPart[] {
    const parts: FormattedPart[] = []
    let currentIndex = 0
    let nestLevel = 0
    
    const isOperator = (char: string, nextChar?: string): boolean => {
      if (TokenUtils.isStandardOperator(char)) return true
      if (TokenUtils.isProgrammerOperator(char) || TokenUtils.isShiftOperator(char, nextChar)) return true
      // Scientific mode: handle power operator
      if (options.mode === 'Scientific' && TokenUtils.isScientificOperator(char)) return true
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
        
        // Add operator with spaces (unless unary)
        const isUnary = this.isUnaryOperator(expr, i)
        if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i + 2)} `, level: nestLevel })
          i++
        } else {
          if (isUnary) {
            parts.push({ type: 'text', content: char, level: nestLevel })
          } else {
            parts.push({ type: 'text', content: ` ${char} `, level: nestLevel })
          }
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
  const isScientificMode = options.mode === 'Scientific'
  const isProgrammerMode = options.mode === 'Programmer'
  
  let i = 0
  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1]
    
    // Preserve whitespace
    if (TokenUtils.isWhitespace(char)) {
      tokens.push({ type: 'space', content: ' ' })
      i++
      continue
    }
    
    // Handle scientific functions FIRST (before checking individual characters)
    if (isScientificMode && FunctionUtils.isScientificFunction(text, i)) {
      const func = FunctionUtils.extractFunction(text, i)
      tokens.push({ type: 'function', content: func })
      i += func.length
      continue
    }
    
    // Handle modulo operator BEFORE other character checks
    const modulo = FunctionUtils.extractModulo(text, i)
    if (modulo) {
      tokens.push({ type: 'operator', content: modulo })
      i += modulo.length
      continue
    }
    
    // Handle numbers (including decimals in one token)
    if (TokenUtils.isNumber(char)) {
      let number = ''
      while (i < text.length && (TokenUtils.isNumber(text[i]) || TokenUtils.isDecimal(text[i]))) {
        number += text[i++]
      }
      tokens.push({ type: 'number', content: number })
      continue
    }
    
    // Handle decimal points separately (when not part of a number)
    if (TokenUtils.isDecimal(char)) {
      tokens.push({ type: 'decimal', content: '.' })
      i++
      continue
    }
    
    // Handle shift operators (programmer mode)
    if (isProgrammerMode && TokenUtils.isShiftOperator(char, nextChar)) {
      tokens.push({ type: 'operator', content: char + nextChar })
      i += 2
      continue
    }
    
    // Handle standard and programmer operators
    if (TokenUtils.isStandardOperator(char) || TokenUtils.isProgrammerOperator(char)) {
      tokens.push({ type: 'operator', content: char })
      i++
      continue
    }
    
    // Handle scientific operators
    if (isScientificMode && TokenUtils.isScientificOperator(char)) {
      tokens.push({ type: 'operator', content: char })
      i++
      continue
    }
    
    // Handle parentheses and absolute value bars
    if (TokenUtils.isParenthesis(char)) {
      tokens.push({ type: 'parenthesis', content: char })
      i++
      continue
    }
    
    // Handle scientific constants (AFTER function check to avoid conflicts)
    if (isScientificMode && TokenUtils.isScientificConstant(char)) {
      tokens.push({ type: 'constant', content: char })
      i++
      continue
    }
    
    // Handle scientific symbols
    if (isScientificMode && TokenUtils.isScientificSymbol(char)) {
      tokens.push({ type: 'function', content: char })
      i++
      continue
    }
    
    // Default case - treat as text
    tokens.push({ type: 'text', content: char })
    i++
  }
  
  return tokens
}
  
  /**
   * Clear cache when calculator options change
   */
  static clearCache(): void {
    this.cache.clear()
  }
}