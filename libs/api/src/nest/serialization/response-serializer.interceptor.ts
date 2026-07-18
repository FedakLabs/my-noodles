import { ClassSerializerInterceptor } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

export class ResponseSerializerInterceptor extends ClassSerializerInterceptor {
  constructor(reflector: Reflector) {
    super(reflector);
  }
}
