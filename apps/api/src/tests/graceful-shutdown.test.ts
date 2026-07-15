import { GracefulShutdown } from '@my-noodles/api-lib/nest';

import { createMockNestApp } from './helpers/nest-app';
import { mockProcessExit } from './helpers/process';

describe('GracefulShutdown', () => {
  const exitSpy = mockProcessExit();

  beforeEach(() => {
    exitSpy.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    exitSpy.mockRestore();
  });

  it('closes the app and database, then exits cleanly', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    const app = createMockNestApp({
      close,
      dataSource: { isInitialized: true, destroy },
    });

    await new GracefulShutdown(app, { timeoutMs: 30_000 }).shutdown('SIGTERM');

    expect(close).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('ignores duplicate shutdown signals while the first shutdown is in progress', async () => {
    let resolveClose: (() => void) | undefined;
    const closePromise = new Promise<void>((resolve) => {
      resolveClose = resolve;
    });
    const close = jest.fn().mockReturnValue(closePromise);
    const app = createMockNestApp({ close });
    const gracefulShutdown = new GracefulShutdown(app, { timeoutMs: 30_000 });

    const firstShutdown = gracefulShutdown.shutdown('SIGTERM');
    await gracefulShutdown.shutdown('SIGINT');

    expect(close).toHaveBeenCalledTimes(1);

    resolveClose?.();
    await firstShutdown;
  });

  it('skips database teardown when the connection is already closed', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);
    const app = createMockNestApp({
      dataSource: { isInitialized: false, destroy },
    });

    await new GracefulShutdown(app, { timeoutMs: 30_000 }).shutdown('SIGTERM');

    expect(destroy).not.toHaveBeenCalled();
  });

  it('force-exits when shutdown exceeds the configured timeout', () => {
    const close = jest.fn().mockReturnValue(new Promise<void>(() => undefined));
    const app = createMockNestApp({ close });

    void new GracefulShutdown(app, { timeoutMs: 30_000 }).shutdown('SIGTERM');
    jest.advanceTimersByTime(30_000);

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
