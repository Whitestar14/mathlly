/**
 * Interface for parentheses group tracking
 */
interface ParenthesesGroup {
  start: number
  end?: number
  content: string
}

/**
 * Tracks parentheses in mathematical expressions
 * Provides functionality to track opening and closing parentheses
 * and maintain groups for syntax highlighting and validation
 */
export class ParenthesesTracker {
  private count: number
  private groups: ParenthesesGroup[]

  /**
   * Create a new ParenthesesTracker instance
   */
  constructor() {
    this.count = 0
    this.groups = []
  }

/**
 * Register an opening parenthesis at the given position
 * @param position - Position of the opening parenthesis
 */
open(position: number): void {
  this.count++
  this.groups.push({
    start: position,
    content: ""
  })
}

/**
 * Register a closing parenthesis at the given position
 * @param position - Position of the closing parenthesis
 * @returns True if successfully closed, false if no matching opening parenthesis
 */
close(position: number): boolean {  
  if (this.count > 0) {
    this.count--
    const group = this.groups[this.groups.length - 1]
    if (group) {
      group.end = position
    }
    return true
  }
  return false
}

  /**
   * Get the current count of unclosed parentheses
   * @returns Number of unclosed opening parentheses
   */
  getOpenCount(): number {
    return this.count
  }

  /**
   * Get all tracked parentheses groups
   * @returns Array of parentheses groups
   */
  getGroups(): readonly ParenthesesGroup[] {
    return Object.freeze([...this.groups])
  }

  /**
   * Reset the tracker to initial state
   */
  reset(): void {
    this.count = 0
    this.groups = []
  }

  /**
   * Check if all parentheses are balanced
   * @returns True if all parentheses are properly closed
   */
  isBalanced(): boolean {
    return this.count === 0
  }

  /**
   * Get the last unclosed group
   * @returns The most recent unclosed parentheses group, or undefined if none
   */
  getLastOpenGroup(): ParenthesesGroup | undefined {
    return this.groups.find(group => group.end === undefined)
  }

  /**
   * Check if a closing parenthesis can be added to an expression
   * @param expr - The expression to check
   * @returns True if a closing parenthesis can be added
   */
  canCloseParenthesis(expr: string): boolean {
    if (this.getOpenCount() <= 0) return false
    if (!expr.trim()) return false
    
    const lastOpenIndex = expr.lastIndexOf("(")
    if (lastOpenIndex === -1) return false
    
    const contentAfterOpen = expr.slice(lastOpenIndex + 1).trim()
    if (!contentAfterOpen) return false
    
    const lastChar = expr.trim().slice(-1)
    return /[0-9A-Fa-fπe)]/.test(lastChar)
  }

  /**
   * Count unclosed opening parentheses in an expression
   * @param expr - The expression to analyze
   * @returns Number of unclosed opening parentheses
   */
  static getOpenParenthesesCount(expr: string): number {
    let count = 0
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        count++
      } else if (expr[i] === ')') {
        count--
      }
    }
    return Math.max(0, count)
  }

  /**
   * Handle parenthesis input in an expression
   * @param currentInput - Current calculator input
   * @param parenthesis - The parenthesis character ('(' or ')')
   * @returns Object with updated input and any error
   */
  handleParenthesisInput(currentInput: string, parenthesis: string): { input: string; error: string } {
    try {
      const position = currentInput.length
      
      if (parenthesis === "(") {
        if (currentInput === "0" || currentInput === "Error") {
          const newInput = "("
          this.open(0)
          return { input: newInput, error: "" }
        } else {
          const lastChar = currentInput.slice(-1)
          const needsMultiplication = /[0-9A-Fa-fπe)]/.test(lastChar);
          const newInput = `${currentInput}${needsMultiplication ? " × " : ""}(`
          this.open(position + (needsMultiplication ? 3 : 1))
          return { input: newInput, error: "" }
        }
      } else if (parenthesis === ")" && this.canCloseParenthesis(currentInput)) {
        const newInput = `${currentInput})`
        this.close(position)
        return { input: newInput, error: "" }
      }
      
      return { input: currentInput, error: "" }
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle backspace operation for parentheses
   * @param currentInput - Current calculator input
   * @returns Object indicating if parentheses were handled and the updated input
   */
  handleParenthesesBackspace(currentInput: string): { handled: boolean; input: string } {
    const lastChar = currentInput.slice(-1)
    
    if (lastChar === '(') {
      // If removing an opening parenthesis, update tracker
      if (this.getOpenCount() > 0) {
        this.close(currentInput.length - 1)
      }
      return { handled: true, input: currentInput.slice(0, -1) }
    } else if (lastChar === ')') {
      // If removing a closing parenthesis, update tracker
      this.open(currentInput.length - 1)
      return { handled: true, input: currentInput.slice(0, -1) }
    }
    
    return { handled: false, input: currentInput }
  }

  /**
   * Check if expression needs parentheses for proper evaluation
   * @param expr - Expression to check
   * @returns True if expression needs parentheses
   */
  static needsParentheses(expr: string): boolean {
    // If the expression contains operators at the top level, it needs parentheses
    const hasTopLevelOperator = /[+\-×÷]/.test(expr)
    return hasTopLevelOperator
  }

  /**
   * Get the last complete expression part (number or parenthesized expression)
   * @param expr - Expression to analyze
   * @returns The last expression part or null if none found
   */
static getLastExpressionPart(expr: string): string | null {
    // Handle nested parentheses properly
    let parenCount = 0;
    
    // Scan from right to left to find the last complete expression
    for (let i = expr.length - 1; i >= 0; i--) {
      const char = expr[i];
      
      if (char === ')') {
        parenCount++;
      } else if (char === '(') {
        parenCount--;
        if (parenCount === 0) {
          // Found a complete parenthesized expression
          // Look for function name before the opening parenthesis
          let funcStart = i;
          while (funcStart > 0 && /[a-zA-Z√∛πe]/.test(expr[funcStart - 1])) {
            funcStart--;
          }
          return expr.substring(funcStart);
        }
      } else if (parenCount === 0 && /[+\-×÷]/.test(char)) {
        // Found an operator at the top level
        break;
      }
    }
    
    // If no parenthesized expression found, try to match the last number
    const lastNumberMatch = expr.match(/(\d+(?:\.\d+)?)(?!.*\d)/);
    if (lastNumberMatch) {
      return lastNumberMatch[0];
    }
    
    return null;
  }
}

// Export types for external use
export type { ParenthesesGroup }
