import type { HttpAccessLogResource } from '../../logging/http-access-log';

export const HTTP_LOG_METADATA = Symbol('HTTP_LOG_METADATA');

export type HttpLogMetadata = HttpAccessLogResource;
