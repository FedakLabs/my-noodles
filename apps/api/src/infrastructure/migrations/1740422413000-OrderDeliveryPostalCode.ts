import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderDeliveryPostalCode1740422413000 implements MigrationInterface {
  name = 'OrderDeliveryPostalCode1740422413000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      ADD COLUMN "postal_code" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      DROP COLUMN "postal_code"
    `);
  }
}
