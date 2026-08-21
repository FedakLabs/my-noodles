import { PostgresTypeOrmResilience } from '@my-noodles/api-lib/persistence';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

/** Connects the shared PostgreSQL resilience adapter to the Nest application lifecycle. */
@Injectable()
export class PostgresTypeOrmInstaller implements OnApplicationBootstrap {
  private readonly resilience = new PostgresTypeOrmResilience();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.resilience.install(this.dataSource);
  }
}
