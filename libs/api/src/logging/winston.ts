import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

import type { OtelOptions } from '../otel/index';

export type WinstonLoggingConfig = Readonly<{
  appName: string;
  nodeEnv: string;
  otel: OtelOptions;
}>;

export class WinstonLoggerFactory {
  constructor(private readonly config: WinstonLoggingConfig) {}

  createLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      transports: this.createTransports(),
    });
  }

  createTransports(): winston.transport[] {
    const useConsole = !this.config.otel.enabled || this.config.nodeEnv === 'local';
    const transports: winston.transport[] = [];

    if (this.config.otel.enabled) {
      transports.push(this.createOtelTransport());
    }

    if (useConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            this.createConsoleFormat(),
          ),
        }),
      );
    }

    return transports;
  }

  private createConsoleFormat(): winston.Logform.Format {
    if (this.config.nodeEnv === 'prod') {
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

  private createOtelTransport(): winston.transport {
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
}
