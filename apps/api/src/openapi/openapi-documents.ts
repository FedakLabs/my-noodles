import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AdminBrandsModule } from '@/application/admin/brands';
import { AdminCategoriesModule } from '@/application/admin/categories';
import { AdminCountriesModule } from '@/application/admin/countries';
import { AdminOrdersModule } from '@/application/admin/orders';
import { AdminProductsModule } from '@/application/admin/products';
import { AuthModule } from '@/application/auth';
import { CartModule } from '@/application/cart';
import { CheckoutsModule } from '@/application/checkouts';
import { CollectionsModule } from '@/application/collections';
import { CountriesModule } from '@/application/countries';
import { DeliveryModule } from '@/application/delivery';
import { FeedModule } from '@/application/feed';
import { HealthModule } from '@/application/health';
import { OrdersModule } from '@/application/orders';
import { ProductsModule } from '@/application/products';
import { config } from '@/config';

export function createStorefrontOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle(`${config.appName} — Storefront`).setVersion(config.appVersion).build(),
    {
      include: [
        HealthModule,
        ProductsModule,
        CollectionsModule,
        CountriesModule,
        DeliveryModule,
        CheckoutsModule,
        OrdersModule,
        FeedModule,
        CartModule,
      ],
    },
  );
}

export function createAdminOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${config.appName} — Admin`)
      .setVersion(config.appVersion)
      .addBearerAuth()
      .build(),
    {
      include: [
        AdminOrdersModule,
        AdminBrandsModule,
        AdminCategoriesModule,
        AdminCountriesModule,
        AdminProductsModule,
      ],
    },
  );
}

export function createAuthOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${config.appName} — Auth`)
      .setVersion(config.appVersion)
      .addBearerAuth()
      .build(),
    {
      include: [AuthModule],
    },
  );
}
