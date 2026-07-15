import { LoggingModule } from '@my-noodles/api-lib/nest';
import { prepareDataSource } from '@my-noodles/api-lib/persistence';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartModule } from './application/cart';
import { CheckoutsModule } from './application/checkouts';
import { CollectionsModule } from './application/collections';
import { CountriesModule } from './application/countries';
import { DeliveryModule } from './application/delivery';
import { FeedModule } from './application/feed';
import { HealthModule } from './application/health';
import { OrdersModule } from './application/orders';
import { ProductsModule } from './application/products';
import { config } from './config';
import { appLogger } from './infrastructure/logging';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    TypeOrmModule.forRoot({
      ...prepareDataSource(config),
      autoLoadEntities: true,
    }),
    LoggingModule.forRoot({
      logger: appLogger,
      appName: config.appName,
      appVersion: config.appVersion,
    }),
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
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
