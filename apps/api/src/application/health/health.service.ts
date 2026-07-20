import { ServiceUnavailableException } from '@my-noodles/api-lib/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async assertDependenciesReady(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException({ message: 'database not initialized' });
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({ message: 'database unreachable' });
    }
  }
}
