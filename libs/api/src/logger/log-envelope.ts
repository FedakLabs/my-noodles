import { context, trace } from '@opentelemetry/api';

import { LogMetadata } from './log-metadata';
import type { Severity } from './severity';

type TraceContext = Readonly<{
  traceId?: string;
  spanId?: string;
}>;

export type LogEnvelope = Readonly<{
  '@timestamp': string;
  'severity.text': Severity['text'];
  'severity.number': Severity['number'];
  'resource.appName': string;
  'resource.appVersion': string;
  body: string;
}> &
  TraceContext;

export function resolveTraceContext(): TraceContext {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  if (!spanContext || !trace.isSpanContextValid(spanContext)) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

export function buildLogEnvelope(input: Readonly<{ severity: Severity; body: string }>): LogEnvelope {
  const { appName, appVersion } = LogMetadata.get();

  return {
    '@timestamp': new Date().toISOString(),
    'severity.text': input.severity.text,
    'severity.number': input.severity.number,
    'resource.appName': appName,
    'resource.appVersion': appVersion,
    body: input.body,
    ...resolveTraceContext(),
  };
}
