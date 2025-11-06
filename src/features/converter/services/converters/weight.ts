import type { ConverterConfig } from '../../types/converter';

export const weightConfig: ConverterConfig = {
  id: 'weight',
  name: 'Weight & Mass Converter',
  description: 'Convert between weight and mass units',
  icon: 'weight',
  useMathJs: true,
  customConverter: undefined,
  defaultFromUnit: 'kilogram',
  defaultToUnit: 'pound',
  units: [
    {
      id: 'kilogram',
      symbol: 'kg',
      name: 'Kilogram',
      category: 'weight',
    },
    {
      id: 'gram',
      symbol: 'g',
      name: 'Gram',
      category: 'weight',
    },
    {
      id: 'milligram',
      symbol: 'mg',
      name: 'Milligram',
      category: 'weight',
    },
    {
      id: 'tonne',
      symbol: 't',
      name: 'Metric Ton',
      category: 'weight',
    },
    {
      id: 'pound',
      symbol: 'lb',
      name: 'Pound',
      category: 'weight',
    },
    {
      id: 'ounce',
      symbol: 'oz',
      name: 'Ounce',
      category: 'weight',
    },
    {
      id: 'ton',
      symbol: 'ton',
      name: 'Ton (US)',
      category: 'weight',
    },
  ],
};