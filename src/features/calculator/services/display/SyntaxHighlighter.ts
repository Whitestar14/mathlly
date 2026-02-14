import { CacheManager } from '@utils/cache/CacheManager'
import { TokenUtils } from '@calculator/utils/syntax/TokenUtils'
import { FunctionUtils } from '@calculator/utils/syntax/FunctionUtils'
import { CacheUtils } from '@calculator/utils/syntax/CacheUtils'
import type { ParenTracker } from '@calculator/utils/core/ParenTracker'
import type { Token, FormattedPart, FormatOptions } from '@calculator/types/syntax'

export class SyntaxHighlighter {
  private static readonly CACHE_KEY = 'syntax-highlighting'
  private static cache = CacheManager.getCache<Token[]>(this.CACHE_KEY, 100)

  /**
   * Format an expression with both parentheses and syntax highlighting
   */
  static format(
    expr: string,
    parenthesesTracker: ParenTracker | null,
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

    const parts = this.formatParentheses(expr, options)

    const result = syntaxHighlightingEnabled ?
      this.applySyntaxHighlighting(parts, options) :
      parts.map(part => TokenUtils.createToken(part.content, part.type as any, part.level))

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
        const tokens = this.tokenizeWithSyntax(part.content, options)
        for (const token of tokens) {
          result.push(TokenUtils.createToken(token.content, token.type as any, part.level))
        }
      } else {
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

      if (options.mode === 'Scientific' && TokenUtils.isScientificOperator(char)) return true
      return false
    }

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i]
      const nextChar = expr[i + 1]

      if (char === '(' || char === '|') {
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i)
          if (beforeText) parts.push({ type: 'text', content: beforeText, level: nestLevel })
        }

        parts.push({ type: 'open', content: char, level: nestLevel })
        currentIndex = i + 1
        nestLevel++
      } else if (char === ')' || (char === '|' && nestLevel > 0)) {
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i)
          if (content) parts.push({ type: 'text', content: content, level: nestLevel })
        }

        nestLevel--
        parts.push({ type: 'close', content: char, level: nestLevel })
        currentIndex = i + 1
      } else if (isOperator(char, nextChar)) {
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i)
          if (beforeOp) parts.push({ type: 'text', content: beforeOp, level: nestLevel })
        }

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

    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex)
      if (remaining) parts.push({ type: 'text', content: remaining, level: nestLevel })
    }

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

    const isDigit = (c: string) => c >= '0' && c <= '9'
    const isDot = (c: string) => c === '.'

    let i = 0
    while (i < text.length) {
      const char = text[i]
      const next = text[i + 1]

      if (TokenUtils.isWhitespace(char)) {
        tokens.push({ type: 'space', content: ' ' })
        i++
        continue
      }

      if (isScientificMode && FunctionUtils.isScientificFunction(text, i)) {
        const func = FunctionUtils.extractFunction(text, i)
        tokens.push({ type: 'function', content: func })
        i += func.length
        continue
      }

      const modulo = FunctionUtils.extractModulo(text, i)
      if (modulo) {
        tokens.push({ type: 'operator', content: modulo })
        i += modulo.length
        continue
      }

      if (isDigit(char)) {
        let num = ''
        while (i < text.length && isDigit(text[i])) {
          num += text[i++]
        }
        tokens.push({ type: 'number', content: num })
        continue
      }

      if (isDot(char)) {
        tokens.push({ type: 'decimal', content: '.' })
        i++
        continue
      }

      if (isProgrammerMode && TokenUtils.isShiftOperator(char, next)) {
        tokens.push({ type: 'operator', content: char + next })
        i += 2
        continue
      }

      if (TokenUtils.isStandardOperator(char) || TokenUtils.isProgrammerOperator(char)) {
        tokens.push({ type: 'operator', content: char })
        i++
        continue
      }

      if (isScientificMode && TokenUtils.isScientificOperator(char)) {
        tokens.push({ type: 'operator', content: char })
        i++
        continue
      }

      if (TokenUtils.isParenthesis(char)) {
        tokens.push({ type: 'parenthesis', content: char })
        i++
        continue
      }

      if (isScientificMode && TokenUtils.isScientificConstant(char)) {
        tokens.push({ type: 'constant', content: char })
        i++
        continue
      }

      if (isScientificMode && TokenUtils.isScientificSymbol(char)) {
        tokens.push({ type: 'function', content: char })
        i++
        continue
      }

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
