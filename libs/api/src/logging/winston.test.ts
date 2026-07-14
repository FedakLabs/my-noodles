import { createAppLogger, createAppLoggerTransports } from './winston';

describe('createAppLogger', () => {
  it('uses console transport only when OTEL is disabled', () => {
    const transports = createAppLoggerTransports({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: { enabled: false },
    });

    expect(transports).toHaveLength(1);
  });

  it('uses console and OTEL transports when OTEL is enabled locally', () => {
    const transports = createAppLoggerTransports({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(transports).toHaveLength(2);
  });

  it('uses OTEL transport only when OTEL is enabled outside local', () => {
    const transports = createAppLoggerTransports({
      appName: 'my-noodles-api',
      nodeEnv: 'dev',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(transports).toHaveLength(1);
  });

  it('creates a winston logger with info level', () => {
    const logger = createAppLogger({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: { enabled: false },
    });

    expect(logger.level).toBe('info');
    expect(logger.transports).toHaveLength(1);
  });
});
