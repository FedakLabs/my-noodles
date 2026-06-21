import 'reflect-metadata';

import { createWinstonModuleOptions } from '@my-noodles/api-lib/logging';
import { clientBaggageMiddleware, responseDelayMiddleware } from '@my-noodles/api-lib/middlewares';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';

import { AppModule } from './app.module';
import { config } from './config';
import { API_GLOBAL_PREFIX, SWAGGER_JSON_PATH, SWAGGER_UI_PATH } from './configs/api';
import { localeMiddleware } from './infrastructure/i18n';
import { HttpExceptionLogFilter } from './infrastructure/logging';
import { registerGracefulShutdown } from './shutdown';

async function bootstrap() {
  const logger = WinstonModule.createLogger(createWinstonModuleOptions(config));

  const app = await NestFactory.create(AppModule, { logger });

  app.enableCors();

  app.useGlobalFilters(
    new HttpExceptionLogFilter(app.get(HttpAdapterHost), app.get(WINSTON_MODULE_PROVIDER)),
  );

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
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
  logger.log(`Listening on ${origin}/${API_GLOBAL_PREFIX}`, 'Bootstrap');
  logger.log(`Swagger UI at ${origin}/${SWAGGER_UI_PATH}`, 'Bootstrap');
  logger.log(`OpenAPI JSON at ${origin}/${SWAGGER_JSON_PATH}`, 'Bootstrap');
}

void bootstrap();
