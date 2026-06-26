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

  createTransports(consoleFormat: winston.Logform.Format): winston.transport[] {
    const useConsole = !this.config.otel.enabled || this.config.nodeEnv === 'local';
    const transports: winston.transport[] = [];

    if (this.config.otel.enabled) {
      transports.push(this.createOtelTransport());
    }

    if (useConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), consoleFormat),
        }),
      );
    }

    return transports;
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
