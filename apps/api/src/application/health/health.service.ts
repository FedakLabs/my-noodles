import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ServiceUnavailableException } from '@/infrastructure/exceptions';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async assertDependenciesReady(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException('database not initialized');
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('database unreachable');
    }
  }
}
