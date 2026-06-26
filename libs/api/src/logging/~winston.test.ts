import winston from 'winston';

import { WinstonLoggerFactory } from './winston';

describe('WinstonLoggerFactory', () => {
  it('uses console transport only when OTEL is disabled', () => {
    const factory = new WinstonLoggerFactory({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: { enabled: false },
    });

    expect(factory.createTransports(winston.format.simple())).toHaveLength(1);
  });

  it('uses console and OTEL transports when OTEL is enabled locally', () => {
    const factory = new WinstonLoggerFactory({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(factory.createTransports(winston.format.simple())).toHaveLength(2);
  });

  it('uses OTEL transport only when OTEL is enabled outside local', () => {
    const factory = new WinstonLoggerFactory({
      appName: 'my-noodles-api',
      nodeEnv: 'dev',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(factory.createTransports(winston.format.simple())).toHaveLength(1);
  });
});
