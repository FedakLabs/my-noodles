import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CollectionsNotNull1740422422000 implements MigrationInterface {
  name = 'CollectionsNotNull1740422422000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE collections SET emoji = '📦' WHERE emoji IS NULL;
      UPDATE collections SET color = '#888888' WHERE color IS NULL;
      UPDATE collections SET particles = '[]'::jsonb WHERE particles IS NULL;
      UPDATE collections SET long_description = '{"uk":"","en":""}'::jsonb WHERE long_description IS NULL;

      ALTER TABLE collections
        ALTER COLUMN emoji SET NOT NULL,
        ALTER COLUMN color SET NOT NULL,
        ALTER COLUMN particles SET NOT NULL,
        ALTER COLUMN long_description SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collections
        ALTER COLUMN emoji DROP NOT NULL,
        ALTER COLUMN color DROP NOT NULL,
        ALTER COLUMN particles DROP NOT NULL,
        ALTER COLUMN long_description DROP NOT NULL;
    `);
  }
}
