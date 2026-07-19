import { TransactionalTypeOrmModule } from '@my-noodles/api-lib/nest';
import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory';
import { Product } from '../products/product.entity';
import { VisitorSessionModule } from '../visitor-session';
import { CartItem } from './cart-item.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    VisitorSessionModule,
    InventoryModule,
    TransactionalTypeOrmModule.forFeature([CartItem, Product]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
