import { Module } from '@nestjs/common';

import { TransactionalTypeOrmModule } from '@/infrastructure/persistence';
import { TelegramModule } from '@/infrastructure/services/Telegram';

import { Product } from '../products/product.entity';
import { Order } from './order.entity';
import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TransactionalTypeOrmModule.forFeature([Order, OrderItem, OrderDelivery, Product]),
    TelegramModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
