import type { ConverterConfig } from '../../types/converter'

export const temperatureConfig: ConverterConfig = {
  id: 'temperature',
  name: 'Temperature Converter',
  description: 'Convert between temperature units',
  icon: 'thermometer',
  useMathJs: true,
  customConverter: undefined,
  defaultFromUnit: 'celsius',
  defaultToUnit: 'fahrenheit',
  units: [
    {
      id: 'celsius',
      symbol: '°C',
      name: 'Celsius',
      category: 'temperature'
    },
    {
      id: 'fahrenheit',
      symbol: '°F',
      name: 'Fahrenheit',
      category: 'temperature'
    },
    {
      id: 'kelvin',
      symbol: 'K',
      name: 'Kelvin',
      category: 'temperature'
    },
    {
      id: 'rankine',
      symbol: '°R',
      name: 'Rankine',
      category: 'temperature'
    }
  ]
}