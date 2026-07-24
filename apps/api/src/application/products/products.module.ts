import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { Collection } from '../collections/collection.entity';
import { Country } from '../countries/country.entity';
import { Seller } from '../sellers/seller.entity';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, Country, Collection, Seller])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
