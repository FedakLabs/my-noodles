import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

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
