import { type DataSource } from 'typeorm';

import { HealthService } from '@/application/health';
import { ServiceUnavailableException } from '@/infrastructure/exceptions';

import { jest } from '../jest-globals';

describe('HealthService', () => {
  it('passes when Postgres responds to SELECT 1', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const service = new HealthService({ isInitialized: true, query } as unknown as DataSource);

    await expect(service.assertDependenciesReady()).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('throws 503 when the database connection is not initialized', async () => {
    const service = new HealthService({ isInitialized: false } as unknown as DataSource);

    await expect(service.assertDependenciesReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws 503 when Postgres is unreachable', async () => {
    const query = jest.fn().mockRejectedValue(new Error('connection refused'));
    const service = new HealthService({ isInitialized: true, query } as unknown as DataSource);

    await expect(service.assertDependenciesReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
