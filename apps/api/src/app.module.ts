import { prepareDataSource } from '@my-noodles/api-lib/persistence';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AdminBrandsModule,
  AdminCartsModule,
  AdminCategoriesModule,
  AdminCountriesModule,
  AdminOrdersModule,
  AdminProductsModule,
} from './application/admin';
import { AuthModule } from './application/auth';
import { CartController, CartModule } from './application/cart';
import { CheckoutsController, CheckoutsModule } from './application/checkouts';
import { CollectionsModule } from './application/collections';
import { CountriesModule } from './application/countries';
import { DeliveryModule } from './application/delivery';
import { FeedController, FeedModule } from './application/feed';
import { HealthModule } from './application/health';
import { OrdersController, OrdersModule } from './application/orders';
import { ProductsModule } from './application/products';
import { SupportController, SupportModule } from './application/support';
import { UsersModule } from './application/users';
import { VisitorSessionMiddleware, VisitorSessionModule } from './application/visitor-session';
import { config } from './config';
import './infrastructure/logging';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    TypeOrmModule.forRoot({
      ...prepareDataSource(config),
      autoLoadEntities: true,
    }),
    VisitorSessionModule,
    UsersModule,
    HealthModule,
    ProductsModule,
    CollectionsModule,
    CountriesModule,
    DeliveryModule,
    CheckoutsModule,
    OrdersModule,
    FeedModule,
    CartModule,
    SupportModule,
    AuthModule,
    AdminOrdersModule,
    AdminBrandsModule,
    AdminCartsModule,
    AdminCategoriesModule,
    AdminCountriesModule,
    AdminProductsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(VisitorSessionMiddleware)
      .forRoutes(CartController, CheckoutsController, FeedController, OrdersController, SupportController);
  }
}
