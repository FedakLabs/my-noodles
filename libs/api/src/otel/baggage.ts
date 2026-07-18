import { context, propagation } from '@opentelemetry/api';

/** Snapshot of the active OTEL baggage as a flat `key -> value` object. */
export function getOtelBaggageObject(): Record<string, string> {
  const baggage = propagation.getBaggage(context.active());
  if (!baggage) {
    return {};
  }

  return Object.fromEntries(baggage.getAllEntries().map(([key, entry]) => [key, entry.value]));
}
