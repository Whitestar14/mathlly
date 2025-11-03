
import { defineAsyncComponent } from 'vue'

export const headerWidgetRegistry = {
  CalculatorModeSwitcher: defineAsyncComponent(
    () => import('@calculator/components/CalculatorModeSwitcher.vue')
  )

} as const

export type HeaderWidgetName = keyof typeof headerWidgetRegistry
