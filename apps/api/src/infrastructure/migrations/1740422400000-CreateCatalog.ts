import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalog1740422400000 implements MigrationInterface {
  name = 'CreateCatalog1740422400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Dimension tables
      CREATE TABLE brands (
        id          UUID        NOT NULL DEFAULT gen_random_uuid(),
        slug        TEXT        NOT NULL,
        name        TEXT        NOT NULL,
        logo_url    TEXT,
        theme_key   TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT brands_pkey PRIMARY KEY (id),
        CONSTRAINT brands_slug_key UNIQUE (slug)
      );

      CREATE TABLE countries (
        id          UUID        NOT NULL DEFAULT gen_random_uuid(),
        code        TEXT        NOT NULL,
        slug        TEXT        NOT NULL,
        name        JSONB       NOT NULL,
        flag_emoji  TEXT,
        theme_key   TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT countries_pkey PRIMARY KEY (id),
        CONSTRAINT countries_code_key UNIQUE (code),
        CONSTRAINT countries_slug_key UNIQUE (slug)
      );

      CREATE TABLE categories (
        id          UUID        NOT NULL DEFAULT gen_random_uuid(),
        slug        TEXT        NOT NULL,
        name        JSONB       NOT NULL,
        icon        TEXT,
        sort_order  INTEGER     NOT NULL,
        theme_key   TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT categories_pkey PRIMARY KEY (id),
        CONSTRAINT categories_slug_key UNIQUE (slug)
      );

      CREATE TABLE collections (
        id          UUID        NOT NULL DEFAULT gen_random_uuid(),
        code        TEXT        NOT NULL,
        slug        TEXT        NOT NULL,
        name        JSONB       NOT NULL,
        description JSONB       NOT NULL,
        hero_image  TEXT,
        theme_key   TEXT,
        sort_order  INTEGER     NOT NULL,
        is_active   BOOLEAN     NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT collections_pkey PRIMARY KEY (id),
        CONSTRAINT collections_code_key UNIQUE (code),
        CONSTRAINT collections_slug_key UNIQUE (slug)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id              UUID        NOT NULL DEFAULT gen_random_uuid(),
        slug            TEXT        NOT NULL,
        name            JSONB       NOT NULL,
        description     JSONB       NOT NULL,
        story           JSONB       NOT NULL,
        for_whom        JSONB       NOT NULL,
        weight          TEXT,
        price_minor     INTEGER     NOT NULL,
        currency        TEXT        NOT NULL,
        flavor          JSONB       NOT NULL,
        allergens       TEXT[]      NOT NULL,
        images          TEXT[]      NOT NULL,
        is_tried_by_us  BOOLEAN     NOT NULL,
        quantity        INTEGER     NOT NULL,
        sort_weight     INTEGER     NOT NULL,
        brand_id        UUID
            CONSTRAINT products_brands_fk
                REFERENCES brands(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        country_id      UUID        NOT NULL
            CONSTRAINT products_countries_fk
                REFERENCES countries(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        category_id     UUID        NOT NULL
            CONSTRAINT products_categories_fk
                REFERENCES categories(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at      TIMESTAMPTZ,
        CONSTRAINT products_pkey PRIMARY KEY (id),
        CONSTRAINT products_slug_key UNIQUE (slug)
      );

      CREATE TABLE collection_products (
        collection_id UUID NOT NULL
            CONSTRAINT collection_products_collections_fk
                REFERENCES collections(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        product_id    UUID NOT NULL
            CONSTRAINT collection_products_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        CONSTRAINT collection_products_pkey PRIMARY KEY (collection_id, product_id)
      );

      CREATE TABLE product_alternatives (
        product_id      UUID NOT NULL
            CONSTRAINT product_alternatives_products_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        alternative_id  UUID NOT NULL
            CONSTRAINT product_alternatives_alternatives_fk
                REFERENCES products(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
        CONSTRAINT product_alternatives_pkey PRIMARY KEY (product_id, alternative_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_country_id ON products(country_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_products_category_id ON products(category_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_products_brand_id ON products(brand_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_products_sort_weight ON products(sort_weight DESC) WHERE deleted_at IS NULL;
      CREATE INDEX idx_products_price_minor ON products(price_minor) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_price_minor;
      DROP INDEX IF EXISTS idx_products_sort_weight;
      DROP INDEX IF EXISTS idx_products_brand_id;
      DROP INDEX IF EXISTS idx_products_category_id;
      DROP INDEX IF EXISTS idx_products_country_id;

      DROP TABLE IF EXISTS product_alternatives;
      DROP TABLE IF EXISTS collection_products;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS collections;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS countries;
      DROP TABLE IF EXISTS brands;
    `);
  }
}
