import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { HealthModule } from './application/health/health.module';
import { createWinstonModuleOptions } from './configs/winston.config';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { ormConfig } from './ormconfig';

@Module({
  imports: [
    WinstonModule.forRoot(createWinstonModuleOptions()),
    TypeOrmModule.forRoot({
      ...ormConfig,
      autoLoadEntities: true,
    }),
    LoggingModule,
    HealthModule,
  ],
})
export class AppModule {}
