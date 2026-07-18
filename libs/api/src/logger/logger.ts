import winston, { type Logger } from 'winston';

import { LogMetadata } from './log-metadata';
import { createAppLoggerTransports, type WinstonLoggingConfig } from './winston';

export const logger: Logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

export function configureAppLogger(config: WinstonLoggingConfig): void {
  LogMetadata.set({ appName: config.appName, appVersion: config.appVersion });
  logger.configure({ level: 'info', transports: createAppLoggerTransports(config) });
}
