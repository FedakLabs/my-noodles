import { type StatusCodes } from 'http-status-codes';

export { StatusCodes as HttpStatus } from 'http-status-codes';

export type HttpStatusCode = (typeof StatusCodes)[keyof typeof StatusCodes];
