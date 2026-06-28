import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class OrderDeliveryCityRefAndShippingSnapshot1740422408000 implements MigrationInterface {
  name = 'OrderDeliveryCityRefAndShippingSnapshot1740422408000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      ADD COLUMN "city_ref" text NULL,
      ADD COLUMN "shipping_cost_minor" integer NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_deliveries"
      DROP COLUMN "city_ref",
      DROP COLUMN "shipping_cost_minor"
    `);
  }
}
