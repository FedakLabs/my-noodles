import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderPreviousStatus1740422416000 implements MigrationInterface {
  name = 'OrderPreviousStatus1740422416000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN previous_status TEXT NULL;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION orders_set_previous_status()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          NEW.previous_status := OLD.status;
        ELSE
          NEW.previous_status := OLD.previous_status;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER orders_previous_status_trg
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION orders_set_previous_status();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
  }
}
