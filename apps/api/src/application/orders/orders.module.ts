import { Module } from '@nestjs/common';

import { TransactionalTypeOrmModule } from '@/infrastructure/persistence';

import { InventoryModule } from '../inventory/inventory.module';
import { Order } from './order.entity';
import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InventoryModule, TransactionalTypeOrmModule.forFeature([Order, OrderItem, OrderDelivery])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TransactionalTypeOrmModule, OrdersService],
})
export class OrdersModule {}
