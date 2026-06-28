import { Module } from '@nestjs/common';

import { TransactionalTypeOrmModule } from '@/infrastructure/persistence';

import { InventoryModule } from '../inventory';
import { Product } from '../products/product.entity';
import { VisitorModule } from '../visitor';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.entity';

@Module({
  imports: [VisitorModule, InventoryModule, TransactionalTypeOrmModule.forFeature([CartItem, Product])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
