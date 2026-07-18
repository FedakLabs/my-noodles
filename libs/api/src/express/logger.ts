import { context, propagation } from '@opentelemetry/api';
import type { Request } from 'express';

import type { IngoingHttpManifestLogInput } from '../logger/http-manifest-log';
import { CLIENT_ID_BAGGAGE_KEY, CLIENT_ID_HEADER } from '../otel/client-baggage';
import { safeJsonStringify } from '../utils/safe-json-stringify';

export function resolveHttpUrl(request: Request): string {
  return request.originalUrl || request.url;
}

export function resolveQueryParams(request: Request): string {
  const url = resolveHttpUrl(request);
  const queryIndex = url.indexOf('?');

  return queryIndex === -1 ? '' : url.slice(queryIndex + 1);
}

export function resolveClientId(request: Request): string | undefined {
  const baggageClientId = propagation.getBaggage(context.active())?.getEntry(CLIENT_ID_BAGGAGE_KEY)?.value;
  if (baggageClientId) {
    return baggageClientId;
  }

  const header = request.headers[CLIENT_ID_HEADER];
  return typeof header === 'string' && header.length > 0 ? header : undefined;
}

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

export function resolveRequestBody(request: Request): string | undefined {
  const body: unknown = request.body;

  if (body === undefined || body === null) {
    return undefined;
  }

  const serialized = safeJsonStringify(body);
  return serialized.length > 0 ? serialized : undefined;
}

export type IngoingManifestExtras = Readonly<{
  responseStatus: number;
  execTimeMs: number;
  error?: unknown;
  responseBody?: unknown;
  sanitizedMessage?: string;
}>;

/** Extract framework-agnostic ingoing manifest fields from an Express request. */
export function buildIngoingManifestInput(
  request: Request,
  extras: IngoingManifestExtras,
): IngoingHttpManifestLogInput {
  return {
    method: request.method.toUpperCase(),
    url: resolveHttpUrl(request),
    queryParams: resolveQueryParams(request),
    requestBody: resolveRequestBody(request),
    responseStatus: extras.responseStatus,
    responseBody: extras.responseBody,
    execTimeMs: extras.execTimeMs,
    error: extras.error,
    sanitizedMessage: extras.sanitizedMessage,
    clientId: resolveClientId(request),
    xRealIp: resolveXRealIp(request),
  };
}
