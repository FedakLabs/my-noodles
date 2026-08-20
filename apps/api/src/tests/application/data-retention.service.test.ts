import type { DataSource, EntityManager } from 'typeorm';

import {
  DATA_RETENTION_BATCH_SIZE,
  DataRetentionService,
  FEED_VIEW_RETENTION_MS,
  SOFT_DELETED_RETENTION_MS,
  VISITOR_SESSION_RETENTION_MS,
} from '@/application/visitor-session';

import { beforeEach, describe, expect, it, jest } from '../jest-globals';

type QueryParameters = unknown[] | undefined;

describe('DataRetentionService', () => {
  let query: jest.Mock;
  let transaction: jest.Mock;
  let service: DataRetentionService;

  beforeEach(() => {
    query = jest.fn(async (sql: string) => {
      if (sql.includes('pg_database_size')) {
        return [{ database_bytes: '1048576', table_bytes: '524288', index_bytes: '262144' }];
      }
      if (sql.includes('pg_catalog.pg_stat_user_tables')) {
        return [
          {
            table_name: 'visitor_sessions',
            total_bytes: '16384',
            live_rows: '2',
            dead_rows: '0',
          },
        ];
      }
      return [];
    });
    transaction = jest.fn(async (callback: (manager: EntityManager) => Promise<unknown>) => {
      return await callback({ query } as unknown as EntityManager);
    });
    service = new DataRetentionService({ query, transaction } as unknown as DataSource);
  });

  it('applies each retention cutoff and protects commerce-linked visitor sessions', async () => {
    const now = new Date('2026-08-20T12:00:00.000Z');

    const result = await service.run(now);

    expect(result.deleted).toEqual({
      expiredCartItems: 0,
      softDeletedCartItems: 0,
      softDeletedLikes: 0,
      agedFeedViews: 0,
      staleSessionCartItems: 0,
      staleSessionLikes: 0,
      staleSessionViews: 0,
      staleVisitorSessions: 0,
    });
    expect(result.storage).toEqual({
      databaseBytes: 1_048_576,
      tableBytes: 524_288,
      indexBytes: 262_144,
      relations: [
        {
          tableName: 'visitor_sessions',
          totalBytes: 16_384,
          liveRows: 2,
          deadRows: 0,
        },
      ],
    });

    expectQueryCutoff('visitor.cart_expires_at <= $1', now);
    expectQueryCutoff(
      'DELETE FROM cart_items AS cart',
      new Date(now.getTime() - SOFT_DELETED_RETENTION_MS),
      'deleted_at < $1',
    );
    expectQueryCutoff(
      'DELETE FROM feed_session_likes AS likes',
      new Date(now.getTime() - SOFT_DELETED_RETENTION_MS),
    );
    expectQueryCutoff(
      'DELETE FROM feed_session_views AS views',
      new Date(now.getTime() - FEED_VIEW_RETENTION_MS),
    );
    expectQueryCutoff('SELECT visitor.id', new Date(now.getTime() - VISITOR_SESSION_RETENTION_MS));

    const staleSessionQuery = findQuery('SELECT visitor.id');
    expect(staleSessionQuery.sql).toContain('NOT EXISTS (\n      SELECT 1 FROM orders');
    expect(staleSessionQuery.sql).toContain('NOT EXISTS (\n      SELECT 1 FROM checkouts');
  });

  it('continues deleting full batches until a partial batch is returned', async () => {
    let expiredCartBatch = 0;
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('visitor.cart_expires_at <= $1')) {
        expiredCartBatch += 1;
        return expiredCartBatch === 1
          ? Array.from({ length: DATA_RETENTION_BATCH_SIZE }, (_, index) => ({ id: `cart-${index}` }))
          : [{ id: 'last-cart' }];
      }
      if (sql.includes('pg_database_size')) {
        return [{ database_bytes: '1', table_bytes: '1', index_bytes: '0' }];
      }
      return [];
    });

    const result = await service.run(new Date('2026-08-20T12:00:00.000Z'));

    expect(result.deleted.expiredCartItems).toBe(DATA_RETENTION_BATCH_SIZE + 1);
    expect(result.batchLimitsReached).toEqual([]);
    expect(expiredCartBatch).toBe(2);
  });

  it('hard-deletes children before an unreferenced stale visitor session', async () => {
    let selectedCandidates = false;
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT visitor.id')) {
        if (selectedCandidates) {
          return [];
        }
        selectedCandidates = true;
        return [{ id: '11111111-1111-7111-8111-111111111111' }];
      }
      if (sql.startsWith('DELETE FROM cart_items')) {
        return [{ id: 'cart-1' }];
      }
      if (sql.startsWith('DELETE FROM feed_session_likes')) {
        return [{ id: 'like-1' }];
      }
      if (sql.startsWith('DELETE FROM feed_session_views')) {
        return [{ id: 'view-1' }];
      }
      if (sql.startsWith('DELETE FROM visitor_sessions')) {
        return [{ id: '11111111-1111-7111-8111-111111111111' }];
      }
      if (sql.includes('pg_database_size')) {
        return [{ database_bytes: '1', table_bytes: '1', index_bytes: '0' }];
      }
      return [];
    });

    const result = await service.run(new Date('2026-08-20T12:00:00.000Z'));

    expect(result.deleted).toMatchObject({
      staleSessionCartItems: 1,
      staleSessionLikes: 1,
      staleSessionViews: 1,
      staleVisitorSessions: 1,
    });

    const statements = query.mock.calls.map(([sql]) => sql as string);
    expect(
      statements.indexOf('DELETE FROM visitor_sessions WHERE id = ANY($1::uuid[]) RETURNING id'),
    ).toBeGreaterThan(
      statements.indexOf(
        'DELETE FROM feed_session_views WHERE visitor_session_id = ANY($1::uuid[]) RETURNING id',
      ),
    );
  });

  function findQuery(
    fragment: string,
    requiredFragment?: string,
  ): { sql: string; parameters: QueryParameters } {
    const call = query.mock.calls.find(([sql]) => {
      const statement = sql as string;
      return statement.includes(fragment) && (!requiredFragment || statement.includes(requiredFragment));
    });
    if (!call) {
      throw new Error(`Expected query containing: ${fragment}`);
    }
    return { sql: call[0] as string, parameters: call[1] as QueryParameters };
  }

  function expectQueryCutoff(fragment: string, cutoff: Date, requiredFragment?: string): void {
    const call = findQuery(fragment, requiredFragment);
    expect(call.sql).toContain(requiredFragment ?? fragment);
    expect(call.parameters).toEqual([cutoff, DATA_RETENTION_BATCH_SIZE]);
  }
});
