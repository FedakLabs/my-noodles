import { TransactionalTypeOrmModule } from '@my-noodles/api-lib/nest';
import { Module } from '@nestjs/common';

import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/product.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TransactionalTypeOrmModule.forFeature([Product, OrderItem])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
