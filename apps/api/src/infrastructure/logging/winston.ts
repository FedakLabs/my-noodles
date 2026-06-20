import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import type { WinstonModuleOptions } from 'nest-winston';
import { utilities } from 'nest-winston';
import winston from 'winston';

import { type Config } from '@/config';

export function createWinstonModuleOptions(
  config: Pick<Config, 'appName' | 'nodeEnv' | 'otel'>,
): WinstonModuleOptions {
  const logServiceName = config.otel.enabled ? config.otel.serviceName : config.appName;
  const useConsole = !config.otel.enabled || config.nodeEnv === 'local';

  const transports: winston.transport[] = [];

  if (config.otel.enabled) {
    transports.push(
      new OpenTelemetryTransportV3({
        format: winston.format.printf((info) => {
          const { level: _level, message: _message, timestamp: _timestamp, ms: _ms, ...record } = info;

          if (typeof record['@timestamp'] === 'string') {
            return JSON.stringify(record);
          }

          return JSON.stringify({
            '@timestamp': new Date().toISOString(),
            'severity.text': 'INFO',
            'severity.number': 9,
            body: typeof info.message === 'string' ? info.message : JSON.stringify(info.message),
            ...record,
          });
        }),
      }),
    );
  }

  if (useConsole) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          utilities.format.nestLike(logServiceName, {
            colors: config.nodeEnv !== 'prod',
            prettyPrint: true,
          }),
        ),
      }),
    );
  }

  return { transports };
}
