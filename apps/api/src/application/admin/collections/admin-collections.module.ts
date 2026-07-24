import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';

import { Collection } from '../../collections/collection.entity';
import { AdminCollectionsController } from './admin-collections.controller';
import { AdminCollectionsService } from './admin-collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection]), AuthModule],
  controllers: [AdminCollectionsController],
  providers: [AdminCollectionsService],
  exports: [AdminCollectionsService],
})
export class AdminCollectionsModule {}
