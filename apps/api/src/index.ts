import 'reflect-metadata';

import { config } from './config';
import { initOtelInstrumentation } from './otel-instrumentation';

initOtelInstrumentation();

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';

import { AppModule } from './app.module';
import { createWinstonModuleOptions } from './configs/winston.config';
import { API_GLOBAL_PREFIX, SWAGGER_JSON_PATH, SWAGGER_UI_PATH } from './constants';
import { clientBaggageMiddleware } from './infrastructure/logging/client-baggage.middleware';
import { ManifestHttpExceptionFilter } from './infrastructure/logging/manifest-http-exception.filter';
import { registerGracefulShutdown } from './shutdown/graceful-shutdown';

async function bootstrap() {
  const logger = WinstonModule.createLogger(createWinstonModuleOptions());

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalFilters(
    new ManifestHttpExceptionFilter(app.get(HttpAdapterHost), app.get(WINSTON_MODULE_PROVIDER)),
  );

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.use(clientBaggageMiddleware);

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle(config.logging.appName).setVersion(config.logging.appVersion).build(),
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
