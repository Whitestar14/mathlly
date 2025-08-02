import { LRUCache } from './LRUCache'

/**
 * Centralized manager for application caches
 */
export class CacheManager {
  private static caches = new Map<string, LRUCache<any>>()
  
  /**
   * Get or create a cache with the specified name and capacity
   * @param name - The name of the cache
   * @param capacity - The capacity of the cache
   * @returns The requested cache
   */
  static getCache<T = any>(name: string, capacity: number = 100): LRUCache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new LRUCache<T>(capacity))
    }
    return this.caches.get(name) as LRUCache<T>
  }
  
  /**
   * Clear a specific cache by name
   * @param name - The name of the cache to clear
   * @returns True if the cache was found and cleared
   */
  static clearCache(name: string): boolean {
    if (this.caches.has(name)) {
      this.caches.get(name)!.clear()
      return true
    }
    return false
  }
  
  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }
  
  /**
   * Get the size of a specific cache
   * @param name - The name of the cache
   * @returns The size of the cache, or 0 if not found
   */
  static getCacheSize(name: string): number {
    if (this.caches.has(name)) {
      return this.caches.get(name)!.size
    }
    return 0
  }
  
  /**
   * Get statistics about all caches
   * @returns Object with cache statistics
   */
  static getCacheStats(): Record<string, { size: number; capacity: number }> {
    const stats: Record<string, { size: number; capacity: number }> = {}
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = {
        size: cache.size,
        capacity: cache.capacity
      }
    }
    return stats
  }
}
