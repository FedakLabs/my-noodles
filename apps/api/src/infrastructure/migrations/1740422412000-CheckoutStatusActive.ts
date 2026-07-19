import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckoutStatusActive1740422412000 implements MigrationInterface {
  name = 'CheckoutStatusActive1740422412000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE checkouts
        SET status = 'active'
        WHERE status = 'in_progress';

      DROP INDEX IF EXISTS idx_checkouts_visitor_in_progress;

      CREATE UNIQUE INDEX idx_checkouts_visitor_active
        ON checkouts(visitor_session_id)
        WHERE status = 'active' AND deleted_at IS NULL;

      DROP INDEX IF EXISTS idx_checkouts_active_expires_at;

      CREATE INDEX idx_checkouts_active_expires_at
        ON checkouts(expires_at)
        WHERE status = 'active' AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_checkouts_active_expires_at;

      CREATE INDEX idx_checkouts_active_expires_at
        ON checkouts(expires_at)
        WHERE status = 'in_progress' AND deleted_at IS NULL;

      DROP INDEX IF EXISTS idx_checkouts_visitor_active;

      CREATE UNIQUE INDEX idx_checkouts_visitor_in_progress
        ON checkouts(visitor_session_id)
        WHERE status = 'in_progress' AND deleted_at IS NULL;

      UPDATE checkouts
        SET status = 'in_progress'
        WHERE status = 'active';
    `);
  }
}
