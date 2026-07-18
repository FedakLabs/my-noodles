import { logger } from '@my-noodles/api-lib/logger';
import { LoggingInterceptor } from '@my-noodles/api-lib/nest';
import type { ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { of } from 'rxjs';

import { jest } from '../jest-globals';

describe('LoggingInterceptor', () => {
  it('emits manifest access log after the request completes', async () => {
    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const interceptor = new LoggingInterceptor();

    const request = {
      method: 'GET',
      originalUrl: '/api/health',
      path: '/api/health',
      route: { path: '/health' },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request;
    const response = { statusCode: 200 } as Response;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    try {
      await new Promise<void>((resolve, reject) => {
        interceptor.intercept(context, { handle: () => of({ status: 'ok' }) }).subscribe({
          complete: () => resolve(),
          error: reject,
        });
      });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          'severity.text': 'INFO',
          body: expect.stringMatching(/^GET 200 \d+ms \/api\/health$/),
          'attributes.http.requestType': 'ingoing',
          'attributes.http.method': 'GET',
          'attributes.http.responseStatus': '200',
          'attributes.http.responseBody': JSON.stringify({ status: 'ok' }),
        }),
      );
    } finally {
      infoSpy.mockRestore();
    }
  });
});
