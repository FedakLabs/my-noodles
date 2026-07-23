import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';
import { OrdersModule } from '@/application/orders';
import { Order } from '@/application/orders/order.entity';

import { AdminOrder } from './admin-order.entity';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [OrdersModule, AuthModule],
  controllers: [AdminOrdersController],
  providers: [
    AdminOrdersService,
    {
      provide: getRepositoryToken(AdminOrder),
      useExisting: getRepositoryToken(Order),
    },
  ],
})
export class AdminOrdersModule {}
