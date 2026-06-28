import { CheckoutExpiryCron } from '@/application/checkouts/checkout-expiry.cron';
import { type CheckoutsService } from '@/application/checkouts/checkouts.service';

import { describe, expect, it, jest } from '../jest-globals';

describe('CheckoutExpiryCron', () => {
  it('delegates to CheckoutsService.expireStaleCheckouts', async () => {
    const expireStaleCheckouts = jest.fn().mockResolvedValue(undefined);
    const cron = new CheckoutExpiryCron(
      { expireStaleCheckouts } as unknown as CheckoutsService,
      { error: jest.fn() } as never,
    );

    await cron.expireStaleCheckouts();

    expect(expireStaleCheckouts).toHaveBeenCalled();
  });

  it('logs errors without throwing', async () => {
    const expireStaleCheckouts = jest.fn().mockRejectedValue(new Error('db down'));
    const error = jest.fn();
    const cron = new CheckoutExpiryCron(
      { expireStaleCheckouts } as unknown as CheckoutsService,
      { error } as never,
    );

    await expect(cron.expireStaleCheckouts()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalled();
  });
});
