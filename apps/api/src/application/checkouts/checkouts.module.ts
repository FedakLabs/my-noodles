import { Module } from '@nestjs/common';

import { TelegramModule } from '@/infrastructure/external-apis/telegram';
import { TransactionalTypeOrmModule } from '@/infrastructure/persistence';

import { CartModule } from '../cart';
import { DeliveryModule } from '../delivery';
import { InventoryModule } from '../inventory';
import { Order } from '../orders/order.entity';
import { OrderDelivery } from '../orders/order-delivery.entity';
import { OrderItem } from '../orders/order-item.entity';
import { VisitorModule } from '../visitor';
import { Checkout } from './checkout.entity';
import { CheckoutExpiryCron } from './checkout-expiry.cron';
import { CheckoutsController } from './checkouts.controller';
import { CheckoutsService } from './checkouts.service';

@Module({
  imports: [
    VisitorModule,
    CartModule,
    InventoryModule,
    DeliveryModule,
    TransactionalTypeOrmModule.forFeature([Checkout, Order, OrderItem, OrderDelivery]),
    TelegramModule,
  ],
  controllers: [CheckoutsController],
  providers: [CheckoutsService, CheckoutExpiryCron],
  exports: [CheckoutsService],
})
export class CheckoutsModule {}
