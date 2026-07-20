import { AppException, HttpStatus } from './index';

describe('AppException', () => {
  it('defaults optional payload and internal to null', () => {
    const error = new AppException({
      status: HttpStatus.BAD_REQUEST,
      code: 'bad_request',
      message: 'Bad request',
    });

    expect(error.payload).toBeNull();
    expect(error.internal).toBeNull();
    expect(error.toBody()).toEqual({
      status: HttpStatus.BAD_REQUEST,
      code: 'bad_request',
      message: 'Bad request',
      payload: null,
    });
  });

  it('excludes internal from toBody and toErrorSchema', () => {
    const error = new AppException({
      status: HttpStatus.BAD_GATEWAY,
      code: 'upstream_failed',
      message: 'Upstream failed',
      payload: { reason: 'temporary' },
      internal: { providerStatus: 503 },
    });

    expect(error.internal).toEqual({ providerStatus: 503 });
    expect(error.toBody()).toEqual({
      status: HttpStatus.BAD_GATEWAY,
      code: 'upstream_failed',
      message: 'Upstream failed',
      payload: { reason: 'temporary' },
    });
    expect(JSON.stringify(error.toErrorSchema())).not.toContain('internal');
  });
});
