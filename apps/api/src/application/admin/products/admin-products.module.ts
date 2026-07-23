import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';

import { Brand } from '../../brands/brand.entity';
import { Category } from '../../categories/category.entity';
import { Country } from '../../countries/country.entity';
import { Product } from '../../products/product.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, Country]), AuthModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
