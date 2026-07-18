import { logger } from '../logger';

export type AnyError = any;

export type ErrorMatcher = (error: AnyError) => boolean;

export interface ErrorMatcherProps {
  classes?: AnyError[];
  identifiers?: string[];
  customMatch?: ErrorMatcher;
}

export function errorMatcher({ classes, identifiers, customMatch }: ErrorMatcherProps): ErrorMatcher {
  return (error: AnyError) => {
    if (classes?.some((Error) => error instanceof Error)) return true;
    if (
      identifiers?.some(
        (identifier) => error?.body?.identifier === identifier || error?.identifier === identifier,
      )
    )
      return true;
    return !!customMatch?.(error);
  };
}

export async function withErrorGate<T>(
  operation: () => T | Promise<T>,
  {
    whitelistedErrors,
    onUnhandledError,
    errorLogId,
  }: {
    /** if an operation throws one of these, they will be forwarded */
    whitelistedErrors?: ErrorMatcherProps;
    /** this should always rethrow an error */
    onUnhandledError: (error: any) => never;
    errorLogId: string;
  },
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (whitelistedErrors && errorMatcher(whitelistedErrors)(error)) {
      logger.error(`${errorLogId}:withErrorGate`, { error });
      throw error;
    }
    try {
      onUnhandledError(error);
      // ideally should never happen, but just in case
      throw new Error('Error in withErrorGate was not whitelisted nor rethrown properly');
    } catch (fallbackError) {
      logger.error(`${errorLogId}:withErrorGate`, {
        unhandledError: error,
        fallbackError,
      });
      throw fallbackError;
    }
  }
}

export function catchIf<T>(
  props: ErrorMatcherProps,
  res: ((error: any) => T | Promise<T>) | T,
): (error: any) => Promise<T> {
  const matcher = errorMatcher(props);
  return async (error: any): Promise<T> => {
    if (matcher(error)) {
      return typeof res === 'function' ? (res as (error: any) => T | Promise<T>)(error) : res;
    }
    return Promise.reject(error);
  };
}
