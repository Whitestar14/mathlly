// src/features/tools/color/composables/useColorTemperature.ts
import { adjustTemperature } from './useColor'
import type { RGB } from '../types/color'

export function useColorTemperature(onUpdate: (c: RGB) => void) {
  const makeWarmer = (color: RGB, delta = -500) => onUpdate(adjustTemperature(color, delta))
  const makeCooler = (color: RGB, delta = 500) => onUpdate(adjustTemperature(color, delta))
  return { makeWarmer, makeCooler }
}
