import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames previous_status/current_status → old_status/new_status for DBs that
 * already applied 1740422417000 before the column rename. No-ops if columns
 * are already named old_status/new_status (fresh installs of the updated 1700).
 */
export class OrderStatusHistoryOldNewColumns1740422418000 implements MigrationInterface {
  name = 'OrderStatusHistoryOldNewColumns1740422418000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'order_status_history'
            AND column_name = 'previous_status'
        ) THEN
          ALTER TABLE order_status_history RENAME COLUMN previous_status TO old_status;
          ALTER TABLE order_status_history RENAME COLUMN current_status TO new_status;
        END IF;
      END $$;
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'order_status_history'
            AND column_name = 'old_status'
        ) THEN
          ALTER TABLE order_status_history RENAME COLUMN old_status TO previous_status;
          ALTER TABLE order_status_history RENAME COLUMN new_status TO current_status;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION orders_log_status_history()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO order_status_history (order_id, previous_status, current_status)
          VALUES (NEW.id, OLD.status, NEW.status);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }
}
