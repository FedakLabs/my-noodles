import 'reflect-metadata';

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '../app.module';
import { config } from '../config';
import { API_GLOBAL_PREFIX } from '../configs/api';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle(config.appName).setVersion(config.appVersion).build(),
  );

  writeFileSync(resolve(process.cwd(), 'src/openapi/openapi.json'), `${JSON.stringify(document, null, 2)}\n`);

  await app.close();
}

void generateOpenApi();
