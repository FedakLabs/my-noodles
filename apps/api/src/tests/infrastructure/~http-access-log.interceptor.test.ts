import type { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { of } from 'rxjs';

import { HttpAccessLogInterceptor } from '../../infrastructure/logging/http-access-log.interceptor';

describe('HttpAccessLogInterceptor', () => {
  it('emits manifest access log after the request completes', async () => {
    const logger = { info: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [HttpAccessLogInterceptor, { provide: WINSTON_MODULE_PROVIDER, useValue: logger }],
    }).compile();

    const interceptor = moduleRef.get(HttpAccessLogInterceptor);

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

    await new Promise<void>((resolve, reject) => {
      interceptor.intercept(context, { handle: () => of({ status: 'ok' }) }).subscribe({
        complete: () => resolve(),
        error: reject,
      });
    });

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: 'GET /api/health 200',
        attributes: expect.objectContaining({
          'attributes.http.requestType': 'ingoing',
          'attributes.http.method': 'GET',
          'attributes.http.responseStatus': '200',
        }) as Record<string, string>,
      }),
    );
  });
});
