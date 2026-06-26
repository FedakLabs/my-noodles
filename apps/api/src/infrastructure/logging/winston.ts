import { WinstonLoggerFactory } from '@my-noodles/api-lib/logging';
import type { WinstonModuleOptions } from 'nest-winston';
import { utilities, WinstonModule } from 'nest-winston';

import { config } from '@/config';

export class NestWinstonModule {
  private static readonly moduleOptionsValue = NestWinstonModule.buildOptions();
  private static readonly loggerValue = WinstonModule.createLogger(NestWinstonModule.moduleOptionsValue);

  static get options(): WinstonModuleOptions {
    return NestWinstonModule.moduleOptionsValue;
  }

  static get logger(): ReturnType<typeof WinstonModule.createLogger> {
    return NestWinstonModule.loggerValue;
  }

  private static buildOptions(): WinstonModuleOptions {
    const logServiceName = config.otel.enabled ? config.otel.serviceName : config.appName;

    return {
      transports: new WinstonLoggerFactory({
        appName: config.appName,
        nodeEnv: config.nodeEnv,
        otel: config.otel,
      }).createTransports(
        utilities.format.nestLike(logServiceName, {
          colors: config.nodeEnv !== 'prod',
          prettyPrint: true,
        }),
      ),
    };
  }
}
