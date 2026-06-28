import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VisitorSessionAndCart1740422404000 implements MigrationInterface {
  name = 'VisitorSessionAndCart1740422404000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE feed_sessions RENAME TO visitor_sessions;
      ALTER TABLE visitor_sessions RENAME COLUMN expires_at TO feed_expires_at;
      ALTER TABLE visitor_sessions ADD COLUMN cart_expires_at TIMESTAMPTZ;

      UPDATE visitor_sessions
        SET cart_expires_at = GREATEST(feed_expires_at, now()) + interval '30 days';

      ALTER TABLE visitor_sessions ALTER COLUMN cart_expires_at SET NOT NULL;

      ALTER TABLE feed_session_likes RENAME COLUMN session_id TO visitor_session_id;
      ALTER TABLE feed_session_likes
        RENAME CONSTRAINT feed_session_likes_sessions_fk TO feed_session_likes_visitors_fk;

      ALTER TABLE feed_session_views RENAME COLUMN session_id TO visitor_session_id;
      ALTER TABLE feed_session_views
        RENAME CONSTRAINT feed_session_views_sessions_fk TO feed_session_views_visitors_fk;

      DROP INDEX IF EXISTS uq_feed_session_likes_session_product;
      CREATE UNIQUE INDEX uq_feed_session_likes_visitor_product
        ON feed_session_likes(visitor_session_id, product_id) WHERE deleted_at IS NULL;

      DROP INDEX IF EXISTS uq_feed_session_views_session_product;
      CREATE UNIQUE INDEX uq_feed_session_views_visitor_product
        ON feed_session_views(visitor_session_id, product_id) WHERE deleted_at IS NULL;

      CREATE TABLE cart_items (
        id                  UUID        NOT NULL DEFAULT uuidv7(),
        visitor_session_id  UUID        NOT NULL
            CONSTRAINT cart_items_visitors_fk
                REFERENCES visitor_sessions(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        product_id          UUID        NOT NULL
            CONSTRAINT cart_items_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        qty                 INTEGER     NOT NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at          TIMESTAMPTZ,
        CONSTRAINT cart_items_pkey PRIMARY KEY (id)
      );

      CREATE UNIQUE INDEX uq_cart_items_visitor_product
        ON cart_items(visitor_session_id, product_id) WHERE deleted_at IS NULL;

      ALTER TABLE orders ADD COLUMN visitor_session_id UUID
        CONSTRAINT orders_visitors_fk
            REFERENCES visitor_sessions(id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;

      ALTER TABLE orders ALTER COLUMN customer_name DROP NOT NULL;
      ALTER TABLE orders ALTER COLUMN phone DROP NOT NULL;

      ALTER TABLE order_deliveries ALTER COLUMN city DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_deliveries ALTER COLUMN city SET NOT NULL;

      ALTER TABLE orders ALTER COLUMN phone SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN customer_name SET NOT NULL;

      ALTER TABLE orders DROP COLUMN IF EXISTS visitor_session_id;

      DROP INDEX IF EXISTS uq_cart_items_visitor_product;
      DROP TABLE IF EXISTS cart_items;

      DROP INDEX IF EXISTS uq_feed_session_views_visitor_product;
      CREATE UNIQUE INDEX uq_feed_session_views_session_product
        ON feed_session_views(visitor_session_id, product_id) WHERE deleted_at IS NULL;

      DROP INDEX IF EXISTS uq_feed_session_likes_visitor_product;
      CREATE UNIQUE INDEX uq_feed_session_likes_session_product
        ON feed_session_likes(visitor_session_id, product_id) WHERE deleted_at IS NULL;

      ALTER TABLE feed_session_views
        RENAME CONSTRAINT feed_session_views_visitors_fk TO feed_session_views_sessions_fk;
      ALTER TABLE feed_session_views RENAME COLUMN visitor_session_id TO session_id;

      ALTER TABLE feed_session_likes
        RENAME CONSTRAINT feed_session_likes_visitors_fk TO feed_session_likes_sessions_fk;
      ALTER TABLE feed_session_likes RENAME COLUMN visitor_session_id TO session_id;

      ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS cart_expires_at;
      ALTER TABLE visitor_sessions RENAME COLUMN feed_expires_at TO expires_at;
      ALTER TABLE visitor_sessions RENAME TO feed_sessions;
    `);
  }
}
