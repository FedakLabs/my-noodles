import { context, propagation } from '@opentelemetry/api';
import type { NextFunction, Request, Response } from 'express';

export const CLIENT_ID_BAGGAGE_KEY = 'clientId';
export const CLIENT_ID_HEADER = 'x-client-id';

/** Promote `x-client-id` into OTEL baggage so auto-instrumentation forwards it on outgoing calls. */
export function clientBaggageMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (propagation.getBaggage(context.active())?.getEntry(CLIENT_ID_BAGGAGE_KEY)) {
    next();
    return;
  }

  const header = req.headers[CLIENT_ID_HEADER];
  if (typeof header !== 'string' || header.length === 0) {
    next();
    return;
  }

  const currentBaggage = propagation.getBaggage(context.active());
  const baggage = currentBaggage
    ? currentBaggage.setEntry(CLIENT_ID_BAGGAGE_KEY, { value: header })
    : propagation.createBaggage({ [CLIENT_ID_BAGGAGE_KEY]: { value: header } });

  context.with(propagation.setBaggage(context.active(), baggage), () => next());
}
