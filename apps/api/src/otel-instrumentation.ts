/**
 * Preload hook — run before the app via `node --import=./dist/otel-instrumentation.js`.
 * Starts OTEL SDK synchronously so bootstrap, config, and DB errors are instrumented.
 */
import 'reflect-metadata';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { config } from './config';

if (config.otel.enabled) {
  process.env['OTEL_SERVICE_NAME'] = config.otel.serviceName;
  process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = config.otel.endpoint;
  process.env['OTEL_TRACES_EXPORTER'] = 'otlp';
  process.env['OTEL_LOGS_EXPORTER'] = 'otlp';

  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations(), new WinstonInstrumentation()],
  });

  sdk.start();
}
