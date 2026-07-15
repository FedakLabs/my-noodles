import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckoutExpiresAt1740422411000 implements MigrationInterface {
  name = 'CheckoutExpiresAt1740422411000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE checkouts ADD COLUMN expires_at TIMESTAMPTZ;

      UPDATE checkouts
        SET expires_at = created_at + interval '15 minutes'
        WHERE expires_at IS NULL;

      ALTER TABLE checkouts ALTER COLUMN expires_at SET NOT NULL;

      CREATE INDEX idx_checkouts_active_expires_at
        ON checkouts(expires_at)
        WHERE status = 'in_progress' AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_checkouts_active_expires_at;
      ALTER TABLE checkouts DROP COLUMN IF EXISTS expires_at;
    `);
  }
}
