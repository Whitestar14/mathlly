import { shallowRef, type Ref } from 'vue'
import { TransitionPresets } from '@vueuse/core'
import { createAnimeUtils, type AnimeUtils } from '@utils/animation/animeUtils'

interface BaseAnimationOptions {
  enterDuration?: number
  enterEasing?: string
  leaveDuration?: number
  leaveEasing?: string
}

interface StaggeredAnimationOptions extends BaseAnimationOptions {
  initialDelay?: number
  initialDuration?: number
  initialEasing?: string
  enterTransform?: [number, number]
  enterAxis?: 'x' | 'y'
  leaveTransform?: [number, number]
  leaveAxis?: 'x' | 'y'
}

interface ListAnimationOptions extends StaggeredAnimationOptions {
  moveEasing?: string
  moveDuration?: number
  moveDelay?: number
}

interface FadeAnimationOptions {
  duration?: number
}

interface SlideAnimationOptions {
  duration?: number
  easing?: string
  inputOpacityRange?: [number, number]
  resultOpacityRange?: [number, number]
  inputTranslateY?: [string | number, string | number]
  resultTranslateY?: [string | number, string | number]
}

interface AnimationHandlers {
  onBeforeEnter: (el: Element) => void
  onEnter: (el: Element, done: () => void) => void
  onLeave: (el: Element, done: () => void) => void
}

interface LogoAnimationControls {
  playAnimation: () => void
  stopAnimation: () => void
}

interface SlideAnimationControls {
  animateSlide: (resultContainer: HTMLElement | null, inputContainer: HTMLElement | null) => void
  resetPositions: (resultContainer: HTMLElement | null, inputContainer: HTMLElement | null) => void
}

interface UseAnimationReturn {
  isInitialAnimation: Ref<boolean>
  setInitialAnimation: (value?: boolean) => void
  createStaggeredAnimation: (options?: StaggeredAnimationOptions) => AnimationHandlers
  createFadeAnimation: (options?: FadeAnimationOptions) => AnimationHandlers
  createListAnimation: (options?: ListAnimationOptions) => AnimationHandlers
  createSlideAnimation: (options?: SlideAnimationOptions) => SlideAnimationControls
}

/**
 * Composable for managing reusable animations
 */
export function useAnimation(): UseAnimationReturn {
  const isInitialAnimation: Ref<boolean> = shallowRef(true)

  const { getAnime, animateElements }: AnimeUtils = createAnimeUtils()

  /**
   * Sets the initial animation state
   */
  const setInitialAnimation = (value: boolean = true): void => {
    isInitialAnimation.value = value
  }

  /**
   * Creates animation handlers for Vue transitions
   */
  const createAnimationHandlers = (options: BaseAnimationOptions = {}) => {
    const {
      enterDuration = 300,
      enterEasing = 'easeOutCubic',
      leaveDuration = 300,
      leaveEasing = 'easeOutCubic'
    } = options

    return {
      durations: { enter: enterDuration, leave: leaveDuration },
      easings: { enter: enterEasing, leave: leaveEasing }
    }
  }

  /**
   * Creates a staggered fade-in animation
   */
  const createStaggeredAnimation = (options: StaggeredAnimationOptions = {}): AnimationHandlers => {
    const {
      initialDelay = 50,
      initialDuration = 400,
      initialEasing = 'easeOutCubic',
      enterTransform = [-20, 0],
      enterAxis = 'y',
      leaveTransform = [0, 80],
      leaveAxis = 'x'
    } = options

    const baseHandlers = createAnimationHandlers(options)

    const onBeforeEnter = (el: Element): void => {
      const element = el as HTMLElement
      element.style.opacity = '0'

      if (!isInitialAnimation.value) {
        element.style.transform = `translate${enterAxis.toUpperCase()}(${enterTransform[0]}px)`
      }
    }

    const onEnter = (el: Element, done: () => void): void => {
      const anime = getAnime()
      const element = el as HTMLElement

      if (isInitialAnimation.value) {
        anime({
          targets: el,
          opacity: [0, 1],
          duration: initialDuration,
          delay: parseInt((element.dataset.index || '0'), 10) * initialDelay,
          easing: initialEasing,
          complete: () => {
            done()
            element.style.opacity = ''
          }
        })
      } else {
        const animProps: any = {
          targets: el,
          opacity: [0, 1],
          duration: baseHandlers.durations.enter,
          easing: baseHandlers.easings.enter,
          complete: () => {
            done()
            element.style.opacity = ''
            element.style.transform = ''
          }
        }

        animProps[`translate${enterAxis.toUpperCase()}`] = enterTransform
        anime(animProps)
      }
    }

    const onLeave = (el: Element, done: () => void): void => {
      const anime = getAnime()

      const animProps: any = {
        targets: el,
        opacity: [1, 0],
        duration: baseHandlers.durations.leave,
        easing: baseHandlers.easings.leave,
        complete: done
      }

      animProps[`translate${leaveAxis.toUpperCase()}`] = leaveTransform
      anime(animProps)
    }

    return { onBeforeEnter, onEnter, onLeave }
  }

  /**
   * Creates a list animation with smooth item removal
   */
  const createListAnimation = (options: ListAnimationOptions = {}): AnimationHandlers => {
    const {
      moveEasing = 'easeInOutQuad',
      moveDuration = 300,
      moveDelay = 150
    } = options

    const { onBeforeEnter, onEnter } = createStaggeredAnimation(options)

    const onLeave = (el: Element, done: () => void): void => {
      const anime = getAnime()
      const element = el as HTMLElement
      const {
        leaveAxis = 'x',
        leaveTransform = [0, 80],
        leaveDuration = 300,
        leaveEasing = 'easeOutCubic'
      } = options

      const height = element.offsetHeight
      const marginBottom = parseInt(window.getComputedStyle(element).marginBottom, 10) || 0
      const totalHeight = height + marginBottom

      const parent = element.parentNode as HTMLElement
      const siblings = Array.from(parent.children) as HTMLElement[]
      const index = siblings.indexOf(element)
      const elementsBelow = siblings.slice(index + 1)

      animateElements(el, {
        opacity: [1, 0],
        [`translate${leaveAxis.toUpperCase()}`]: leaveTransform,
        duration: leaveDuration,
        easing: leaveEasing
      })

      if (elementsBelow.length > 0) {
        anime({
          targets: elementsBelow,
          translateY: ['0px', `-${totalHeight}px`],
          duration: moveDuration,
          easing: moveEasing,
          delay: moveDelay,
          complete: () => {
            elementsBelow.forEach(el => { el.style.transform = '' })
            done()
          }
        })
      } else {
        setTimeout(done, leaveDuration)
      }
    }

    return { onBeforeEnter, onEnter, onLeave }
  }

  /**
   * Creates a simple fade animation
   */
  const createFadeAnimation = (options: FadeAnimationOptions = {}): AnimationHandlers => {
    const { duration = 300 } = options

    const onBeforeEnter = (el: Element): void => {
      const element = el as HTMLElement
      element.style.opacity = '0'
    }

    const onEnter = (el: Element, done: () => void): void => {
      const anime = getAnime()
      const element = el as HTMLElement

      anime({
        targets: el,
        opacity: [0, 1],
        duration,
        easing: TransitionPresets.easeOutCubic.toString(),
        complete: () => {
          done()
          element.style.opacity = ''
        }
      })
    }

    const onLeave = (el: Element, done: () => void): void => {
      const anime = getAnime()

      anime({
        targets: el,
        opacity: [1, 0],
        duration,
        easing: TransitionPresets.easeOutCubic.toString(),
        complete: done
      })
    }

    return { onBeforeEnter, onEnter, onLeave }
  }

  /**
   * Creates a slide animation for transitioning between elements
   */
  const createSlideAnimation = (options: SlideAnimationOptions = {}): SlideAnimationControls => {
    const {
      duration = 300,
      easing = 'cubicBezier(0.25, 0.1, 0.25, 1)',
      inputOpacityRange = [1, 0],
      resultOpacityRange = [0, 1],
      inputTranslateY = [0, '-100%'],
      resultTranslateY = ['100%', 0]
    } = options

    const animateSlide = (
      resultContainer: HTMLElement | null,
      inputContainer: HTMLElement | null
    ): void => {
      if (!resultContainer || !inputContainer) return

      const anime = getAnime()

      anime.set(resultContainer, {
        translateY: resultTranslateY[0],
        opacity: resultOpacityRange[0]
      })

      anime.set(inputContainer, {
        translateY: inputTranslateY[0],
        opacity: inputOpacityRange[0]
      })

      const timeline = anime.timeline({
        easing,
        duration
      })

      timeline
        .add({
          targets: inputContainer,
          translateY: inputTranslateY[1],
          opacity: inputOpacityRange[1],
          easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
        })
        .add({
          targets: resultContainer,
          translateY: resultTranslateY[1],
          opacity: resultOpacityRange[1],
          easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
        }, `-=${duration - 50}`)
    }

    const resetPositions = (
      resultContainer: HTMLElement | null,
      inputContainer: HTMLElement | null
    ): void => {
      if (!resultContainer || !inputContainer) return

      const anime = getAnime()

      anime.set(resultContainer, {
        translateY: resultTranslateY[0],
        opacity: resultOpacityRange[0]
      })

      anime.set(inputContainer, {
        translateY: inputTranslateY[0],
        opacity: inputOpacityRange[0]
      })
    }
    return { animateSlide, resetPositions }
  }

  return {
    isInitialAnimation,
    setInitialAnimation,
    createStaggeredAnimation,
    createFadeAnimation,
    createListAnimation,
    createSlideAnimation
  }
}

export type {
  BaseAnimationOptions,
  StaggeredAnimationOptions,
  ListAnimationOptions,
  FadeAnimationOptions,
  SlideAnimationOptions,
  AnimationHandlers,
  LogoAnimationControls,
  SlideAnimationControls,
  UseAnimationReturn
}
