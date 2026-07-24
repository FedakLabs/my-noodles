import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CollectionsSchema1740422420000 implements MigrationInterface {
  name = 'CollectionsSchema1740422420000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collections
        DROP COLUMN IF EXISTS code,
        ADD COLUMN IF NOT EXISTS emoji TEXT,
        ADD COLUMN IF NOT EXISTS color TEXT,
        ADD COLUMN IF NOT EXISTS particles JSONB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collections
        ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
        DROP COLUMN IF EXISTS emoji,
        DROP COLUMN IF EXISTS color,
        DROP COLUMN IF EXISTS particles;
    `);
  }
}
