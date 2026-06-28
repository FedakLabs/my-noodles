import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderCancelledReason1740422405000 implements MigrationInterface {
  name = 'OrderCancelledReason1740422405000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN cancelled_reason TEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN IF EXISTS cancelled_reason;
    `);
  }
}
