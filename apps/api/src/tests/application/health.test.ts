import type { Server } from 'node:http';

import { createWinstonModuleOptions } from '@my-noodles/api-lib/logging';
import { type INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import request from 'supertest';

import { HealthController, HealthService } from '@/application/health';
import { config } from '@/config';
import { LoggingModule } from '@/infrastructure/logging';

import { jest } from '../jest-globals';

describe('health (e2e)', () => {
  let app: INestApplication;
  let assertDependenciesReady: jest.MockedFunction<HealthService['assertDependenciesReady']>;

  beforeAll(async () => {
    assertDependenciesReady = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [WinstonModule.forRoot(createWinstonModuleOptions(config)), LoggingModule],
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { assertDependenciesReady } }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    assertDependenciesReady.mockClear();
    assertDependenciesReady.mockResolvedValue(undefined);
  });

  it('GET /api/health/live returns ok without checking dependencies', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/api/health/live').expect(200).expect({ status: 'ok' });
    expect(assertDependenciesReady).not.toHaveBeenCalled();
  });

  it('GET /api/health/ready returns ok when dependencies are ready', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/api/health/ready').expect(200).expect({ status: 'ok' });
    expect(assertDependenciesReady).toHaveBeenCalledTimes(1);
  });

  it('GET /api/health/startup returns ok when dependencies are ready', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/api/health/startup').expect(200).expect({ status: 'ok' });
    expect(assertDependenciesReady).toHaveBeenCalledTimes(1);
  });

  it('GET /api/health/ready returns 503 when dependencies are not ready', async () => {
    assertDependenciesReady.mockRejectedValueOnce(new ServiceUnavailableException('database unreachable'));

    const server = app.getHttpServer() as Server;

    await request(server).get('/api/health/ready').expect(503);
  });
});
