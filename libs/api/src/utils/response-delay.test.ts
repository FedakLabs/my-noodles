import type { Request, Response } from 'express';

import { delay, responseDelayMiddleware, shouldDelayResponse } from './response-delay';

describe('shouldDelayResponse', () => {
  it('returns false when delay is zero', () => {
    expect(shouldDelayResponse('/api/products', { delayMs: 0 })).toBe(false);
  });

  it('returns true for non-skipped paths when delay is configured', () => {
    expect(shouldDelayResponse('/api/products', { delayMs: 1500, skipPaths: ['/api/health'] })).toBe(true);
  });

  it('returns false for skipped paths', () => {
    expect(shouldDelayResponse('/api/health', { delayMs: 1500, skipPaths: ['/api/health'] })).toBe(false);
    expect(shouldDelayResponse('/api/docs/json', { delayMs: 1500, skipPaths: ['/api/docs'] })).toBe(false);
  });
});

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves immediately when delay is zero', async () => {
    const pending = delay(0);
    await expect(pending).resolves.toBeUndefined();
  });

  it('resolves after the configured delay', async () => {
    let resolved = false;
    void delay(1500).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1500);
    await Promise.resolve();
    expect(resolved).toBe(true);
  });
});

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
