import { ValidationPipe } from '@nestjs/common';

import { flattenValidationErrors, ValidationException } from '../../exceptions';

/** Nest ValidationPipe wired to framework-agnostic `ValidationException`. */
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new ValidationException({ fields: flattenValidationErrors(errors) }),
    });
  }
}
