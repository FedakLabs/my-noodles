import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';

import { Seller } from '../../sellers/seller.entity';
import { AdminSellersController } from './admin-sellers.controller';
import { AdminSellersService } from './admin-sellers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Seller]), AuthModule],
  controllers: [AdminSellersController],
  providers: [AdminSellersService],
  exports: [AdminSellersService],
})
export class AdminSellersModule {}
