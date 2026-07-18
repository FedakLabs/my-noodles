import 'reflect-metadata';
import { localeMiddleware } from '@my-noodles/api-lib/locale';
import { logger } from '@my-noodles/api-lib/logger';
import {
  AppValidationPipe,
  ExceptionsFilter,
  GracefulShutdown,
  LoggingInterceptor,
  ResponseSerializerInterceptor,
} from '@my-noodles/api-lib/nest';
import { clientBaggageMiddleware } from '@my-noodles/api-lib/otel';
import { responseDelayMiddleware } from '@my-noodles/api-lib/utils';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { config } from './config';
import { API_GLOBAL_PREFIX, SWAGGER_JSON_PATH, SWAGGER_UI_PATH } from './configs/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // `credentials: true` + reflected origin so the storefront can send the feed session cookie cross-origin.
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());
  app.use(clientBaggageMiddleware);
  app.use(localeMiddleware);
  app.use(
    responseDelayMiddleware({
      responseDelayMs: config.responseDelayMs,
      skipPaths: [`/${API_GLOBAL_PREFIX}/health`, `/${SWAGGER_UI_PATH}`, `/${SWAGGER_JSON_PATH}`],
    }),
  );

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle(config.appName).setVersion(config.appVersion).build(),
  );
  SwaggerModule.setup(SWAGGER_UI_PATH, app, swaggerDocument, { jsonDocumentUrl: SWAGGER_JSON_PATH });

  new GracefulShutdown(app, {
    timeoutMs: config.shutdownTimeoutMs,
    enabled: config.nodeEnv !== 'local',
  }).register();

  await app.listen(config.port);

  const origin = `http://localhost:${config.port}`;
  logger.info({ msg: 'bootstrap.listening', origin, path: `/${API_GLOBAL_PREFIX}` });
  logger.info({ msg: 'bootstrap.swagger.ui', url: `${origin}/${SWAGGER_UI_PATH}` });
  logger.info({ msg: 'bootstrap.swagger.json', url: `${origin}/${SWAGGER_JSON_PATH}` });
}

void bootstrap();
