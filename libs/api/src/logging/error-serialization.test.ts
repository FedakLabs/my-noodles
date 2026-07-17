import { MAX_ERROR_RAW_LENGTH, serializeErrorForObservability } from './error-serialization';

describe('serializeErrorForObservability', () => {
  it('dumps a plain Error with name, message, and stack', () => {
    const error = new Error('boom');
    const parsed = JSON.parse(serializeErrorForObservability(error)) as {
      name: string;
      message: string;
      stack: string;
    };

    expect(parsed.name).toBe('Error');
    expect(parsed.message).toBe('boom');
    expect(parsed.stack).toContain('boom');
  });

  it('dumps TypeORM-like props alongside name/message/stack', () => {
    const error = Object.assign(
      new Error('insert or update on table "support_request_messages" violates foreign key'),
      {
        code: '23503',
        constraint: 'support_request_messages_user_uuid_fkey',
        detail: 'Key (user_uuid)=(517f11ee-205a-4022-845a-bf0fd258b411) is not present in table "users".',
        table: 'support_request_messages',
        schema: 'public',
        query: 'INSERT INTO "support_request_messages" ...',
        parameters: ['message', '517f11ee-205a-4022-845a-bf0fd258b411'],
        driverError: {
          code: '23503',
          constraint: 'support_request_messages_user_uuid_fkey',
        },
      },
    );

    const parsed = JSON.parse(serializeErrorForObservability(error)) as Record<string, unknown>;
    expect(parsed.name).toBe('Error');
    expect(parsed.message).toContain('violates foreign key');
    expect(parsed.stack).toEqual(expect.any(String));
    expect(parsed.code).toBe('23503');
    expect(parsed.constraint).toBe('support_request_messages_user_uuid_fkey');
    expect(parsed.query).toBe('INSERT INTO "support_request_messages" ...');
    expect(parsed.parameters).toEqual(['message', '517f11ee-205a-4022-845a-bf0fd258b411']);
    expect(parsed.driverError).toEqual({
      code: '23503',
      constraint: 'support_request_messages_user_uuid_fkey',
    });
  });

  it('includes the cause chain', () => {
    const root = new Error('wrapper', {
      cause: Object.assign(new Error('root cause'), { code: 'ECONNREFUSED' }),
    });

    const parsed = JSON.parse(serializeErrorForObservability(root)) as {
      cause: { name: string; message: string; code: string; stack: string };
    };

    expect(parsed.cause.name).toBe('Error');
    expect(parsed.cause.message).toBe('root cause');
    expect(parsed.cause.code).toBe('ECONNREFUSED');
    expect(parsed.cause.stack).toContain('root cause');
  });

  it('handles circular references without throwing', () => {
    const error = Object.assign(new Error('circular'), { meta: {} as { self?: unknown } });
    error.meta.self = error.meta;

    expect(serializeErrorForObservability(error)).toContain('[Circular]');
  });

  it('truncates oversized dumps with a marker', () => {
    const error = Object.assign(new Error('big'), { blob: 'x'.repeat(MAX_ERROR_RAW_LENGTH + 100) });
    const raw = serializeErrorForObservability(error, 200);

    expect(raw.length).toBeGreaterThan(200);
    expect(raw).toContain('…[truncated');
    expect(raw).toContain('chars]');
  });

  it('serializes non-Error values', () => {
    expect(serializeErrorForObservability({ code: 'CUSTOM', reason: 'nope' })).toBe(
      JSON.stringify({ code: 'CUSTOM', reason: 'nope' }),
    );
    expect(serializeErrorForObservability('plain string')).toBe(JSON.stringify('plain string'));
    expect(serializeErrorForObservability(42)).toBe('42');
  });
});
