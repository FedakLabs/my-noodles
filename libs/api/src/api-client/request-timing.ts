/** Framework-agnostic timing keyed by any object token (request, config, etc.). */
const startTimes = new WeakMap<object, number>();

export function markTimingStart(token: object): number {
  const started = performance.now();
  startTimes.set(token, started);
  return started;
}

export function getTimingStartMs(token: object): number {
  return startTimes.get(token) ?? performance.now();
}

export function getTimingElapsedMs(token: object, startedMs?: number): number {
  return performance.now() - (startedMs ?? getTimingStartMs(token));
}
