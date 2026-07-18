import 'reflect-metadata';
import { createAppDataSource } from '@my-noodles/api-lib/persistence';
import { slugify } from '@my-noodles/api-lib/utils';
import { DEFAULT_CURRENCY } from '@my-noodles/utils';
import { type DataSource, type Repository } from 'typeorm';

import { Brand } from '@/application/brands';
import { Category } from '@/application/categories';
import { Collection } from '@/application/collections';
import { Country } from '@/application/countries';
import { FeedProductComment } from '@/application/feed';
import { Product } from '@/application/products';
import { config } from '@/config';

import { buildFeedCommentSeeds } from './feed-seed-data';
import {
  defaultProductCopy,
  placeholderLocalized,
  PRODUCT_SEEDS,
  productImages,
  productVideos,
  resolveCountrySeed,
  type SeedProductRow,
  uniqueSlug,
} from './seed-data';

type SeededProduct = {
  row: SeedProductRow;
  product: Product;
};

async function upsertBrand(repository: Repository<Brand>, name: string): Promise<Brand> {
  const slug = slugify(name);
  const existing = await repository.findOne({ where: { slug } });
  if (existing) {
    return existing;
  }

  return repository.save(repository.create({ slug, name, logoUrl: null, themeKey: null }));
}

async function upsertCategory(
  repository: Repository<Category>,
  name: string,
  sortOrder: number,
): Promise<Category> {
  const slug = slugify(name);
  const existing = await repository.findOne({ where: { slug } });
  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      slug,
      name: placeholderLocalized(name),
      icon: null,
      sortOrder,
      themeKey: null,
    }),
  );
}

async function upsertCountry(repository: Repository<Country>, countryName: string): Promise<Country> {
  const seed = resolveCountrySeed(countryName);
  const existing = await repository.findOne({ where: { code: seed.code } });
  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      code: seed.code,
      slug: seed.slug,
      name: seed.name,
      flagEmoji: seed.flagEmoji,
      themeKey: seed.themeKey,
    }),
  );
}

async function upsertCollection(
  repository: Repository<Collection>,
  category: Category,
  sortOrder: number,
): Promise<Collection> {
  const existing = await repository.findOne({ where: { code: category.slug } });
  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      code: category.slug,
      slug: category.slug,
      name: category.name,
      description: {
        uk: `Добірка категорії «${category.name.uk}».`,
        en: `A curated pick from «${category.name.en ?? category.name.uk}».`,
      },
      heroImage: null,
      themeKey: category.themeKey,
      sortOrder,
      isActive: true,
      products: [],
    }),
  );
}

async function seed(dataSource: DataSource): Promise<void> {
  if (PRODUCT_SEEDS.length === 0) {
    console.log('No product seeds defined — skipping seed.');
    return;
  }

  const brandRepository = dataSource.getRepository(Brand);
  const categoryRepository = dataSource.getRepository(Category);
  const countryRepository = dataSource.getRepository(Country);
  const collectionRepository = dataSource.getRepository(Collection);
  const productRepository = dataSource.getRepository(Product);

  const usedSeedSlugs = new Set<string>();
  const seededProducts: SeededProduct[] = [];

  const categorySort = new Map<string, number>();
  let categoryOrder = 0;

  for (const row of PRODUCT_SEEDS) {
    const brand = await upsertBrand(brandRepository, row.brand);
    const country = await upsertCountry(countryRepository, row.country);

    if (!categorySort.has(row.category)) {
      categoryOrder += 1;
      categorySort.set(row.category, categoryOrder);
    }

    const category = await upsertCategory(
      categoryRepository,
      row.category,
      categorySort.get(row.category) ?? 0,
    );
    const collection = await upsertCollection(
      collectionRepository,
      category,
      categorySort.get(row.category) ?? 0,
    );

    const slug = uniqueSlug(row.name, usedSeedSlugs);
    const copy = defaultProductCopy(row);

    const existingProduct = await productRepository.findOne({ where: { slug } });
    if (existingProduct) {
      seededProducts.push({ row, product: existingProduct });
      continue;
    }

    const product = await productRepository.save(
      productRepository.create({
        slug,
        name: placeholderLocalized(row.name),
        description: copy.description,
        story: copy.story,
        forWhom: copy.forWhom,
        weight: row.weight,
        priceMinor: row.priceMinor,
        currency: DEFAULT_CURRENCY,
        flavor: row.flavor,
        allergens: [...row.allergens],
        images: productImages(row),
        videos: productVideos(row),
        isTriedByUs: row.isTriedByUs,
        quantity: row.quantity,
        sortWeight: row.sortWeight,
        brandId: brand.id,
        countryId: country.id,
        categoryId: category.id,
      }),
    );

    seededProducts.push({ row, product });

    await collectionRepository
      .createQueryBuilder()
      .relation(Collection, 'products')
      .of(collection)
      .add(product);
  }

  for (const seeded of seededProducts) {
    const alternatives = pickAlternatives(seeded, seededProducts);
    if (alternatives.length === 0) {
      continue;
    }

    const existingAlternatives = await productRepository
      .createQueryBuilder()
      .relation(Product, 'alternatives')
      .of(seeded.product)
      .loadMany<Product>();
    const existingAlternativeIds = new Set(existingAlternatives.map((product) => product.id));
    const alternativeIds = alternatives
      .map((alternative) => alternative.product.id)
      .filter((id) => !existingAlternativeIds.has(id));

    if (alternativeIds.length > 0) {
      await productRepository
        .createQueryBuilder()
        .relation(Product, 'alternatives')
        .of(seeded.product)
        .add(alternativeIds);
    }
  }

  await seedFeedComments(dataSource, seededProducts);

  console.log(`Seeded ${PRODUCT_SEEDS.length} products`);
}

async function seedFeedComments(
  dataSource: DataSource,
  seededProducts: readonly SeededProduct[],
): Promise<void> {
  const commentRepository = dataSource.getRepository(FeedProductComment);
  let seededCount = 0;

  for (const { product } of seededProducts) {
    const existing = await commentRepository.count({ where: { productId: product.id } });
    if (existing > 0) {
      continue;
    }

    const seeds = buildFeedCommentSeeds(product.slug);
    await commentRepository.save(
      seeds.map((seed) =>
        commentRepository.create({
          productId: product.id,
          authorName: seed.authorName,
          comment: seed.comment,
        }),
      ),
    );
    seededCount += seeds.length;
  }

  if (seededCount > 0) {
    console.log(`Seeded ${seededCount} feed comments`);
  }
}

function pickAlternatives(current: SeededProduct, products: readonly SeededProduct[]): SeededProduct[] {
  return products
    .filter((candidate) => candidate.product.id !== current.product.id)
    .map((candidate) => ({
      candidate,
      score: alternativeScore(current.row, candidate.row),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.candidate.row.name.localeCompare(right.candidate.row.name),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function alternativeScore(current: SeedProductRow, candidate: SeedProductRow): number {
  let score = 0;

  if (candidate.alternativeGroup === current.alternativeGroup) {
    score += 6;
  }
  if (candidate.category === current.category) {
    score += 4;
  }
  if (candidate.country === current.country) {
    score += 2;
  }
  if (candidate.brand !== current.brand) {
    score += 1;
  }

  return score;
}

async function main(): Promise<void> {
  const dataSource = createAppDataSource(config);

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  try {
    await seed(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
