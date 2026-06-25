import type { Server } from 'node:http';

import { type INestApplication, type ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { API_GLOBAL_PREFIX } from '@/configs/api';
import { localeMiddleware } from '@/infrastructure/i18n';
import { VALIDATION_PIPE_OPTIONS } from '@/utils/validation-pipe-options';

export async function createApiTestApp(metadata: ModuleMetadata): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.use(cookieParser());
  app.use(localeMiddleware);
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));

  await app.init();
  return app;
}

export function apiHttpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}
