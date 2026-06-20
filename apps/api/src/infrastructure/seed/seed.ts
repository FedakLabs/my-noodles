import 'reflect-metadata';

import { type DataSource, type Repository } from 'typeorm';

import { Brand } from '@/application/brands';
import { Category } from '@/application/categories';
import { Collection } from '@/application/collections';
import { Country } from '@/application/countries';
import { Product } from '@/application/products';
import { config } from '@/config';
import { createAppDataSource } from '@/infrastructure/persistence';
import { slugify } from '@/utils/slugify';

import {
  defaultProductCopy,
  placeholderLocalized,
  PRODUCT_SEEDS,
  resolveCountrySeed,
  uniqueSlug,
} from './seed-data';

async function upsertBrand(repository: Repository<Brand>, name: string): Promise<Brand> {
  const slug = slugify(name);
  const existing = await repository.findOne({ where: { slug } });
  if (existing) {
    return existing;
  }

  return repository.save({ slug, name, logoUrl: null, themeKey: null });
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

  return repository.save({
    slug,
    name: placeholderLocalized(name),
    icon: null,
    sortOrder,
    themeKey: null,
  });
}

async function upsertCountry(repository: Repository<Country>, countryName: string): Promise<Country> {
  const seed = resolveCountrySeed(countryName);
  const existing = await repository.findOne({ where: { code: seed.code } });
  if (existing) {
    return existing;
  }

  return repository.save({
    code: seed.code,
    slug: seed.slug,
    name: seed.name,
    flagEmoji: seed.flagEmoji,
    themeKey: seed.themeKey,
  });
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

  return repository.save({
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
  });
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

  const usedSlugs = new Set(
    (await productRepository.find({ select: { slug: true } })).map((product) => product.slug),
  );

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

    const slug = uniqueSlug(row.name, usedSlugs);
    const copy = defaultProductCopy(row.name);

    const existingProduct = await productRepository.findOne({ where: { slug } });
    if (existingProduct) {
      continue;
    }

    const product = await productRepository.save({
      slug,
      name: placeholderLocalized(row.name),
      description: copy.description,
      story: copy.story,
      forWhom: copy.forWhom,
      weight: null,
      priceMinor: 9_900,
      currency: 'UAH',
      flavor: { spice: 1, sweet: 1, texture: 'crunchy' },
      allergens: [],
      images: [],
      isTriedByUs: false,
      quantity: 5,
      sortWeight: 0,
      brandId: brand.id,
      countryId: country.id,
      categoryId: category.id,
    });

    await collectionRepository
      .createQueryBuilder()
      .relation(Collection, 'products')
      .of(collection)
      .add(product);
  }

  console.log(`Seeded ${PRODUCT_SEEDS.length} products`);
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
