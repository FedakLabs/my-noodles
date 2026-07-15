import { TransactionalTypeOrmModule } from '@my-noodles/api-lib/nest';
import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';
import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InventoryModule, TransactionalTypeOrmModule.forFeature([Order, OrderItem, OrderDelivery])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TransactionalTypeOrmModule, OrdersService],
})
export class OrdersModule {}
