import { createWinstonModuleOptions } from './winston';

describe('createWinstonModuleOptions', () => {
  it('uses console transport only when OTEL is disabled', () => {
    const options = createWinstonModuleOptions({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: { enabled: false },
    });

    expect(options.transports).toHaveLength(1);
  });

  it('uses console and OTEL transports when OTEL is enabled locally', () => {
    const options = createWinstonModuleOptions({
      appName: 'my-noodles-api',
      nodeEnv: 'local',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(options.transports).toHaveLength(2);
  });

  it('uses OTEL transport only when OTEL is enabled outside local', () => {
    const options = createWinstonModuleOptions({
      appName: 'my-noodles-api',
      nodeEnv: 'dev',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
    });

    expect(options.transports).toHaveLength(1);
  });
});
