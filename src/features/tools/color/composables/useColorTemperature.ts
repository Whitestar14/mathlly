
import { adjustTemperature } from '@color/lib/color'
import type { RGB } from '@color/lib/color'

export function useColorTemperature(onUpdate: (c: RGB) => void) {
  const makeWarmer = (color: RGB, delta = -500) => onUpdate(adjustTemperature(color, delta))
  const makeCooler = (color: RGB, delta = 500) => onUpdate(adjustTemperature(color, delta))
  return { makeWarmer, makeCooler }
}
