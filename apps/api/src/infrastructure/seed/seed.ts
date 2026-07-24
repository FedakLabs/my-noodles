import 'reflect-metadata';
import { PasswordHasher } from '@my-noodles/api-lib/auth';
import { createAppDataSource } from '@my-noodles/api-lib/persistence';
import { slugify } from '@my-noodles/api-lib/utils';
import { DEFAULT_CURRENCY } from '@my-noodles/utils';
import { type DataSource, type Repository } from 'typeorm';

import { authConfig } from '@/application/auth';
import { Brand } from '@/application/brands';
import { Category } from '@/application/categories';
import { Collection } from '@/application/collections';
import { Country } from '@/application/countries';
import { FeedProductComment } from '@/application/feed';
import { Product } from '@/application/products';
import { Seller } from '@/application/sellers';
import { User } from '@/application/users';
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

  return await repository.save(repository.create({ slug, name, logoUrl: null, themeKey: null }));
}

async function upsertSeller(repository: Repository<Seller>, slug: string, name: string): Promise<Seller> {
  const existing = await repository.findOne({ where: { slug } });
  if (existing) {
    return existing;
  }

  return await repository.save(repository.create({ slug, name, logoUrl: null }));
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

  return await repository.save(
    repository.create({
      slug,
      nameLocale: placeholderLocalized(name),
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

  return await repository.save(
    repository.create({
      code: seed.code,
      slug: seed.slug,
      nameLocale: seed.name,
      flagEmoji: seed.flagEmoji,
      themeKey: seed.themeKey,
    }),
  );
}

const COLLECTION_CUSTOMIZATION: Record<
  string,
  { emoji: string; color: string; particles: string[]; longDescription: { uk: string; en: string } }
> = {
  noodles: {
    emoji: '🍜',
    color: '#E85D4C',
    particles: ['🌶️', '🔥', '⚡', '💥', '🍜'],
    longDescription: {
      uk: 'Від пекучих корейських рамен до ніжних японських удон — ці нудлі везуть із собою цілу культуру. Кожен пакет — це вулична їжа, яку ми привезли до вас додому. Пробуйте поодинці або влаштуйте сліпу дегустацію з друзями.',
      en: 'From fiery Korean ramen to silky Japanese udon, these noodles carry an entire culture in every packet. Street food, now delivered to your door. Try them solo or host a blind taste-test with friends.',
    },
  },
  snacks: {
    emoji: '🍿',
    color: '#DC2626',
    particles: ['🍿', '⭐', '🎥', '🎞️', '🎭'],
    longDescription: {
      uk: 'Снеки, які завоювали TikTok, кінотеатри та нічні ринки по всьому світу. Незвичні смаки, хрумке задоволення і той самий азіатський колорит, який неможливо знайти у звичайному супермаркеті.',
      en: "Snacks that conquered TikTok, movie theatres and night markets across the globe. Unusual flavours, satisfying crunch and that distinctly Asian flair you just can't find in a regular supermarket.",
    },
  },
  biscuits: {
    emoji: '🍪',
    color: '#D4A853',
    particles: ['🍪', '☕', '✏️', '🌟', '✨'],
    longDescription: {
      uk: 'Печиво і крекери — маленьке задоволення, яке перетворює звичайну перерву на справжній момент. Японські wafer-бісквіти, корейські рисові крекери, тайські кокосові пальчики — є від чого рябіти в очах.',
      en: "Biscuits and crackers — the small treat that turns an ordinary break into a proper moment. Japanese wafers, Korean rice crackers, Thai coconut fingers. There's a whole world to explore one bite at a time.",
    },
  },
  candy: {
    emoji: '🍬',
    color: '#9D4EDD',
    particles: ['🍬', '🎵', '✨', '💫', '🌈'],
    longDescription: {
      uk: 'Карамелі, желейки та льодяники, яких не знайдеш у місцевих магазинах. Азіатські цукерки — це цілий жанр: від фруктових желе у форм очок до тягнучих молочних карамелей з Японії.',
      en: "Caramels, gummies and hard candies you won't find in local stores. Asian confectionery is its own genre: fruit jelly cups, stretchy Japanese milk caramels, and flavours that surprise every time.",
    },
  },
  drinks: {
    emoji: '🥤',
    color: '#2A5CBF',
    particles: ['🥤', '💫', '🌊', '❄️', '💧'],
    longDescription: {
      uk: 'Напої, які не схожі на все, що ви пробували. Японський Calpico, корейські фруктові соки, тайський холодний чай — все це тут. Ідеально до їжі або просто щоб освіжитись у спеку.',
      en: "Drinks unlike anything you've tasted before. Japanese Calpico, Korean fruit juices, Thai iced tea — all here. Perfect with food or just for a refreshing break on a hot day.",
    },
  },
  sweets: {
    emoji: '🍭',
    color: '#E85D4C',
    particles: ['🍭', '🌺', '🌸', '🍓', '💖'],
    longDescription: {
      uk: "Солодощі, від яких сяють очі. Моті, тайські кокосові цукерки, корейські рисові десерти — це не просто їжа, а культурна пам'ять у солодкій обгортці. Подарунок собі або близьким.",
      en: 'Sweets that make eyes light up. Mochi, Thai coconut candy, Korean rice desserts — not just food, but cultural memory wrapped in sweetness. A gift to yourself or the people you care about.',
    },
  },
  cakes: {
    emoji: '🎂',
    color: '#40916C',
    particles: ['🎂', '🌱', '🍃', '🌿', '🌺'],
    longDescription: {
      uk: 'Тістечка та торти у мінімалістичному азіатському стилі — менш солодкі, більш ніжні, із зеленим чаєм, юдзу або білим шоколадом. Зовсім інший погляд на десерт.',
      en: 'Cakes and pastries in a minimalist Asian style — less sweet, more delicate, flavoured with matcha, yuzu or white chocolate. A completely different take on dessert.',
    },
  },
};

async function upsertCollection(
  repository: Repository<Collection>,
  category: Category,
  sortOrder: number,
): Promise<Collection> {
  const existing = await repository.findOne({ where: { slug: category.slug } });
  if (existing) {
    return existing;
  }

  const customization = COLLECTION_CUSTOMIZATION[category.slug] ?? null;

  return await repository.save(
    repository.create({
      slug: category.slug,
      nameLocale: category.nameLocale,
      descriptionLocale: {
        uk: `Добірка категорії «${category.nameLocale.uk}».`,
        en: `A curated pick from «${category.nameLocale.en ?? category.nameLocale.uk}».`,
      },
      longDescriptionLocale: customization?.longDescription ?? { uk: '', en: '' },
      emoji: customization?.emoji ?? '📦',
      color: customization?.color ?? '#888888',
      particles: customization?.particles ?? [],
      heroImage: null,
      themeKey: category.themeKey,
      sortOrder,
      isActive: true,
      products: [],
    }),
  );
}

async function upsertAdminUser(repository: Repository<User>): Promise<User> {
  const email = authConfig.adminEmail.toLowerCase();
  const existing = await repository.findOne({ where: { email } });
  const passwordHash = await new PasswordHasher().hash(authConfig.adminPassword);

  if (existing) {
    existing.passwordHash = passwordHash;
    return await repository.save(existing);
  }

  return await repository.save(repository.create({ email, passwordHash }));
}

async function ensureReferenceSellers(dataSource: DataSource): Promise<Seller> {
  const sellerRepository = dataSource.getRepository(Seller);
  const myNoodlesSeller = await upsertSeller(sellerRepository, 'my-noodles', 'MyNoodles');
  await upsertSeller(sellerRepository, 'asia-foods', 'AsiaFoods');
  console.log('Sellers ready: MyNoodles, AsiaFoods');
  return myNoodlesSeller;
}

async function seed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const admin = await upsertAdminUser(userRepository);
  console.log(`Admin user ready: ${admin.email}`);

  const myNoodlesSeller = await ensureReferenceSellers(dataSource);

  if (PRODUCT_SEEDS.length === 0) {
    console.log('No product seeds defined — skipping product seed.');
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
        nameLocale: placeholderLocalized(row.name),
        descriptionLocale: copy.description,
        storyLocale: copy.story,
        forWhomLocale: copy.forWhom,
        weight: row.weight,
        priceMinor: row.priceMinor,
        currency: DEFAULT_CURRENCY,
        flavor: row.flavor,
        allergens: [...row.allergens],
        images: productImages(row),
        videos: productVideos(row),
        isTriedByUs: row.isTriedByUs,
        quantity: row.quantity,
        available: true,
        sortWeight: row.sortWeight,
        brandId: brand.id,
        sellerId: myNoodlesSeller.id,
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
          commentLocale: seed.comment,
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
