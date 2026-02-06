
/**
 * Interface for parentheses group tracking
 */
export interface ParenGroup {
  start: number;
  end?: number;
}

/**
 * A robust Parentheses Tracker that relies on string synchronization
 * rather than stateful steps to avoid desync during complex editing.
 */
export class ParenTracker {
  private groups: ParenGroup[]

  constructor() {
    this.groups = []
  }

  /**
   * Reset the tracker to initial state
   */
  reset(): void {
    this.groups = []
  }

  /**
   * Get the current count of unclosed parentheses
   */
  getOpenCount(): number {
    return this.groups.filter(g => g.end === undefined).length
  }

  /**
   * Register an opening parenthesis
   */
  open(position: number): void {
    this.groups.push({ start: position })
  }

  /**
   * Register a closing parenthesis by finding the most recent unclosed group
   */
  close(position: number): boolean {
    // Iterate backwards to find the deepest nested unclosed group
    for (let i = this.groups.length - 1; i >= 0; i--) {
      if (this.groups[i].end === undefined) {
        this.groups[i].end = position
        return true
      }
    }
    return false
  }

  /**
   * Deterministically rebuilds the parentheses state from the input string.
   * This allows the tracker to recover from bulk deletions or complex edits.
   * @param input The full calculator input string
   */
  sync(input: string): void {
    this.reset()
    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      if (char === '(') {
        this.open(i)
      } else if (char === ')') {
        this.close(i)
      }
    }
  }

  /**
   * Returns a readonly view of the groups for debugging/highlighting
   */
  getGroups(): readonly ParenGroup[] {
    return this.groups
  }
}
