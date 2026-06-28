import {
  BadRequestException as LibBadRequestException,
  ConflictException as LibConflictException,
  NotFoundException as LibNotFoundException,
  ServiceUnavailableException as LibServiceUnavailableException,
} from '@my-noodles/api-lib/exceptions';

import { nestException } from './nest-exception';

export const BadRequestException = nestException(LibBadRequestException);
export const NotFoundException = nestException(LibNotFoundException);
export const ConflictException = nestException(LibConflictException);
export const ServiceUnavailableException = nestException(LibServiceUnavailableException);
