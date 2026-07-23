import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';

import { Brand } from '../../brands/brand.entity';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminBrandsService } from './admin-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), AuthModule],
  controllers: [AdminBrandsController],
  providers: [AdminBrandsService],
  exports: [AdminBrandsService],
})
export class AdminBrandsModule {}
