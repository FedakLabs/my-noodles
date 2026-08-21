import { DatabaseRetry } from './database-retry';

describe('DatabaseRetry', () => {
  it('retries only when the predicate accepts the error', async () => {
    const error = Object.assign(new Error('wake'), { code: '57P01' });
    const operation = jest.fn().mockRejectedValue(error);

    await expect(
      new DatabaseRetry({ minDelayMs: 0 }).run(operation, {
        attempts: 3,
        shouldRetry: (value) => (value as { code?: string }).code === '57P01',
      }),
    ).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('does not retry when the predicate rejects the error', async () => {
    const error = Object.assign(new Error('duplicate'), { code: '23505' });
    const operation = jest.fn().mockRejectedValue(error);

    await expect(
      new DatabaseRetry({ minDelayMs: 0 }).run(operation, {
        attempts: 3,
        shouldRetry: () => false,
      }),
    ).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('returns immediately after a successful attempt', async () => {
    const operation = jest.fn().mockResolvedValue('ok');

    await expect(new DatabaseRetry().run(operation)).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
