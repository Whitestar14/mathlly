import { Base64Encoder } from '../encoders/Base64Encoder';
import { Base64Decoder } from '../decoders/Base64Decoder';
import type { Base64ServiceType, IBase64Encoder, IBase64Decoder, IBase64Service } from '@base64/types/base64';

/**
 * Type guard to check if a service is a Base64Encoder.
 * @param service - The service to check.
 * @returns True if the service is an encoder, false otherwise.
 */
export function isBase64Encoder(service: IBase64Service): service is IBase64Encoder {
  return service.serviceType === 'encoder';
}

/**
 * Type guard to check if a service is a Base64Decoder.
 * @param service - The service to check.
 * @returns True if the service is a decoder, false otherwise.
 */
export function isBase64Decoder(service: IBase64Service): service is IBase64Decoder {
  return service.serviceType === 'decoder';
}

/**
 * Factory class for creating Base64 services.
 * Provides static methods to instantiate encoders and decoders with type safety.
 */
export class Base64ServiceFactory {
  /**
   * Creates a Base64 service based on the specified type.
   * @param type - The type of service to create ('encoder' or 'decoder').
   * @returns An instance of the requested Base64 service.
   * @throws Error if the type is unsupported.
   * @example
   * const encoder = Base64ServiceFactory.create('encoder');
   */
  static create(type: Base64ServiceType): IBase64Service {
    switch (type) {
      case 'encoder':
        return new Base64Encoder();
      case 'decoder':
        return new Base64Decoder();
      default:
        throw new Error(`Unsupported Base64 service type: ${type}`);
    }
  }

  /**
   * Convenience method to create a Base64Encoder instance.
   * @returns A new Base64Encoder instance.
   * @example
   * const encoder = Base64ServiceFactory.createEncoder();
   */
  static createEncoder(): IBase64Encoder {
    return new Base64Encoder();
  }

  /**
   * Convenience method to create a Base64Decoder instance.
   * @returns A new Base64Decoder instance.
   * @example
   * const decoder = Base64ServiceFactory.createDecoder();
   */
  static createDecoder(): IBase64Decoder {
    return new Base64Decoder();
  }

  /**
   * Retrieves basic information about a service type.
   * @param type - The type of service to query.
   * @returns An object containing the service type.
   * @example
   * const info = Base64ServiceFactory.getServiceInfo('encoder');
   * console.log(info.serviceType); // 'encoder'
   */
  static getServiceInfo(type: Base64ServiceType) {
    const service = this.create(type);
    return {
      serviceType: service.serviceType
    };
  }
}

// Re-export types for convenience
export type { IBase64Service, IBase64Encoder, IBase64Decoder, Base64ServiceType };