import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/application/auth';

import { Country } from '../../countries/country.entity';
import { AdminCountriesController } from './admin-countries.controller';
import { AdminCountriesService } from './admin-countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country]), AuthModule],
  controllers: [AdminCountriesController],
  providers: [AdminCountriesService],
  exports: [AdminCountriesService],
})
export class AdminCountriesModule {}
