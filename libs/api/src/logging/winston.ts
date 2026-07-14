import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

import type { OtelOptions } from '../otel/index';

export type WinstonLoggingConfig = Readonly<{
  appName: string;
  nodeEnv: string;
  otel: OtelOptions;
}>;

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
    transports.push(createOtelTransport());
  }

  if (useConsole) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          createConsoleFormat(config.nodeEnv),
        ),
      }),
    );
  }

  return transports;
}

function createConsoleFormat(nodeEnv: string): winston.Logform.Format {
  if (nodeEnv === 'prod') {
    return winston.format.json();
  }

  return winston.format.printf((info) => {
    const { level, timestamp, ms, message, ...meta } = info;
    const record =
      typeof message === 'object' && message !== null
        ? { ...(message as Record<string, unknown>), ...meta }
        : message
          ? { msg: message, ...meta }
          : meta;

    const msSuffix = typeof ms === 'string' ? ` ${ms}` : '';

    return `${String(timestamp)} ${String(level)}${msSuffix}: ${JSON.stringify(record)}`;
  });
}

function createOtelTransport(): winston.transport {
  return new OpenTelemetryTransportV3({
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
  });
}
