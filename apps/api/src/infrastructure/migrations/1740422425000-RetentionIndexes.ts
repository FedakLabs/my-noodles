import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RetentionIndexes1740422425000 implements MigrationInterface {
  name = 'RetentionIndexes1740422425000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Retention cutoffs and session-owned rows
      CREATE INDEX idx_visitor_sessions_cart_expires_at
        ON visitor_sessions(cart_expires_at);
      CREATE INDEX idx_visitor_sessions_updated_at
        ON visitor_sessions(updated_at);
      CREATE INDEX idx_cart_items_visitor_session_all
        ON cart_items(visitor_session_id);
      CREATE INDEX idx_cart_items_deleted_at
        ON cart_items(deleted_at) WHERE deleted_at IS NOT NULL;
      CREATE INDEX idx_feed_session_likes_deleted_at
        ON feed_session_likes(deleted_at) WHERE deleted_at IS NOT NULL;
      CREATE INDEX idx_feed_session_views_updated_at
        ON feed_session_views(updated_at);

      -- Protect commerce-linked sessions without scanning order/checkout history
      CREATE INDEX idx_orders_visitor_session_id
        ON orders(visitor_session_id) WHERE visitor_session_id IS NOT NULL;
      CREATE INDEX idx_checkouts_visitor_session_all
        ON checkouts(visitor_session_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_checkouts_visitor_session_all;
      DROP INDEX IF EXISTS idx_orders_visitor_session_id;
      DROP INDEX IF EXISTS idx_feed_session_views_updated_at;
      DROP INDEX IF EXISTS idx_feed_session_likes_deleted_at;
      DROP INDEX IF EXISTS idx_cart_items_deleted_at;
      DROP INDEX IF EXISTS idx_cart_items_visitor_session_all;
      DROP INDEX IF EXISTS idx_visitor_sessions_updated_at;
      DROP INDEX IF EXISTS idx_visitor_sessions_cart_expires_at;
    `);
  }
}
