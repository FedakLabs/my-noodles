import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductSellerId1740422424000 implements MigrationInterface {
  name = 'ProductSellerId1740422424000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN seller_id UUID;
    `);

    await queryRunner.query(`
      UPDATE products
      SET seller_id = (SELECT id FROM sellers ORDER BY created_at ASC, id ASC LIMIT 1)
      WHERE seller_id IS NULL
        AND EXISTS (SELECT 1 FROM sellers);
    `);

    await queryRunner.query(`
      ALTER TABLE products
        ALTER COLUMN seller_id SET NOT NULL,
        ADD CONSTRAINT products_sellers_fk
          FOREIGN KEY (seller_id)
          REFERENCES sellers(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_seller_id ON products(seller_id) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_seller_id;
    `);

    await queryRunner.query(`
      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS products_sellers_fk,
        DROP COLUMN IF EXISTS seller_id;
    `);
  }
}
