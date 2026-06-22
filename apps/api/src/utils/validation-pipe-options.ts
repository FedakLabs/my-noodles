import type { ValidationPipeOptions } from '@nestjs/common';

export const VALIDATION_PIPE_OPTIONS = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
} satisfies ValidationPipeOptions;
