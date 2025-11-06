import { ConverterConfig, ConversionUnit } from '../../types/converter';

export const lengthConfig: ConverterConfig = {
  id: 'length',
  name: 'Length Converter',
  description: 'Convert between length and distance units',
  icon: 'ruler',
  useMathJs: true,
  customConverter: undefined,
  defaultFromUnit: 'meter',
  defaultToUnit: 'foot',
  units: [
    {
      id: 'meter',
      symbol: 'm',
      name: 'Meter',
      category: 'length',
    },
    {
      id: 'centimeter',
      symbol: 'cm',
      name: 'Centimeter',
      category: 'length',
    },
    {
      id: 'millimeter',
      symbol: 'mm',
      name: 'Millimeter',
      category: 'length',
    },
    {
      id: 'kilometer',
      symbol: 'km',
      name: 'Kilometer',
      category: 'length',
    },
    {
      id: 'inch',
      symbol: 'in',
      name: 'Inch',
      category: 'length',
    },
    {
      id: 'foot',
      symbol: 'ft',
      name: 'Foot',
      category: 'length',
    },
    {
      id: 'yard',
      symbol: 'yd',
      name: 'Yard',
      category: 'length',
    },
    {
      id: 'mile',
      symbol: 'mi',
      name: 'Mile',
      category: 'length',
    },
  ],
};