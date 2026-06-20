import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1740422401000 implements MigrationInterface {
  name = 'CreateOrders1740422401000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id            UUID        NOT NULL DEFAULT gen_random_uuid(),
        customer_name TEXT        NOT NULL,
        phone         TEXT        NOT NULL,
        total_minor   INTEGER     NOT NULL,
        currency      TEXT        NOT NULL,
        status        TEXT        NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ,
        CONSTRAINT orders_pkey PRIMARY KEY (id)
      );

      CREATE TABLE order_deliveries (
        id                UUID        NOT NULL DEFAULT gen_random_uuid(),
        order_id          UUID        NOT NULL,
        provider          TEXT        NOT NULL,
        method            TEXT        NOT NULL,
        city              TEXT        NOT NULL,
        warehouse_number  TEXT,
        warehouse_name    TEXT,
        warehouse_ref     TEXT,
        street            TEXT,
        building          TEXT,
        apartment         TEXT,
        notes             TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at        TIMESTAMPTZ,
        CONSTRAINT order_deliveries_pkey PRIMARY KEY (id),
        CONSTRAINT order_deliveries_order_id_key UNIQUE (order_id),
        CONSTRAINT order_deliveries_orders_fk
            FOREIGN KEY (order_id) REFERENCES orders(id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
      );

      CREATE TABLE order_items (
        id                   UUID        NOT NULL DEFAULT gen_random_uuid(),
        order_id             UUID        NOT NULL
            CONSTRAINT order_items_orders_fk
                REFERENCES orders(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        product_id           UUID        NOT NULL
            CONSTRAINT order_items_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        title_snapshot       TEXT        NOT NULL,
        price_minor_snapshot INTEGER     NOT NULL,
        qty                  INTEGER     NOT NULL,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at           TIMESTAMPTZ,
        CONSTRAINT order_items_pkey PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orders_created_at ON orders(created_at DESC) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_orders_created_at;

      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS order_deliveries;
      DROP TABLE IF EXISTS orders;
    `);
  }
}
