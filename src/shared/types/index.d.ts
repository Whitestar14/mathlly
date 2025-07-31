declare module 'animejs/lib/anime.min.js' {
  interface AnimeParams {
    targets?: string | Element | Element[] | NodeList | any
    duration?: number | ((el: Element, i: number, l: number) => number)
    delay?: number | ((el: Element, i: number, l: number) => number)
    endDelay?: number | ((el: Element, i: number, l: number) => number)
    easing?: string | ((el: Element, i: number, l: number) => string)
    round?: number | boolean
    direction?: 'normal' | 'reverse' | 'alternate'
    loop?: number | boolean
    autoplay?: boolean
    complete?: (anim: AnimeInstance) => void
    update?: (anim: AnimeInstance) => void
    begin?: (anim: AnimeInstance) => void
    [property: string]: any
  }

  interface AnimeTimelineParams {
    direction?: 'normal' | 'reverse' | 'alternate'
    loop?: number | boolean
    autoplay?: boolean
    complete?: (anim: AnimeTimeline) => void
    update?: (anim: AnimeTimeline) => void
    begin?: (anim: AnimeTimeline) => void
    [property: string]: any
  }

  interface AnimeInstance {
    play(): AnimeInstance
    pause(): AnimeInstance
    restart(): AnimeInstance
    reverse(): AnimeInstance
    seek(time: number): AnimeInstance
    finished: Promise<void>
    duration: number
    currentTime: number
    progress: number
    [property: string]: any
  }

  interface AnimeTimeline {
    add(params: AnimeParams, timeOffset?: string | number): AnimeTimeline
    play(): AnimeTimeline
    pause(): AnimeTimeline
    restart(): AnimeTimeline
    reverse(): AnimeTimeline
    seek(time: number): AnimeTimeline
    finished: Promise<void>
    duration: number
    currentTime: number
    progress: number
    [property: string]: any
  }

  interface Anime {
    (params: AnimeParams): AnimeInstance
    timeline(params?: AnimeTimelineParams): AnimeTimeline
    stagger(value: number | string, options?: { 
      grid?: [number, number]
      from?: string | number
      axis?: 'x' | 'y'
      easing?: string
      direction?: 'normal' | 'reverse'
      start?: number
    }): (el: Element, i: number) => number
    set(targets: any, params: AnimeParams): void
    get(targets: any, prop: string, unit?: string): string | number
    path(path: string | SVGPathElement): (prop: string) => (el: Element, i: number) => string
    setDashoffset(el: SVGPathElement): number
    bezier(x1: number, y1: number, x2: number, y2: number): string
    speed: number
    running: AnimeInstance[]
    remove(targets: any): void
    getValue(targets: any, prop: string): string | number
    [property: string]: any
  }

  const anime: Anime
  export default anime
}
