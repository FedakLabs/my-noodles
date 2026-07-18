import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { jest } from '../jest-globals';

export type MockNestAppOptions = {
  close?: jest.Mock;
  dataSource?: { isInitialized: boolean; destroy: jest.Mock };
};

export function createMockNestApp(options?: MockNestAppOptions): INestApplication {
  const close = options?.close ?? jest.fn().mockResolvedValue(undefined);
  const dataSource = options?.dataSource ?? {
    isInitialized: true,
    destroy: jest.fn().mockResolvedValue(undefined),
  };

  return {
    close,
    get: jest.fn((token: unknown) => {
      if (token === DataSource) {
        return dataSource;
      }

      return undefined;
    }),
  } as unknown as INestApplication;
}
