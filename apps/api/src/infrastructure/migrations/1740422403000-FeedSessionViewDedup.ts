import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FeedSessionViewDedup1740422403000 implements MigrationInterface {
  name = 'FeedSessionViewDedup1740422403000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_feed_session_views_session_product
        ON feed_session_views(session_id, product_id) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS uq_feed_session_views_session_product;
    `);
  }
}
