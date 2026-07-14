import type { Request, Response } from 'express';

import { responseDelayMiddleware } from './response-delay';

describe('responseDelayMiddleware', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createResponse() {
    return {} as Response;
  }

  it('calls next immediately when delay is zero', () => {
    const next = jest.fn();
    const middleware = responseDelayMiddleware({ responseDelayMs: 0 });

    middleware({ path: '/api/products' } as Request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('delays non-skipped paths when delay is configured', () => {
    const next = jest.fn();
    const middleware = responseDelayMiddleware({
      responseDelayMs: 1500,
      skipPaths: ['/api/health'],
    });

    middleware({ path: '/api/products' } as Request, createResponse(), next);

    expect(next).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1500);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('skips configured paths', () => {
    const next = jest.fn();
    const middleware = responseDelayMiddleware({
      responseDelayMs: 1500,
      skipPaths: ['/api/health', '/api/docs'],
    });

    middleware({ path: '/api/health' } as Request, createResponse(), next);
    middleware({ path: '/api/docs/json' } as Request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(1500);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
