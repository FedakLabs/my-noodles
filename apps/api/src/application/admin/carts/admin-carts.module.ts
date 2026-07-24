import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';
import { CartItem, CartModule } from '@/application/cart';
import { VisitorSession } from '@/application/visitor-session';

import { AdminCartsController } from './admin-carts.controller';
import { AdminCartsService } from './admin-carts.service';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, VisitorSession]), AuthModule, CartModule],
  controllers: [AdminCartsController],
  providers: [AdminCartsService],
  exports: [AdminCartsService],
})
export class AdminCartsModule {}
