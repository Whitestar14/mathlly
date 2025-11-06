import { ConverterType, VisualizationData, VisualizationReference } from '@converter/types'

const temperatureVisualizations: VisualizationData[] = [
  {
    converterType: 'temperature',
    fromUnit: 'celsius',
    toUnit: 'fahrenheit',
    references: [
      { value: 32, unit: 'fahrenheit', name: 'freezing point of water' },
      { value: 68, unit: 'fahrenheit', name: 'room temperature' },
      { value: 98.6, unit: 'fahrenheit', name: 'body temperature' },
      { value: 212, unit: 'fahrenheit', name: 'boiling point of water' },
      { value: 9932, unit: 'fahrenheit', name: "sun's surface" }
    ]
  },
  {
    converterType: 'temperature',
    fromUnit: 'fahrenheit',
    toUnit: 'celsius',
    references: [
      { value: 0, unit: 'celsius', name: 'freezing point of water' },
      { value: 20, unit: 'celsius', name: 'room temperature' },
      { value: 37, unit: 'celsius', name: 'body temperature' },
      { value: 100, unit: 'celsius', name: 'boiling point of water' },
      { value: 5500, unit: 'celsius', name: "sun's surface" }
    ]
  },
  {
    converterType: 'temperature',
    fromUnit: 'kelvin',
    toUnit: 'celsius',
    references: [
      { value: 0, unit: 'celsius', name: 'freezing point of water' },
      { value: 20, unit: 'celsius', name: 'room temperature' },
      { value: 37, unit: 'celsius', name: 'body temperature' },
      { value: 100, unit: 'celsius', name: 'boiling point of water' },
      { value: 5500, unit: 'celsius', name: "sun's surface" }
    ]
  },
  {
    converterType: 'temperature',
    fromUnit: 'kelvin',
    toUnit: 'fahrenheit',
    references: [
      { value: 32, unit: 'fahrenheit', name: 'freezing point of water' },
      { value: 68, unit: 'fahrenheit', name: 'room temperature' },
      { value: 98.6, unit: 'fahrenheit', name: 'body temperature' },
      { value: 212, unit: 'fahrenheit', name: 'boiling point of water' },
      { value: 9932, unit: 'fahrenheit', name: "sun's surface" }
    ]
  },
  {
    converterType: 'temperature',
    fromUnit: 'celsius',
    toUnit: 'kelvin',
    references: [
      { value: 273.15, unit: 'kelvin', name: 'freezing point of water' },
      { value: 293.15, unit: 'kelvin', name: 'room temperature' },
      { value: 310.15, unit: 'kelvin', name: 'body temperature' },
      { value: 373.15, unit: 'kelvin', name: 'boiling point of water' },
      { value: 5773, unit: 'kelvin', name: "sun's surface" }
    ]
  },
  {
    converterType: 'temperature',
    fromUnit: 'fahrenheit',
    toUnit: 'kelvin',
    references: [
      { value: 273.15, unit: 'kelvin', name: 'freezing point of water' },
      { value: 293.15, unit: 'kelvin', name: 'room temperature' },
      { value: 310.15, unit: 'kelvin', name: 'body temperature' },
      { value: 373.15, unit: 'kelvin', name: 'boiling point of water' },
      { value: 5773, unit: 'kelvin', name: "sun's surface" }
    ]
  }
]

const lengthVisualizations: VisualizationData[] = [
  {
    converterType: 'length',
    fromUnit: 'meter',
    toUnit: 'foot',
    references: [
      { value: 1, unit: 'foot', name: 'length of a ruler' },
      { value: 6, unit: 'foot', name: 'human height' },
      { value: 10, unit: 'foot', name: 'basketball hoop' },
      { value: 328, unit: 'foot', name: 'football field' },
      { value: 1063, unit: 'foot', name: 'Eiffel Tower' },
      { value: 2717, unit: 'foot', name: 'Burj Khalifa' },
      { value: 29029, unit: 'foot', name: 'Mount Everest' }
    ]
  },
  {
    converterType: 'length',
    fromUnit: 'kilometer',
    toUnit: 'mile',
    references: [
      { value: 3.1, unit: 'mile', name: '5K run' },
      { value: 26.2, unit: 'mile', name: 'marathon distance' },
      { value: 238855, unit: 'mile', name: 'distance to the Moon' }
    ]
  },
  {
    converterType: 'length',
    fromUnit: 'centimeter',
    toUnit: 'inch',
    references: [
      { value: 1, unit: 'inch', name: 'paperclip' },
      { value: 6, unit: 'inch', name: 'dollar bill' },
      { value: 12, unit: 'inch', name: 'ruler' }
    ]
  }
]

const weightVisualizations: VisualizationData[] = [
  {
    converterType: 'weight',
    fromUnit: 'kilogram',
    toUnit: 'pound',
    references: [
      { value: 1, unit: 'pound', name: '3 sticks of butter' },
      { value: 0.44, unit: 'pound', name: 'hamster' },
      { value: 10, unit: 'pound', name: 'bowling ball' },
      { value: 154, unit: 'pound', name: 'adult human' },
      { value: 441, unit: 'pound', name: 'large refrigerator' },
      { value: 2205, unit: 'pound', name: 'small car' },
      { value: 13228, unit: 'pound', name: 'elephant' }
    ]
  },
  {
    converterType: 'weight',
    fromUnit: 'gram',
    toUnit: 'ounce',
    references: [
      { value: 1, unit: 'ounce', name: 'slice of bread' },
      { value: 3.5, unit: 'ounce', name: 'medium apple' },
      { value: 7, unit: 'ounce', name: 'cheeseburger' },
      { value: 17.6, unit: 'ounce', name: 'water bottle' }
    ]
  }
]

const allVisualizations = [
  ...temperatureVisualizations,
  ...lengthVisualizations,
  ...weightVisualizations
]

const realWorldReferences: Record<ConverterType, VisualizationReference[]> = {
  temperature: [
    { value: 0, unit: 'celsius', name: 'freezing point of water', isRealWorld: true },
    { value: 20, unit: 'celsius', name: 'comfortable room temperature', isRealWorld: true },
    { value: 37, unit: 'celsius', name: 'body temperature', isRealWorld: true },
    { value: 100, unit: 'celsius', name: 'boiling point of water', isRealWorld: true },
    { value: -10, unit: 'celsius', name: 'cold winter day', isRealWorld: true },
    { value: 30, unit: 'celsius', name: 'hot summer day', isRealWorld: true },
    { value: 180, unit: 'celsius', name: 'oven baking temperature', isRealWorld: true }
  ],
  length: [
    { value: 1.8, unit: 'meter', name: 'height of a person', isRealWorld: true },
    { value: 3.6, unit: 'meter', name: 'height of 2 people', isRealWorld: true },
    { value: 4.5, unit: 'meter', name: 'length of a car', isRealWorld: true },
    { value: 10, unit: 'meter', name: 'height of a 3-story building', isRealWorld: true },
    { value: 50, unit: 'meter', name: 'width of a football field', isRealWorld: true },
    { value: 0.01, unit: 'meter', name: 'thickness of a sheet of paper', isRealWorld: true },
    { value: 0.1, unit: 'meter', name: 'length of a pencil', isRealWorld: true }
  ],
  weight: [
    { value: 0.2, unit: 'kilogram', name: 'cheeseburger', isRealWorld: true },
    { value: 1, unit: 'kilogram', name: 'bag of sugar', isRealWorld: true },
    { value: 3.8, unit: 'kilogram', name: 'gallon of milk', isRealWorld: true },
    { value: 15, unit: 'kilogram', name: 'medium dog', isRealWorld: true },
    { value: 70, unit: 'kilogram', name: 'adult person', isRealWorld: true },
    { value: 0.005, unit: 'kilogram', name: 'apple', isRealWorld: true },
    { value: 0.1, unit: 'kilogram', name: 'watermelon', isRealWorld: true }
  ],
  'css-units': []
}

const unitSymbols: Record<string, string> = {
  kelvin: 'K',
  celsius: '°C',
  fahrenheit: '°F',
  meter: 'm',
  foot: 'ft',
  kilometer: 'km',
  mile: 'mi',
  centimeter: 'cm',
  inch: 'in',
  millimeter: 'mm',
  kilogram: 'kg',
  pound: 'lb',
  gram: 'g',
  ounce: 'oz',
  milligram: 'mg'
}

const additionalUnits: Record<ConverterType, Record<string, string>> = {
  temperature: { celsius: 'kelvin', fahrenheit: 'kelvin', kelvin: 'celsius' },
  length: { meter: 'centimeter', foot: 'inch', kilometer: 'meter', mile: 'foot', centimeter: 'millimeter', inch: 'centimeter' },
  weight: { kilogram: 'gram', pound: 'ounce', gram: 'milligram', ounce: 'gram' },
  'css-units': {}
}

const tempConvert = (value: number, from: string, to: string): number => {
  if (from === to) return value
  let celsius: number
  if (from === 'celsius') celsius = value
  else if (from === 'fahrenheit') celsius = (value - 32) * 5 / 9
  else if (from === 'kelvin') celsius = value - 273.15
  else return value
  if (to === 'celsius') return celsius
  if (to === 'fahrenheit') return celsius * 9 / 5 + 32
  if (to === 'kelvin') return celsius + 273.15
  return value
}

const lengthConvert = (value: number, from: string, to: string): number => {
  const factors: Record<string, number> = { meter: 1, foot: 0.3048, kilometer: 1000, mile: 1609.34, centimeter: 0.01, inch: 0.0254, millimeter: 0.001 }
  return value * factors[from] / factors[to]
}

const weightConvert = (value: number, from: string, to: string): number => {
  const factors: Record<string, number> = { kilogram: 1, pound: 0.453592, gram: 0.001, ounce: 0.0283495, milligram: 0.000001 }
  return value * factors[from] / factors[to]
}

export function useConversionVisualization() {
  const getVisualization = (
    value: number,
    fromUnit: string,
    toUnit: string,
    converterType: ConverterType
  ): string[] | undefined => {
    const data = allVisualizations.find(
      (d) =>
        d.converterType === converterType &&
        d.fromUnit === fromUnit &&
        d.toUnit === toUnit
    )
    const convertFunc = { temperature: tempConvert, length: lengthConvert, weight: weightConvert }[converterType]
    const visualizations: string[] = []

    // Unit conversion
    const additionalUnit = additionalUnits[converterType]?.[toUnit]
    if (additionalUnit && convertFunc) {
      const additionalValue = convertFunc(value, toUnit, additionalUnit)
      const formatted = additionalValue.toFixed(2).replace(/\.?0+$/, '')
      visualizations.push(`Also ${formatted} ${unitSymbols[additionalUnit] || additionalUnit}`)
    }

    // Ratio reference
    if (data) {
      let bestRef: VisualizationReference | undefined
      let bestDiff = Infinity
      for (const ref of data.references) {
        if (ref.isRealWorld) continue
        const ratio = value / ref.value
        const minRatio = ref.minRatio ?? 0.1
        const maxRatio = ref.maxRatio ?? 10
        if (ratio >= minRatio && ratio <= maxRatio) {
          const diff = Math.abs(ratio - 1)
          if (diff < bestDiff) {
            bestDiff = diff
            bestRef = ref
          }
        }
      }
      if (bestRef) {
        const ratio = value / bestRef.value
        if (ratio >= 0.9 && ratio <= 1.1) {
          visualizations.push(`About the ${bestRef.name}`)
        } else {
          let ratioStr: string
          if (ratio >= 0.1 && ratio < 10) {
            ratioStr = ratio.toFixed(1)
          } else if (ratio >= 10 && ratio < 100) {
            ratioStr = Math.round(ratio).toString()
          } else {
            ratioStr = 'over 100'
          }
          visualizations.push(`${ratioStr}× the ${bestRef.name}`)
        }
      }
    }

    // Real-world scale
    const realWorldRefs = realWorldReferences[converterType]
    if (realWorldRefs && convertFunc) {
      let bestRef: VisualizationReference | undefined
      let bestDiff = Infinity
      for (const ref of realWorldRefs) {
        const convertedRefValue = convertFunc(ref.value, ref.unit, toUnit)
        const ratio = value / convertedRefValue
        const minRatio = ref.minRatio ?? 0.1
        const maxRatio = ref.maxRatio ?? 10
        if (ratio >= minRatio && ratio <= maxRatio) {
          const diff = Math.abs(ratio - 1)
          if (diff < bestDiff) {
            bestDiff = diff
            bestRef = ref
          }
        }
      }
      if (bestRef) {
        const convertedRefValue = convertFunc(bestRef.value, bestRef.unit, toUnit)
        const ratio = value / convertedRefValue
        if (ratio >= 0.9 && ratio <= 1.1) {
          visualizations.push(`Equivalent to ${bestRef.name}`)
        } else {
          let ratioStr: string
          if (ratio >= 0.1 && ratio < 10) {
            ratioStr = ratio.toFixed(1)
          } else if (ratio >= 10 && ratio < 100) {
            ratioStr = Math.round(ratio).toString()
          } else {
            ratioStr = 'over 100'
          }
          visualizations.push(`${ratioStr}× ${bestRef.name}`)
        }
      }
    }

    return visualizations.length > 0 ? visualizations : undefined
  }

  const getAllVisualizationsForConverter = (
    converterType: ConverterType
  ): VisualizationData[] => {
    return allVisualizations.filter((d) => d.converterType === converterType)
  }

  const hasVisualization = (
    fromUnit: string,
    toUnit: string,
    converterType: ConverterType
  ): boolean => {
    return allVisualizations.some(
      (d) =>
        d.converterType === converterType &&
        d.fromUnit === fromUnit &&
        d.toUnit === toUnit &&
        d.references.length > 0
    )
  }

  return {
    getVisualization,
    getAllVisualizationsForConverter,
    hasVisualization
  }
}
