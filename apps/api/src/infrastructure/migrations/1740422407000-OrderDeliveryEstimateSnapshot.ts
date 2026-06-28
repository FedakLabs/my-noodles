import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class OrderDeliveryEstimateSnapshot1740422407000 implements MigrationInterface {
  name = 'OrderDeliveryEstimateSnapshot1740422407000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      ADD COLUMN "estimated_delivery_at" TIMESTAMPTZ NULL,
      ADD COLUMN "estimated_days_min" integer NULL,
      ADD COLUMN "estimated_days_max" integer NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      DROP COLUMN "estimated_delivery_at",
      DROP COLUMN "estimated_days_min",
      DROP COLUMN "estimated_days_max"
    `);
  }
}
