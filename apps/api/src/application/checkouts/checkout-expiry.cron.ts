import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { Logger } from 'winston';

import { CheckoutsService } from './checkouts.service';

const CHECKOUT_EXPIRY_INTERVAL_MS = 10_000;

@Injectable()
export class CheckoutExpiryCron {
  constructor(
    @Inject(CheckoutsService) private readonly checkoutsService: CheckoutsService,
    @Inject(APP_LOGGER) private readonly logger: Logger,
  ) {}

  @Interval(CHECKOUT_EXPIRY_INTERVAL_MS)
  async expireStaleCheckouts(): Promise<void> {
    try {
      await this.checkoutsService.expireStaleCheckouts();
    } catch (error) {
      this.logger.error({
        msg: 'checkouts.expire.failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
