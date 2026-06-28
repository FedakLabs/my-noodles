import type { AppException as LibAppException } from '@my-noodles/api-lib/exceptions';
import { HttpException } from '@nestjs/common';

export class NestAppException extends HttpException {
  constructor(appError: LibAppException<unknown>) {
    super(appError.toBody(), appError.status);
  }
}

export type NestExceptionClass<Args extends unknown[] = []> = new (...args: Args) => NestAppException;

type AppExceptionClass<Args extends unknown[] = []> = new (...args: Args) => LibAppException<unknown>;

export function nestException<Args extends unknown[]>(
  AppExceptionCtor: AppExceptionClass<Args>,
): NestExceptionClass<Args> {
  class WrappedException extends NestAppException {
    constructor(...args: Args) {
      super(new AppExceptionCtor(...args));
    }
  }

  return WrappedException;
}
