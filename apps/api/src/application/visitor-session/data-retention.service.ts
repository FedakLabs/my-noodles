import { logger } from '@my-noodles/api-lib/logger';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource, EntityManager } from 'typeorm';

import {
  DATA_RETENTION_BATCH_SIZE,
  DATA_RETENTION_MAX_BATCHES,
  DATABASE_STORAGE_WARNING_BYTES,
  FEED_VIEW_RETENTION_MS,
  NEON_CU_HOURS_WARNING_THRESHOLD,
  SOFT_DELETED_RETENTION_MS,
  VISITOR_SESSION_RETENTION_MS,
} from './data-retention.config';

type IdRow = { id: string };

type DatabaseSizeRow = {
  database_bytes: string;
  table_bytes: string;
  index_bytes: string;
};

type RelationSizeRow = {
  table_name: string;
  total_bytes: string;
  live_rows: string;
  dead_rows: string;
};

type DataRetentionDeletedRows = Readonly<{
  expiredCartItems: number;
  softDeletedCartItems: number;
  softDeletedLikes: number;
  agedFeedViews: number;
  staleSessionCartItems: number;
  staleSessionLikes: number;
  staleSessionViews: number;
  staleVisitorSessions: number;
}>;

type DatabaseStorageSnapshot = Readonly<{
  databaseBytes: number;
  tableBytes: number;
  indexBytes: number;
  relations: ReadonlyArray<{
    tableName: string;
    totalBytes: number;
    liveRows: number;
    deadRows: number;
  }>;
}>;

export type DataRetentionSummary = Readonly<{
  deleted: DataRetentionDeletedRows;
  batchLimitsReached: string[];
  durationMs: number;
  storage: DatabaseStorageSnapshot;
}>;

type BatchDeleteResult = Readonly<{
  deleted: number;
  limitReached: boolean;
}>;

type StaleSessionBatch = Readonly<{
  cartItems: number;
  likes: number;
  views: number;
  sessions: number;
}>;

const DELETE_EXPIRED_CART_ITEMS_SQL = `
  WITH targets AS (
    SELECT cart.id
    FROM cart_items AS cart
    INNER JOIN visitor_sessions AS visitor ON visitor.id = cart.visitor_session_id
    WHERE visitor.cart_expires_at <= $1
    ORDER BY cart.id
    LIMIT $2
  )
  DELETE FROM cart_items AS cart
  USING targets
  WHERE cart.id = targets.id
  RETURNING cart.id
`;

const DELETE_SOFT_DELETED_CART_ITEMS_SQL = `
  WITH targets AS (
    SELECT id
    FROM cart_items
    WHERE deleted_at < $1
    ORDER BY id
    LIMIT $2
  )
  DELETE FROM cart_items AS cart
  USING targets
  WHERE cart.id = targets.id
  RETURNING cart.id
`;

const DELETE_SOFT_DELETED_LIKES_SQL = `
  WITH targets AS (
    SELECT id
    FROM feed_session_likes
    WHERE deleted_at < $1
    ORDER BY id
    LIMIT $2
  )
  DELETE FROM feed_session_likes AS likes
  USING targets
  WHERE likes.id = targets.id
  RETURNING likes.id
`;

const DELETE_AGED_FEED_VIEWS_SQL = `
  WITH targets AS (
    SELECT id
    FROM feed_session_views
    WHERE updated_at < $1
    ORDER BY id
    LIMIT $2
  )
  DELETE FROM feed_session_views AS views
  USING targets
  WHERE views.id = targets.id
  RETURNING views.id
`;

const SELECT_STALE_VISITOR_SESSIONS_SQL = `
  SELECT visitor.id
  FROM visitor_sessions AS visitor
  WHERE visitor.updated_at < $1
    AND NOT EXISTS (
      SELECT 1 FROM orders WHERE orders.visitor_session_id = visitor.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM checkouts WHERE checkouts.visitor_session_id = visitor.id
  )
  ORDER BY visitor.id
  LIMIT $2
  FOR UPDATE OF visitor SKIP LOCKED
`;

@Injectable()
export class DataRetentionService {
  private running: Promise<DataRetentionSummary> | undefined;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  run(now = new Date()): Promise<DataRetentionSummary> {
    if (this.running) {
      return this.running;
    }

    this.running = this.execute(now).finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  private async execute(now: Date): Promise<DataRetentionSummary> {
    const startedAt = Date.now();
    const softDeletedBefore = new Date(now.getTime() - SOFT_DELETED_RETENTION_MS);
    const feedViewsBefore = new Date(now.getTime() - FEED_VIEW_RETENTION_MS);
    const visitorSessionsBefore = new Date(now.getTime() - VISITOR_SESSION_RETENTION_MS);
    const batchLimitsReached: string[] = [];

    try {
      const expiredCartItems = await this.deleteInBatches(DELETE_EXPIRED_CART_ITEMS_SQL, now);
      const softDeletedCartItems = await this.deleteInBatches(
        DELETE_SOFT_DELETED_CART_ITEMS_SQL,
        softDeletedBefore,
      );
      const softDeletedLikes = await this.deleteInBatches(DELETE_SOFT_DELETED_LIKES_SQL, softDeletedBefore);
      const agedFeedViews = await this.deleteInBatches(DELETE_AGED_FEED_VIEWS_SQL, feedViewsBefore);
      const staleSessions = await this.deleteStaleVisitorSessions(visitorSessionsBefore);

      this.collectBatchLimit(batchLimitsReached, 'expiredCartItems', expiredCartItems);
      this.collectBatchLimit(batchLimitsReached, 'softDeletedCartItems', softDeletedCartItems);
      this.collectBatchLimit(batchLimitsReached, 'softDeletedLikes', softDeletedLikes);
      this.collectBatchLimit(batchLimitsReached, 'agedFeedViews', agedFeedViews);
      if (staleSessions.limitReached) {
        batchLimitsReached.push('staleVisitorSessions');
      }

      const storage = await this.getStorageSnapshot();
      const summary: DataRetentionSummary = {
        deleted: {
          expiredCartItems: expiredCartItems.deleted,
          softDeletedCartItems: softDeletedCartItems.deleted,
          softDeletedLikes: softDeletedLikes.deleted,
          agedFeedViews: agedFeedViews.deleted,
          staleSessionCartItems: staleSessions.deleted.cartItems,
          staleSessionLikes: staleSessions.deleted.likes,
          staleSessionViews: staleSessions.deleted.views,
          staleVisitorSessions: staleSessions.deleted.sessions,
        },
        batchLimitsReached,
        durationMs: Date.now() - startedAt,
        storage,
      };

      logger.info({
        msg: 'database.retention.completed',
        ...summary,
        databaseStorageWarningBytes: DATABASE_STORAGE_WARNING_BYTES,
        neonCuHoursWarningThreshold: NEON_CU_HOURS_WARNING_THRESHOLD,
      });

      if (batchLimitsReached.length > 0) {
        logger.warn({
          msg: 'database.retention.batch_limit_reached',
          batchLimitsReached,
          batchSize: DATA_RETENTION_BATCH_SIZE,
          maxBatches: DATA_RETENTION_MAX_BATCHES,
        });
      }

      if (storage.databaseBytes >= DATABASE_STORAGE_WARNING_BYTES) {
        logger.warn({
          msg: 'database.storage.threshold_exceeded',
          databaseBytes: storage.databaseBytes,
          warningBytes: DATABASE_STORAGE_WARNING_BYTES,
        });
      }

      return summary;
    } catch (error) {
      logger.error({
        msg: 'database.retention.failed',
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async deleteInBatches(sql: string, cutoff: Date): Promise<BatchDeleteResult> {
    let deleted = 0;

    for (let batch = 0; batch < DATA_RETENTION_MAX_BATCHES; batch += 1) {
      const rows = await this.dataSource.transaction(async (manager) => {
        return (await manager.query(sql, [cutoff, DATA_RETENTION_BATCH_SIZE])) as IdRow[];
      });
      deleted += rows.length;

      if (rows.length < DATA_RETENTION_BATCH_SIZE) {
        return { deleted, limitReached: false };
      }
    }

    return { deleted, limitReached: true };
  }

  private async deleteStaleVisitorSessions(cutoff: Date): Promise<{
    deleted: StaleSessionBatch;
    limitReached: boolean;
  }> {
    const deleted = { cartItems: 0, likes: 0, views: 0, sessions: 0 };

    for (let batch = 0; batch < DATA_RETENTION_MAX_BATCHES; batch += 1) {
      const current = await this.dataSource.transaction(async (manager) => {
        return await this.deleteStaleVisitorSessionBatch(manager, cutoff);
      });
      deleted.cartItems += current.cartItems;
      deleted.likes += current.likes;
      deleted.views += current.views;
      deleted.sessions += current.sessions;

      if (current.sessions < DATA_RETENTION_BATCH_SIZE) {
        return { deleted, limitReached: false };
      }
    }

    return { deleted, limitReached: true };
  }

  private async deleteStaleVisitorSessionBatch(
    manager: EntityManager,
    cutoff: Date,
  ): Promise<StaleSessionBatch> {
    const candidates = (await manager.query(SELECT_STALE_VISITOR_SESSIONS_SQL, [
      cutoff,
      DATA_RETENTION_BATCH_SIZE,
    ])) as IdRow[];
    const visitorIds = candidates.map(({ id }) => id);

    if (visitorIds.length === 0) {
      return { cartItems: 0, likes: 0, views: 0, sessions: 0 };
    }

    const cartItems = (await manager.query(
      `DELETE FROM cart_items WHERE visitor_session_id = ANY($1::uuid[]) RETURNING id`,
      [visitorIds],
    )) as IdRow[];
    const likes = (await manager.query(
      `DELETE FROM feed_session_likes WHERE visitor_session_id = ANY($1::uuid[]) RETURNING id`,
      [visitorIds],
    )) as IdRow[];
    const views = (await manager.query(
      `DELETE FROM feed_session_views WHERE visitor_session_id = ANY($1::uuid[]) RETURNING id`,
      [visitorIds],
    )) as IdRow[];
    const sessions = (await manager.query(
      `DELETE FROM visitor_sessions WHERE id = ANY($1::uuid[]) RETURNING id`,
      [visitorIds],
    )) as IdRow[];

    return {
      cartItems: cartItems.length,
      likes: likes.length,
      views: views.length,
      sessions: sessions.length,
    };
  }

  private async getStorageSnapshot(): Promise<DatabaseStorageSnapshot> {
    const [size] = (await this.dataSource.query(`
      SELECT
        pg_database_size(current_database())::TEXT AS database_bytes,
        COALESCE(SUM(pg_table_size(relid)), 0)::TEXT AS table_bytes,
        COALESCE(SUM(pg_indexes_size(relid)), 0)::TEXT AS index_bytes
      FROM pg_catalog.pg_statio_user_tables
    `)) as DatabaseSizeRow[];
    const relations = (await this.dataSource.query(`
      SELECT
        relname AS table_name,
        pg_total_relation_size(relid)::TEXT AS total_bytes,
        n_live_tup::TEXT AS live_rows,
        n_dead_tup::TEXT AS dead_rows
      FROM pg_catalog.pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `)) as RelationSizeRow[];

    if (!size) {
      throw new Error('Database storage query returned no rows');
    }

    return {
      databaseBytes: Number(size.database_bytes),
      tableBytes: Number(size.table_bytes),
      indexBytes: Number(size.index_bytes),
      relations: relations.map((relation) => ({
        tableName: relation.table_name,
        totalBytes: Number(relation.total_bytes),
        liveRows: Number(relation.live_rows),
        deadRows: Number(relation.dead_rows),
      })),
    };
  }

  private collectBatchLimit(target: string[], name: string, result: BatchDeleteResult): void {
    if (result.limitReached) {
      target.push(name);
    }
  }
}
