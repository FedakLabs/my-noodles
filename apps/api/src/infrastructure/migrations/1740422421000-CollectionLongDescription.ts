import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CollectionLongDescription1740422421000 implements MigrationInterface {
  name = 'CollectionLongDescription1740422421000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collections
        ADD COLUMN IF NOT EXISTS long_description JSONB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collections
        DROP COLUMN IF EXISTS long_description;
    `);
  }
}
