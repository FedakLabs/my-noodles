import type { Server } from 'node:http';

import { localeMiddleware } from '@my-noodles/api-lib/locale';
import {
  AppValidationPipe,
  ExceptionsFilter,
  LoggingInterceptor,
  ResponseSerializerInterceptor,
} from '@my-noodles/api-lib/nest';
import { type INestApplication, type ModuleMetadata } from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { API_GLOBAL_PREFIX } from '@/configs/api';
import '@/infrastructure/logging';

export async function createApiTestApp(metadata: ModuleMetadata): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
  app.use(cookieParser());
  app.use(localeMiddleware);
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseSerializerInterceptor(app.get(Reflector)));

  await app.init();
  return app;
}

export function apiHttpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}
