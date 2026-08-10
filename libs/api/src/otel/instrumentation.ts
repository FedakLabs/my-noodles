import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';

export type OtelOptions =
  | Readonly<{ enabled: false }>
  | Readonly<{ enabled: true; serviceName: string; endpoint: string }>;

/** Starts the Node OTEL SDK when enabled. Safe to call at process preload. */
export function prepareInstrumentation(options: OtelOptions): NodeSDK | undefined {
  if (!options.enabled) {
    return undefined;
  }

  process.env['OTEL_SERVICE_NAME'] = options.serviceName;
  process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = options.endpoint;
  process.env['OTEL_TRACES_EXPORTER'] = 'otlp';
  process.env['OTEL_LOGS_EXPORTER'] = 'otlp';
  process.env['OTEL_METRICS_EXPORTER'] = 'otlp';

  const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        // Manual OpenTelemetryTransportV3 owns log export + camelCase traceId/spanId via the manifest.
        // Disabling avoids a second transport and snake_case trace_id/span_id injection.
        '@opentelemetry/instrumentation-winston': { enabled: false },
      }),
    ],
  });

  sdk.start();
  return sdk;
}
