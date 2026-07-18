import { resolveSeverity, SEVERITY } from './severity';

describe('resolveSeverity', () => {
  it('maps HTTP status: 5xx → ERROR, else INFO', () => {
    expect(resolveSeverity({ status: 500 })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ status: 502 })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ status: 404 })).toEqual(SEVERITY.INFO);
    expect(resolveSeverity({ status: 200 })).toEqual(SEVERITY.INFO);
    expect(resolveSeverity({ status: 399 })).toEqual(SEVERITY.INFO);
  });

  it('maps status/error: 2xx/missing with error → ERROR, else follows status', () => {
    expect(resolveSeverity({ status: 200, error: new Error('app') })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ error: new Error('network') })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ status: 404, error: new Error('nf') })).toEqual(SEVERITY.INFO);
    expect(resolveSeverity({ status: 502, error: new Error('bg') })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ status: 200 })).toEqual(SEVERITY.INFO);
    expect(resolveSeverity()).toEqual(SEVERITY.INFO);
  });

  it('maps winston npm levels to OTEL severity', () => {
    expect(resolveSeverity({ level: 'error' })).toEqual(SEVERITY.ERROR);
    expect(resolveSeverity({ level: 'WARN' })).toEqual(SEVERITY.WARN);
    expect(resolveSeverity({ level: 'warning' })).toEqual(SEVERITY.WARN);
    expect(resolveSeverity({ level: 'info' })).toEqual(SEVERITY.INFO);
    expect(resolveSeverity({ level: 'debug' })).toEqual(SEVERITY.DEBUG);
    expect(resolveSeverity({ level: 'http' })).toEqual(SEVERITY.DEBUG);
    expect(resolveSeverity({ level: 'silly' })).toEqual(SEVERITY.TRACE);
    expect(resolveSeverity({ level: 'verbose' })).toEqual(SEVERITY.TRACE);
    expect(resolveSeverity({ level: 'unknown' })).toEqual(SEVERITY.INFO);
  });
});
