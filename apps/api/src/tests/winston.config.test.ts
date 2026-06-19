import { createWinstonModuleOptions } from '../configs/winston.config';

const logging = { appName: 'my-noodles-api', appVersion: 'dev' };

describe('createWinstonModuleOptions', () => {
  it('uses console transport only when OTEL is disabled', () => {
    const options = createWinstonModuleOptions({
      nodeEnv: 'local',
      otel: { enabled: false },
      logging,
    });

    expect(options.transports).toHaveLength(1);
  });

  it('uses console and OTEL transports when OTEL is enabled locally', () => {
    const options = createWinstonModuleOptions({
      nodeEnv: 'local',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
      logging,
    });

    expect(options.transports).toHaveLength(2);
  });

  it('uses OTEL transport only when OTEL is enabled outside local', () => {
    const options = createWinstonModuleOptions({
      nodeEnv: 'dev',
      otel: {
        enabled: true,
        endpoint: 'http://localhost:4318',
        serviceName: 'my-noodles-api',
      },
      logging,
    });

    expect(options.transports).toHaveLength(1);
  });
});
