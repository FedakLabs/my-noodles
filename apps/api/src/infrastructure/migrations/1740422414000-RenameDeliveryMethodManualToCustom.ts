import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDeliveryMethodManualToCustom1740422414000 implements MigrationInterface {
  name = 'RenameDeliveryMethodManualToCustom1740422414000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "order_deliveries"
      SET "method" = 'custom'
      WHERE "method" = 'manual'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "order_deliveries"
      SET "method" = 'manual'
      WHERE "method" = 'custom'
    `);
  }
}
