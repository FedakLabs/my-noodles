import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

import { getOtelBaggageObject, type OtelOptions } from '../otel/index';
import { buildLogEnvelope } from './log-envelope';
import type { LogMetadataValue } from './log-metadata';
import { resolveSeverity } from './severity';

export type WinstonLoggingConfig = Readonly<{
  nodeEnv: string;
  otel: OtelOptions;
}> &
  LogMetadataValue;

export function createAppLogger(config: WinstonLoggingConfig): winston.Logger {
  return winston.createLogger({
    level: 'info',
    transports: createAppLoggerTransports(config),
  });
}

export function createAppLoggerTransports(config: WinstonLoggingConfig): winston.transport[] {
  const useConsole = !config.otel.enabled || config.nodeEnv === 'local';
  const transports: winston.transport[] = [];

  if (config.otel.enabled) {
    transports.push(
      new OpenTelemetryTransportV3({
        format: winston.format.combine(createOtelBaggageFormat(), createOtelFormat()),
      }),
    );
  }

  if (useConsole) {
    transports.push(new winston.transports.Console());
  }

  return transports;
}

function createOtelFormat(): winston.Logform.Format {
  return winston.format((info) => {
    if (typeof info['@timestamp'] === 'string') {
      return info;
    }

    const levelSymbol = info[Symbol.for('level')];
    const level = typeof levelSymbol === 'string' ? levelSymbol : info.level;
    const severity = resolveSeverity({ level });
    const body =
      typeof info.message === 'string'
        ? info.message
        : info.message !== undefined
          ? JSON.stringify(info.message)
          : '';

    Object.assign(info, buildLogEnvelope({ severity, body }));

    return info;
  })();
}

function createOtelBaggageFormat(): winston.Logform.Format {
  return winston.format((info) => {
    for (const [key, value] of Object.entries(getOtelBaggageObject())) {
      info[key] = value;
    }

    return info;
  })();
}
