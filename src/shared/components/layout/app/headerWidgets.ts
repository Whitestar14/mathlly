import { defineAsyncComponent } from 'vue'

export const headerWidgetRegistry = {
  CalculatorModeSwitcher: defineAsyncComponent(
    () => import('@calculator/components/CalculatorModeSwitcher.vue')
  ),
  ConverterTypeSwitcher: defineAsyncComponent(
    () => import('@converter/components/ConverterTypeSwitcher.vue')
  )
} as const

export type HeaderWidgetName = keyof typeof headerWidgetRegistry
