import { logger } from '@my-noodles/api-lib/logger';

import { CheckoutExpiryCron } from '@/application/checkouts/checkout-expiry.cron';
import { type CheckoutsService } from '@/application/checkouts/checkouts.service';

import { afterEach, describe, expect, it, jest } from '../jest-globals';

describe('CheckoutExpiryCron', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('delegates to CheckoutsService.expireStaleCheckouts', async () => {
    const expireStaleCheckouts = jest.fn().mockResolvedValue(undefined);
    const cron = new CheckoutExpiryCron({ expireStaleCheckouts } as unknown as CheckoutsService);

    await cron.expireStaleCheckouts();

    expect(expireStaleCheckouts).toHaveBeenCalled();
  });

  it('logs errors without throwing', async () => {
    const expireStaleCheckouts = jest.fn().mockRejectedValue(new Error('db down'));
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);
    const cron = new CheckoutExpiryCron({ expireStaleCheckouts } as unknown as CheckoutsService);

    await expect(cron.expireStaleCheckouts()).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
