/**
 * Utility functions for anime.js animations
 */

// Define interfaces for anime.js utilities
export interface AnimeInstance {
  (config: any): any;
  timeline: (options?: any) => any;
  set: (targets: any, props: any) => void;
  stagger: (value: number) => any;
}

export interface AnimeUtils {
  getAnime: () => AnimeInstance;
  createTimeline: (options?: any) => any;
  animateElements: (elements: any, properties: any) => any;
}

/**
 * Creates and returns a set of utilities for working with anime.js.
 * * @returns An object containing utility functions for anime.js.
 */
export function createAnimeUtils(): AnimeUtils {
  let animeInstance: AnimeInstance | null = null;
  import('animejs/lib/anime.min.js')
    .then(module => {
      animeInstance = module.default;
    })
    .catch(error => {
      console.error('Failed to load anime.js:', error);
    });

  /**
   * Get the anime.js instance.
   * @returns The anime.js instance.
   */
  const getAnime = (): AnimeInstance => {
    if (!animeInstance) {
      throw new Error('Anime.js is not yet loaded.');
    }
    return animeInstance;
  };

  /**
   * Create an anime.js timeline.
   * @param options - Timeline options.
   * @returns The anime.js timeline.
   */
  const createTimeline = (options: any = {}): any => {
    const anime = getAnime();
    return anime.timeline(options);
  };

  /**
   * Animate elements with anime.js.
   * @param elements - Elements to animate.
   * @param properties - Animation properties.
   * @returns The anime.js animation instance.
   */
  const animateElements = (elements: any, properties: any): any => {
    const anime = getAnime();
    return anime({
      targets: elements,
      ...properties
    });
  };

  return {
    getAnime,
    createTimeline,
    animateElements
  };
}
