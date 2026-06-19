import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { config } from './config';

let sdk: NodeSDK | undefined;

export async function shutdownOtel(): Promise<void> {
  if (!sdk) {
    return;
  }

  const activeSdk = sdk;
  sdk = undefined;
  await activeSdk.shutdown();
}

export function initOtelInstrumentation(): void {
  if (!config.otel.enabled) {
    return;
  }

  // Configure OTEL environment variables
  process.env['OTEL_SERVICE_NAME'] = config.otel.serviceName;
  process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = config.otel.endpoint;
  process.env['OTEL_TRACES_EXPORTER'] = 'otlp';
  process.env['OTEL_LOGS_EXPORTER'] = 'otlp';

  sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations(), new WinstonInstrumentation()],
  });

  sdk.start();
}
