import type { Logger } from 'winston';

import { AppException } from '../exceptions';
import { safeJsonStringify } from '../utils/safe-json-stringify';
import {
  resolveExceptionMessage,
  resolveExceptionName,
  resolveExceptionStack,
  serializeErrorForObservability,
} from './error-serialization';
import { buildLogEnvelope, type LogEnvelope } from './log-envelope';
import { resolveSeverity, type Severity } from './severity';

export { resolveTraceContext } from './log-envelope';

type BaseHttpManifestLogInput = Readonly<{
  method: string;
  url: string;
  queryParams?: string;
  requestBody?: string;
  responseStatus?: number;
  responseBody?: unknown;
  execTimeMs: number;
  error?: unknown;
  sanitizedMessage?: string;
}>;

export type IngoingHttpManifestLogInput = BaseHttpManifestLogInput &
  Readonly<{
    responseStatus: number;
    clientId?: string;
    xRealIp?: string;
  }>;

export type OutgoingHttpManifestLogInput = BaseHttpManifestLogInput &
  Readonly<{
    serviceName: string;
  }>;

export type HttpManifestLogRecord = LogEnvelope & Record<`attributes.${string}`, string>;

type ManifestRecordCore = Readonly<{
  requestType: 'ingoing' | 'outgoing';
  method: string;
  url: string;
  queryParams?: string;
  requestBody?: string;
  responseStatus?: number;
  responseBody?: unknown;
  execTimeMs: number;
  error?: unknown;
  sanitizedMessage?: string;
  severity: Severity;
  clientId?: string;
  xRealIp?: string;
  extraAttributes?: Record<`attributes.${string}`, string>;
}>;

function buildManifestRecord(core: ManifestRecordCore): HttpManifestLogRecord {
  const {
    requestType,
    method,
    url,
    queryParams = '',
    requestBody,
    responseStatus,
    responseBody,
    execTimeMs,
    error,
    sanitizedMessage,
    severity,
    clientId,
    xRealIp,
    extraAttributes,
  } = core;

  const rawErrorMessage = error === undefined ? undefined : resolveExceptionMessage(error);
  const bodyMessage = sanitizedMessage ?? rawErrorMessage;
  const statusPart = responseStatus !== undefined ? String(responseStatus) : '-';

  const attributes: Record<`attributes.${string}`, string> = {
    'attributes.execTime': String(Math.round(execTimeMs)),
    'attributes.http.requestType': requestType,
    'attributes.http.method': method,
    'attributes.http.url': url,
    'attributes.http.queryParams': queryParams,
  };

  if (responseStatus !== undefined) {
    attributes['attributes.http.responseStatus'] = String(responseStatus);
  }

  if (requestBody) {
    attributes['attributes.http.requestBody'] = requestBody;
  }

  if (clientId) {
    attributes['attributes.clientId'] = clientId;
  }

  if (xRealIp) {
    attributes['attributes.xRealIp'] = xRealIp;
  }

  if (responseBody !== undefined) {
    attributes['attributes.http.responseBody'] = safeJsonStringify(responseBody);
  }

  if (extraAttributes) {
    Object.assign(attributes, extraAttributes);
  }

  if (error !== undefined) {
    const causeForMeta =
      error instanceof AppException && error.internal instanceof Error ? error.internal : error;
    const internal = error instanceof AppException && error.internal != null ? error.internal : undefined;

    if (severity.text === 'ERROR') {
      attributes['attributes.error.name'] = resolveExceptionName(causeForMeta);
      attributes['attributes.error.message'] = resolveExceptionMessage(causeForMeta) ?? 'Unknown error';

      const stack = resolveExceptionStack(causeForMeta);
      if (stack) {
        attributes['attributes.error.stack'] = stack;
      }
    }

    if (internal !== undefined) {
      attributes['attributes.error.raw'] = serializeErrorForObservability(internal);
    } else if (severity.text === 'ERROR') {
      attributes['attributes.error.raw'] = serializeErrorForObservability(error);
    }
  }

  const baseBody = `${method} ${statusPart} ${Math.round(execTimeMs)}ms ${url}`;
  const body =
    severity.text === 'ERROR' && bodyMessage !== undefined && bodyMessage.length > 0
      ? `${baseBody} — ${bodyMessage}`
      : baseBody;

  return {
    ...buildLogEnvelope({ severity, body }),
    ...attributes,
  };
}

export function buildIngoingHttpManifestLog(input: IngoingHttpManifestLogInput): HttpManifestLogRecord {
  const {
    method,
    url,
    queryParams,
    requestBody,
    responseStatus,
    responseBody,
    execTimeMs,
    error,
    sanitizedMessage,
    clientId,
    xRealIp,
  } = input;

  return buildManifestRecord({
    requestType: 'ingoing',
    method: method.toUpperCase(),
    url,
    queryParams,
    requestBody,
    responseStatus,
    responseBody,
    execTimeMs,
    error,
    sanitizedMessage,
    severity: resolveSeverity({ status: responseStatus }),
    clientId,
    xRealIp,
  });
}

export function buildOutgoingHttpManifestLog(input: OutgoingHttpManifestLogInput): HttpManifestLogRecord {
  const {
    method,
    url,
    queryParams,
    requestBody,
    responseStatus,
    responseBody,
    execTimeMs,
    error,
    sanitizedMessage,
    serviceName,
  } = input;

  return buildManifestRecord({
    requestType: 'outgoing',
    method: method.toUpperCase(),
    url,
    queryParams,
    requestBody,
    responseStatus,
    responseBody,
    execTimeMs,
    error,
    sanitizedMessage,
    severity: resolveSeverity({ status: responseStatus, error }),
    extraAttributes: {
      'attributes.http.service': serviceName,
    },
  });
}

export function emitHttpManifestLog(logger: Logger, record: HttpManifestLogRecord): void {
  if (record['severity.text'] === 'ERROR') {
    logger.error(record);
    return;
  }

  if (record['severity.text'] === 'WARN') {
    logger.warn(record);
    return;
  }

  logger.info(record);
}
