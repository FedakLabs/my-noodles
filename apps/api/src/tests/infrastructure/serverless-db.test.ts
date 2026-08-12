import { ServerlessDbUtils } from '@/infrastructure/persistence';

import { jest } from '../jest-globals';

describe('ServerlessDbUtils.isTransientError', () => {
  it('matches serverless SQLSTATEs', () => {
    expect(ServerlessDbUtils.isTransientError(Object.assign(new Error('down'), { code: '57P01' }))).toBe(
      true,
    );
    expect(ServerlessDbUtils.isTransientError(Object.assign(new Error('fail'), { code: '08006' }))).toBe(
      true,
    );
  });

  it('matches node connection codes', () => {
    expect(
      ServerlessDbUtils.isTransientError(Object.assign(new Error('reset'), { code: 'ECONNRESET' })),
    ).toBe(true);
    expect(
      ServerlessDbUtils.isTransientError(Object.assign(new Error('refused'), { code: 'ECONNREFUSED' })),
    ).toBe(true);
  });

  it('matches known cold-start messages', () => {
    expect(ServerlessDbUtils.isTransientError(new Error("Couldn't connect to compute node"))).toBe(true);
    expect(ServerlessDbUtils.isTransientError(new Error('Connection terminated unexpectedly'))).toBe(true);
  });

  it('walks error.cause', () => {
    const root = Object.assign(new Error('wrapper'), {
      cause: Object.assign(new Error('inner'), { code: '57P03' }),
    });
    expect(ServerlessDbUtils.isTransientError(root)).toBe(true);
  });

  it('rejects ordinary query / auth failures', () => {
    expect(ServerlessDbUtils.isTransientError(Object.assign(new Error('duplicate'), { code: '23505' }))).toBe(
      false,
    );
    expect(ServerlessDbUtils.isTransientError(Object.assign(new Error('auth'), { code: '28P01' }))).toBe(
      false,
    );
    expect(ServerlessDbUtils.isTransientError(new Error('invalid input syntax'))).toBe(false);
  });
});

describe('ServerlessDbUtils.retryOnTransientError', () => {
  it('returns on first success', async () => {
    const operation = jest.fn().mockResolvedValue('ok');

    await expect(
      ServerlessDbUtils.retryOnTransientError(operation, { retries: 3, minDelayMs: 0 }),
    ).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries transient failures then succeeds', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('wake'), { code: '57P01' }))
      .mockResolvedValueOnce('ok');

    await expect(
      ServerlessDbUtils.retryOnTransientError(operation, { retries: 3, minDelayMs: 0, maxDelayMs: 0 }),
    ).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-transient failures', async () => {
    const error = Object.assign(new Error('duplicate key'), { code: '23505' });
    const operation = jest.fn().mockRejectedValue(error);

    await expect(
      ServerlessDbUtils.retryOnTransientError(operation, { retries: 3, minDelayMs: 0, maxDelayMs: 0 }),
    ).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('stops after exhausting retries', async () => {
    const error = Object.assign(new Error('still waking'), { code: '08006' });
    const operation = jest.fn().mockRejectedValue(error);

    await expect(
      ServerlessDbUtils.retryOnTransientError(operation, { retries: 3, minDelayMs: 0, maxDelayMs: 0 }),
    ).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
