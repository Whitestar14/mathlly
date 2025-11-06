import type { ConverterType, ConverterConfig, ConversionUnit } from '../types';
import { temperatureConfig, lengthConfig, weightConfig, cssUnitsConfig } from './converters';

class ConverterRegistry {
  private static instance: ConverterRegistry;
  private converters: Map<ConverterType, ConverterConfig> = new Map();

  private constructor() {
    // Register default converters
    this.register(temperatureConfig);
    this.register(lengthConfig);
    this.register(weightConfig);
    this.register(cssUnitsConfig);
  }

  static getInstance(): ConverterRegistry {
    if (!ConverterRegistry.instance) {
      ConverterRegistry.instance = new ConverterRegistry();
    }
    return ConverterRegistry.instance;
  }

  register(config: ConverterConfig): void {
    // Validate that the config has required fields
    if (!config.id || !config.name || !config.units || config.units.length === 0) {
      throw new Error('Invalid converter config: missing required fields');
    }
    // Validate unique units
    const unitIds = config.units.map(u => u.id);
    if (new Set(unitIds).size !== unitIds.length) {
      throw new Error('Units must have unique ids');
    }
    this.converters.set(config.id, config);
  }

  get(type: ConverterType): ConverterConfig | undefined {
    return this.converters.get(type);
  }

  getAll(): ConverterConfig[] {
    return Array.from(this.converters.values());
  }

  getUnit(converterType: ConverterType, unitId: string): ConversionUnit | undefined {
    const config = this.get(converterType);
    if (!config) return undefined;
    return config.units.find(u => u.id === unitId);
  }

  isRegistered(type: ConverterType): boolean {
    return this.converters.has(type);
  }

  getAvailableTypes(): ConverterType[] {
    return Array.from(this.converters.keys());
  }
}

export { ConverterRegistry };