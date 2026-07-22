import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { API_GLOBAL_PREFIX } from '../configs/api';
import {
  createAdminOpenApiDocument,
  createAuthOpenApiDocument,
  createStorefrontOpenApiDocument,
} from './openapi-documents';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  const storefrontDocument = createStorefrontOpenApiDocument(app);
  const adminDocument = createAdminOpenApiDocument(app);
  const authDocument = createAuthOpenApiDocument(app);

  writeFileSync(
    resolve(process.cwd(), 'src/openapi/openapi.json'),
    `${JSON.stringify(storefrontDocument, null, 2)}\n`,
  );
  writeFileSync(
    resolve(process.cwd(), 'src/openapi/openapi-admin.json'),
    `${JSON.stringify(adminDocument, null, 2)}\n`,
  );
  writeFileSync(
    resolve(process.cwd(), 'src/openapi/openapi-auth.json'),
    `${JSON.stringify(authDocument, null, 2)}\n`,
  );

  await app.close();
}

void generateOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
