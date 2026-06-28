import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCheckouts1740422406000 implements MigrationInterface {
  name = 'CreateCheckouts1740422406000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE checkouts (
        id                 UUID        NOT NULL DEFAULT uuidv7(),
        order_id           UUID        NOT NULL,
        visitor_session_id UUID        NOT NULL,
        status             TEXT        NOT NULL,
        cancelled_reason   TEXT,
        completed_at       TIMESTAMPTZ,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at         TIMESTAMPTZ,
        CONSTRAINT checkouts_pkey PRIMARY KEY (id),
        CONSTRAINT checkouts_order_id_key UNIQUE (order_id),
        CONSTRAINT checkouts_orders_fk
          FOREIGN KEY (order_id) REFERENCES orders(id)
          ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT checkouts_visitors_fk
          FOREIGN KEY (visitor_session_id) REFERENCES visitor_sessions(id)
          ON UPDATE CASCADE ON DELETE RESTRICT
      );

      CREATE INDEX idx_checkouts_status ON checkouts(status) WHERE deleted_at IS NULL;
      CREATE INDEX idx_checkouts_visitor_session_id ON checkouts(visitor_session_id)
        WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_checkouts_visitor_session_id;
      DROP INDEX IF EXISTS idx_checkouts_status;
      DROP TABLE IF EXISTS checkouts;
    `);
  }
}
