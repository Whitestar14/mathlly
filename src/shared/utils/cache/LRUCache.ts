/**
 * A Least Recently Used (LRU) cache implementation
 */
export class LRUCache<T = any> {
  private cache: Map<string, T>
  public readonly capacity: number

  /**
   * Create a new LRU Cache
   * @param capacity - Maximum number of items to store in the cache
   */
  constructor(capacity: number = 100) {
    this.capacity = capacity
    this.cache = new Map<string, T>()
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or undefined if not found
   */
  get(key: string): T | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }
    
    // Move the accessed item to the end (most recently used)
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @returns The cache instance for chaining
   */
  set(key: string, value: T): this {
    // If key exists, refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // If at capacity, remove the oldest item (first item in Map)
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value as string | undefined
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }
    
    // Add new item at the end (most recently used)
    this.cache.set(key, value)
    
    return this
  }

  /**
   * Check if a key exists in the cache
   * @param key - The cache key
   * @returns True if the key exists
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Delete a key from the cache
   * @param key - The cache key
   * @returns True if the key was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get the current size of the cache
   * @returns The number of items in the cache
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Get all keys in the cache
   * @returns Iterator of cache keys
   */
  keys(): IterableIterator<string> {
    return this.cache.keys()
  }

  /**
   * Get all values in the cache
   * @returns Iterator of cache values
   */
  values(): IterableIterator<T> {
    return this.cache.values()
  }

  /**
   * Get all entries in the cache
   * @returns Iterator of [key, value] pairs
   */
  entries(): IterableIterator<[string, T]> {
    return this.cache.entries()
  }
}
