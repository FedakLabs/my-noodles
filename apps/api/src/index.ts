import 'reflect-metadata';

import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { clientBaggageMiddleware, responseDelayMiddleware } from '@my-noodles/api-lib/middlewares';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Logger } from 'winston';

import { HttpExceptionLogFilter } from '@/infrastructure/logging';
import { validationPipe } from '@/utils/validation-pipe';

import { AppModule } from './app.module';
import { config } from './config';
import { API_GLOBAL_PREFIX, SWAGGER_JSON_PATH, SWAGGER_UI_PATH } from './configs/api';
import { localeMiddleware } from './infrastructure/i18n';
import { registerGracefulShutdown } from './infrastructure/shutdown';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get<Logger>(APP_LOGGER);

  // `credentials: true` + reflected origin so the storefront can send the feed session cookie cross-origin.
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalFilters(new HttpExceptionLogFilter(app.get(HttpAdapterHost), app.get(APP_LOGGER)));

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(validationPipe);
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

  registerGracefulShutdown(app);

  await app.listen(config.port);

  const origin = `http://localhost:${config.port}`;
  logger.info({ msg: 'bootstrap.listening', origin, path: `/${API_GLOBAL_PREFIX}` });
  logger.info({ msg: 'bootstrap.swagger.ui', url: `${origin}/${SWAGGER_UI_PATH}` });
  logger.info({ msg: 'bootstrap.swagger.json', url: `${origin}/${SWAGGER_JSON_PATH}` });
}

void bootstrap();
