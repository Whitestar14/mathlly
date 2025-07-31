import { format } from "mathjs"

/**
 * Format options interface for mathjs
 */
interface FormatOptions {
  notation?: "fixed" | "exponential" | "engineering" | "auto" | "hex" | "bin" | "oct"
  precision?: number
}

/**
 * Base calculator class with common functionality
 */
abstract class BaseCalculator {
  protected invalidCharsRegex!: RegExp
  protected validCharsRegex!: RegExp
  protected formatOptions!: FormatOptions
  protected prefixRegex!: RegExp
  protected maxInputLength: number = 100

  constructor() {
    // Subclasses will initialize these properties
  }

  sanitizeInput(expr: string): string {
    const sanitized = expr.replace(this.invalidCharsRegex, "")
    return sanitized.replace(/^[+×÷]/, "").slice(0, this.maxInputLength)
  }

  formatResult(result: any): string {
    return format(result, this.formatOptions).replace(this.prefixRegex, "")
  }

  isValidChar(char: string): boolean {
    return this.validCharsRegex.test(char)
  }
}

export class HexCalculator extends BaseCalculator {
  constructor() {
    super()
    this.invalidCharsRegex = /[^0-9A-Fa-f+\-×÷]/g
    this.validCharsRegex = /^[0-9A-Fa-f]$/
    this.formatOptions = { notation: "hex" }
    this.prefixRegex = /^0x/i
  }
}

export class DecCalculator extends BaseCalculator {
  constructor() {
    super()
    this.invalidCharsRegex = /[^0-9+\-×÷]/g
    this.validCharsRegex = /^[0-9]$/
    this.formatOptions = { notation: "fixed", precision: 0 }
    this.prefixRegex = /^/
  }
}

export class OctCalculator extends BaseCalculator {
  constructor() {
    super()
    this.invalidCharsRegex = /[^0-7+\-×÷]/g
    this.validCharsRegex = /^[0-7]$/
    this.formatOptions = { notation: "oct" }
    this.prefixRegex = /^0o/i
  }
}

export class BinCalculator extends BaseCalculator {
  constructor() {
    super()
    this.invalidCharsRegex = /[^01+\-×÷]/g
    this.validCharsRegex = /^[01]$/
    this.formatOptions = { notation: "bin" }
    this.prefixRegex = /^0b/i
  }
}
