import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1740422415000 implements MigrationInterface {
  name = 'CreateUsers1740422415000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID NOT NULL DEFAULT uuidv7(),
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_email_unique UNIQUE (email)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
