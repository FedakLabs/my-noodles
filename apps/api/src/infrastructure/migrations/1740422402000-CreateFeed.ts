import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeed1740422402000 implements MigrationInterface {
  name = 'CreateFeed1740422402000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE feed_sessions (
        id          UUID        NOT NULL DEFAULT uuidv7(),
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT feed_sessions_pkey PRIMARY KEY (id)
      );

      CREATE TABLE feed_session_likes (
        id          UUID        NOT NULL DEFAULT uuidv7(),
        session_id  UUID        NOT NULL
            CONSTRAINT feed_session_likes_sessions_fk
                REFERENCES feed_sessions(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        product_id  UUID        NOT NULL
            CONSTRAINT feed_session_likes_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT feed_session_likes_pkey PRIMARY KEY (id)
      );

      CREATE TABLE feed_session_views (
        id          UUID        NOT NULL DEFAULT uuidv7(),
        session_id  UUID        NOT NULL
            CONSTRAINT feed_session_views_sessions_fk
                REFERENCES feed_sessions(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        product_id  UUID        NOT NULL
            CONSTRAINT feed_session_views_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        dwell_ms    INTEGER     NOT NULL,
        filters     JSONB,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT feed_session_views_pkey PRIMARY KEY (id)
      );

      CREATE TABLE feed_product_comments (
        id          UUID        NOT NULL DEFAULT uuidv7(),
        product_id  UUID        NOT NULL
            CONSTRAINT feed_product_comments_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        author_name TEXT        NOT NULL,
        comment     JSONB       NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT feed_product_comments_pkey PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_feed_session_likes_session_product
        ON feed_session_likes(session_id, product_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_feed_session_views_session_product
        ON feed_session_views(session_id, product_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_feed_product_comments_product_id
        ON feed_product_comments(product_id) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_feed_product_comments_product_id;
      DROP INDEX IF EXISTS idx_feed_session_views_session_product;
      DROP INDEX IF EXISTS uq_feed_session_likes_session_product;

      DROP TABLE IF EXISTS feed_product_comments;
      DROP TABLE IF EXISTS feed_session_views;
      DROP TABLE IF EXISTS feed_session_likes;
      DROP TABLE IF EXISTS feed_sessions;
    `);
  }
}
