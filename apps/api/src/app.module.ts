import { createWinstonModuleOptions } from '@my-noodles/api-lib/logging';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { CollectionsModule } from './application/collections';
import { CountriesModule } from './application/countries';
import { HealthModule } from './application/health';
import { OrdersModule } from './application/orders';
import { ProductsModule } from './application/products';
import { config } from './config';
import { LoggingModule } from './infrastructure/logging';
import { prepareDataSource } from './infrastructure/persistence';

@Module({
  imports: [
    WinstonModule.forRoot(createWinstonModuleOptions(config)),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    TypeOrmModule.forRoot({
      ...prepareDataSource(config),
      autoLoadEntities: true,
    }),
    LoggingModule,
    HealthModule,
    ProductsModule,
    CollectionsModule,
    CountriesModule,
    OrdersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
