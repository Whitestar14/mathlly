/**
 * Utility functions for anime.js animations
 */

// Define interfaces for anime.js utilities
export interface AnimeInstance {
  (config: any): any
  timeline: (options?: any) => any
  set: (targets: any, props: any) => void
  stagger: (value: number) => any
}

export interface AnimeUtils {
  getAnime: () => Promise<AnimeInstance>
  createTimeline: (options?: any) => Promise<any>
  animateElements: (elements: any, properties: any) => Promise<any>
}

export function createAnimeUtils(): AnimeUtils {
  // Lazy-loaded anime.js instance
  let animeInstance: AnimeInstance | null = null

  /**
   * Get or load the anime.js instance
   * @returns The anime.js instance
   */
  const getAnime = async (): Promise<AnimeInstance> => {
    if (!animeInstance) {
      animeInstance = (await import('animejs/lib/anime.min.js')).default
    }
    return animeInstance
  }

  /**
   * Create an anime.js timeline
   * @param options - Timeline options
   * @returns Promise resolving to anime.js timeline
   */
  const createTimeline = async (options: any = {}): Promise<any> => {
    const anime = await getAnime()
    return anime.timeline(options)
  }

  /**
   * Animate elements with anime.js
   * @param elements - Elements to animate
   * @param properties - Animation properties
   * @returns Promise resolving to anime.js animation instance
   */
  const animateElements = async (elements: any, properties: any): Promise<any> => {
    const anime = await getAnime()
    return anime({
      targets: elements,
      ...properties
    })
  }

  return {
    getAnime,
    createTimeline,
    animateElements
  }
}
