import { TransactionalTypeOrmModule } from '@my-noodles/api-lib/nest';
import { Module } from '@nestjs/common';

import { TelegramModule } from '@/application/telegram';

import { CartModule } from '../cart';
import { DeliveryModule } from '../delivery';
import { InventoryModule } from '../inventory';
import { OrderDelivery } from '../orders/order-delivery.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';
import { VisitorModule } from '../visitor';
import { CheckoutExpiryCron } from './checkout-expiry.cron';
import { Checkout } from './checkout.entity';
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
