import type { Request } from 'express';

type TimedRequest = Request & { startTimeMs?: number };

const requestStartTimes = new WeakMap<Request, number>();

export function markRequestStart(request: Request): number {
  const started = performance.now();
  requestStartTimes.set(request, started);
  return started;
}

export function getRequestStartTimeMs(request: Request): number {
  return requestStartTimes.get(request) ?? (request as TimedRequest).startTimeMs ?? performance.now();
}
