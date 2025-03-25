import { handleError } from './errorHandler';

export function withErrorHandling(defaultMessage: string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        handleError(error, defaultMessage);
      }
    };

    return descriptor;
  };
}