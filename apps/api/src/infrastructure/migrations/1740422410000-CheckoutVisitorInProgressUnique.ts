import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckoutVisitorInProgressUnique1740422410000 implements MigrationInterface {
  name = 'CheckoutVisitorInProgressUnique1740422410000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_checkouts_visitor_in_progress
        ON checkouts(visitor_session_id)
        WHERE status = 'in_progress' AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_checkouts_visitor_in_progress;
    `);
  }
}
