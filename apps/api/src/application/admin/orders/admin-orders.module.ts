import { Module } from '@nestjs/common';

import { AuthModule } from '@/application/auth';
import { OrdersModule } from '@/application/orders';

import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [OrdersModule, AuthModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminOrdersModule {}
