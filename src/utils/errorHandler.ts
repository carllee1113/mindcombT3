import { MindMapError } from '../errors/MindMapError';

export const handleError = (error: unknown, defaultMessage: string): void => {
  if (error instanceof MindMapError) {
    console.error(`Error Code: ${error.code}`, {
      message: error.message,
      context: error.context
    });
  } else {
    console.error(defaultMessage, error);
  }
};

export const throwMindMapError = (
  message: string,
  code: string,
  context?: Record<string, unknown>
): never => {
  throw new MindMapError(message, code, context);
};