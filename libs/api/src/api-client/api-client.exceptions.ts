export class ApiClientException extends Error {
  constructor(
    message: string,
    readonly httpStatus?: number,
    readonly responseData?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientException';
  }
}
