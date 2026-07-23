import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductAvailable1740422419000 implements MigrationInterface {
  name = 'ProductAvailable1740422419000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN available BOOLEAN NOT NULL DEFAULT true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN available;
    `);
  }
}
