import { HttpException } from '@nestjs/common';
import { context, propagation, trace } from '@opentelemetry/api';
import type { Request } from 'express';
import type { Logger } from 'winston';

import type { LoggingConfig } from '../../config';
import { API_GLOBAL_PREFIX } from '../../constants';
import { CLIENT_ID_BAGGAGE_KEY, CLIENT_ID_HEADER } from './client-baggage.middleware';

/** OpenTelemetry severity numbers for manifest `severity.number`. */
export const MANIFEST_SEVERITY = {
  INFO: { text: 'INFO', number: 9 },
  WARN: { text: 'WARN', number: 13 },
  ERROR: { text: 'ERROR', number: 17 },
} as const;

export type ManifestHttpAccessInput = Readonly<{
  request: Request;
  statusCode: number;
  execTimeMs: number;
  logging: LoggingConfig;
  error?: unknown;
}>;

export type ManifestLogRecord = Readonly<{
  '@timestamp': string;
  'severity.text': string;
  'severity.number': number;
  'resource.appName': string;
  'resource.appVersion': string;
  traceId?: string;
  spanId?: string;
  body: string;
  attributes: Record<string, string>;
}>;

/** Manifest: 5xx = ERROR; 4xx client errors (incl. validation) = INFO access logs. */
export function resolveHttpAccessSeverity(
  statusCode: number,
): (typeof MANIFEST_SEVERITY)[keyof typeof MANIFEST_SEVERITY] {
  return statusCode >= 500 ? MANIFEST_SEVERITY.ERROR : MANIFEST_SEVERITY.INFO;
}

export function resolveExceptionMessage(exception: unknown): string {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = response.message;

      if (Array.isArray(message)) {
        return message.map(String).join('; ');
      }

      return String(message);
    }
  }

  if (exception instanceof Error) {
    return exception.message;
  }

  return 'Unknown error';
}

export function resolveExceptionName(exception: unknown): string {
  if (exception instanceof HttpException) {
    return exception.name;
  }

  if (exception instanceof Error) {
    return exception.name;
  }

  return 'Error';
}

function toPlainString(value: string | number): string {
  return String(value);
}

function resolveTraceContext(): Pick<ManifestLogRecord, 'traceId' | 'spanId'> {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  if (!spanContext || !trace.isSpanContextValid(spanContext)) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

/** Gateway / OTEL baggage first, then `x-client-id` header. */
export function resolveClientId(request: Request): string | undefined {
  const baggageClientId = propagation.getBaggage(context.active())?.getEntry(CLIENT_ID_BAGGAGE_KEY)?.value;
  if (baggageClientId) {
    return baggageClientId;
  }

  const header = request.headers[CLIENT_ID_HEADER];
  return typeof header === 'string' && header.length > 0 ? header : undefined;
}

/** `x-real-ip`, then first hop of `x-forwarded-for`, then Express `request.ip`. */
export function resolveXRealIp(request: Request): string | undefined {
  const xRealIp = request.headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.length > 0) {
    return xRealIp;
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return request.ip || undefined;
}

function resolveHttpUrl(request: Request): string {
  return request.originalUrl || request.url;
}

function resolveQueryParams(request: Request): string {
  const url = resolveHttpUrl(request);
  const queryIndex = url.indexOf('?');

  return queryIndex === -1 ? '' : url.slice(queryIndex + 1);
}

function withGlobalPrefix(routePath: string): string {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  const prefix = `/${API_GLOBAL_PREFIX}`;

  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized;
  }

  return normalized === '/' ? prefix : `${prefix}${normalized}`;
}

/** Nest/Express route template, e.g. `/api/health` or `/api/products/:id`. */
export function resolveHttpRoute(request: Request): string {
  const route = request.route as { path?: string } | undefined;
  const routePath = route?.path;

  if (typeof routePath === 'string') {
    return withGlobalPrefix(routePath);
  }

  return request.path.startsWith('/') ? request.path : `/${request.path}`;
}

export function buildHttpAccessLog(input: ManifestHttpAccessInput): ManifestLogRecord {
  const { request, statusCode, execTimeMs, logging, error } = input;
  const method = request.method.toUpperCase();
  const url = resolveHttpUrl(request);
  const route = resolveHttpRoute(request);
  const queryParams = resolveQueryParams(request);
  const clientId = resolveClientId(request);
  const xRealIp = resolveXRealIp(request);
  const severity = resolveHttpAccessSeverity(statusCode);
  const errorMessage = error === undefined ? undefined : resolveExceptionMessage(error);

  const attributes: Record<string, string> = {
    'attributes.execTime': toPlainString(Math.round(execTimeMs)),
    'attributes.http.requestType': 'ingoing',
    'attributes.http.method': method,
    'attributes.http.url': url,
    'attributes.http.route': route,
    'attributes.http.queryParams': queryParams,
    'attributes.http.responseStatus': toPlainString(statusCode),
  };

  if (clientId) {
    attributes['attributes.clientId'] = clientId;
  }

  if (xRealIp) {
    attributes['attributes.xRealIp'] = xRealIp;
  }

  if (severity.text === 'ERROR' && error !== undefined) {
    attributes['attributes.error.name'] = resolveExceptionName(error);
    attributes['attributes.error.message'] = errorMessage ?? 'Unknown error';
  }

  const baseBody = `${method} ${url} ${statusCode}`;
  const body =
    severity.text === 'ERROR' && errorMessage !== undefined && errorMessage.length > 0
      ? `${baseBody} — ${errorMessage}`
      : baseBody;

  return {
    '@timestamp': new Date().toISOString(),
    'severity.text': severity.text,
    'severity.number': severity.number,
    'resource.appName': logging.appName,
    'resource.appVersion': logging.appVersion,
    body,
    ...resolveTraceContext(),
    attributes,
  };
}

export function emitManifestLog(logger: Logger, record: ManifestLogRecord): void {
  if (record['severity.text'] === 'ERROR') {
    logger.error(record);
    return;
  }

  logger.info(record);
}
