import { gracefulShutdown, resetGracefulShutdownState } from '../shutdown';
import { createMockNestApp } from './helpers/nest-app';
import { mockProcessExit } from './helpers/process';

describe('gracefulShutdown', () => {
  const exitSpy = mockProcessExit();

  beforeEach(() => {
    resetGracefulShutdownState();
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

    await gracefulShutdown(app, 'SIGTERM');

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

    const firstShutdown = gracefulShutdown(app, 'SIGTERM');
    await gracefulShutdown(app, 'SIGINT');

    expect(close).toHaveBeenCalledTimes(1);

    resolveClose?.();
    await firstShutdown;
  });

  it('skips database teardown when the connection is already closed', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);
    const app = createMockNestApp({
      dataSource: { isInitialized: false, destroy },
    });

    await gracefulShutdown(app, 'SIGTERM');

    expect(destroy).not.toHaveBeenCalled();
  });

  it('force-exits when shutdown exceeds the configured timeout', () => {
    const close = jest.fn().mockReturnValue(new Promise<void>(() => undefined));
    const app = createMockNestApp({ close });

    void gracefulShutdown(app, 'SIGTERM');
    jest.advanceTimersByTime(30_000);

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
