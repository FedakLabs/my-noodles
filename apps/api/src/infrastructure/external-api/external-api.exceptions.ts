export class ExternalApiException extends Error {
  constructor(
    message: string,
    readonly httpStatus?: number,
    readonly responseData?: unknown,
  ) {
    super(message);
    this.name = 'ExternalApiException';
  }
}
