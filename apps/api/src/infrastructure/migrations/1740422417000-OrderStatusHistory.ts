import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderStatusHistory1740422417000 implements MigrationInterface {
  name = 'OrderStatusHistory1740422417000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS orders_previous_status_trg ON orders;
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS orders_set_previous_status();
    `);

    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN IF EXISTS previous_status;
    `);

    await queryRunner.query(`
      CREATE TABLE order_status_history (
        id               UUID        NOT NULL DEFAULT uuidv7(),
        order_id         UUID        NOT NULL
          CONSTRAINT order_status_history_orders_fk
            REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        old_status       TEXT        NOT NULL,
        new_status       TEXT        NOT NULL,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at       TIMESTAMPTZ,
        CONSTRAINT order_status_history_pkey PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_order_status_history_order_created
        ON order_status_history(order_id, created_at DESC)
        WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION orders_log_status_history()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO order_status_history (order_id, old_status, new_status)
          VALUES (NEW.id, OLD.status, NEW.status);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER orders_status_history_trg
        AFTER UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION orders_log_status_history();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS orders_status_history_trg ON orders;
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS orders_log_status_history();
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS order_status_history;
    `);
  }
}
