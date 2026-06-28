import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class OrderReceiverFirstLastName1740422409000 implements MigrationInterface {
  name = 'OrderReceiverFirstLastName1740422409000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders" RENAME COLUMN "customer_name" TO "first_name";
      ALTER TABLE "orders" ADD COLUMN "last_name" text NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders" DROP COLUMN "last_name";
      ALTER TABLE "orders" RENAME COLUMN "first_name" TO "customer_name";
    `);
  }
}
