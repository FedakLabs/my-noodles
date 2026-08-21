import { PostgresErrorClassifier } from './postgres-error-classifier';

describe('PostgresErrorClassifier', () => {
  it.each(['08001', '08003', '08004', '08006', '57P01', '57P03', 'ECONNRESET', 'ECONNREFUSED'])(
    'recognizes transient code %s',
    (code) => {
      expect(PostgresErrorClassifier.isTransient({ code })).toBe(true);
    },
  );

  it('walks nested causes', () => {
    expect(
      PostgresErrorClassifier.isTransient({ cause: Object.assign(new Error('wake'), { code: '57P01' }) }),
    ).toBe(true);
  });

  it.each(['23505', '28P01', '42601'])('rejects ordinary PostgreSQL code %s', (code) => {
    expect(PostgresErrorClassifier.isTransient({ code })).toBe(false);
  });
});
