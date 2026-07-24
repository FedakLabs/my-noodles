import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellers1740422423000 implements MigrationInterface {
  name = 'CreateSellers1740422423000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sellers (
        id          UUID        NOT NULL DEFAULT uuidv7(),
        slug        TEXT        NOT NULL,
        name        TEXT        NOT NULL,
        logo_url    TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT sellers_pkey PRIMARY KEY (id),
        CONSTRAINT sellers_slug_key UNIQUE (slug)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS sellers;
    `);
  }
}
