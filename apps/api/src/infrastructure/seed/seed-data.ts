import { LocalizedString } from '@my-noodles/api-lib/locale';
import { slugify } from '@my-noodles/api-lib/utils';
import type { LocalizedStringData } from '@my-noodles/locale';

type SeedFlavor = {
  spice: number;
  sweet: number;
  texture: string;
};

export type SeedProductRow = {
  name: string;
  category: string;
  brand: string;
  country: string;
  weight: string;
  priceMinor: number;
  flavor: SeedFlavor;
  allergens: readonly string[];
  quantity: number;
  sortWeight: number;
  isTriedByUs: boolean;
  alternativeGroup: string;
};

type MarketSeed = {
  country: string;
  brands: readonly string[];
  sortBoost: number;
};

type ProductBlueprint = {
  name: string;
  category: string;
  weight: string;
  priceMinor: number;
  flavor: SeedFlavor;
  allergens: readonly string[];
  alternativeGroup: string;
};

const MARKETS: readonly MarketSeed[] = [
  {
    country: 'South Korea',
    brands: ['Samyang', 'Nongshim', 'Orion', 'Lotte', 'Haitai'],
    sortBoost: 70,
  },
  {
    country: 'Japan',
    brands: ['Nissin', 'Glico', 'Meiji', 'Calbee', 'Bourbon'],
    sortBoost: 60,
  },
  {
    country: 'Thailand',
    brands: ['Mama', 'Tao Kae Noi', 'Bento', 'Koh-Kae', 'Dutch Mill'],
    sortBoost: 50,
  },
  {
    country: 'Taiwan',
    brands: ['Uni-President', 'Kuai Kuai', 'I-Mei', 'HeySong', 'Want Want'],
    sortBoost: 45,
  },
  {
    country: 'China',
    brands: ['Haidilao', "Lay's", 'Want Want', 'Master Kong', 'White Rabbit'],
    sortBoost: 40,
  },
  {
    country: 'USA',
    brands: ['Pringles', "Reese's", 'Takis', 'Pop-Tarts', 'Cheetos'],
    sortBoost: 30,
  },
  {
    country: 'Canada',
    brands: ['Hawkins', 'Coffee Crisp', 'Aero', 'Smarties', 'Maynards'],
    sortBoost: 20,
  },
];

const PRODUCT_BLUEPRINTS: readonly ProductBlueprint[] = [
  {
    name: 'Fire Cheese Ramen',
    category: 'Noodles',
    weight: '140 g',
    priceMinor: 12_900,
    flavor: { spice: 5, sweet: 1, texture: 'springy noodles' },
    allergens: ['wheat', 'soy', 'milk'],
    alternativeGroup: 'spicy-noodles',
  },
  {
    name: 'Honey Butter Potato Chips',
    category: 'Snacks',
    weight: '120 g',
    priceMinor: 10_900,
    flavor: { spice: 1, sweet: 2, texture: 'crisp chips' },
    allergens: ['milk'],
    alternativeGroup: 'savory-crunch',
  },
  {
    name: 'Seaweed Crunch Snack',
    category: 'Snacks',
    weight: '36 g',
    priceMinor: 8_900,
    flavor: { spice: 1, sweet: 1, texture: 'paper-thin crunch' },
    allergens: ['sesame'],
    alternativeGroup: 'seaweed',
  },
  {
    name: 'Chocolate Biscuit Sticks',
    category: 'Biscuits',
    weight: '52 g',
    priceMinor: 7_900,
    flavor: { spice: 0, sweet: 4, texture: 'snappy biscuit' },
    allergens: ['wheat', 'milk'],
    alternativeGroup: 'biscuit-sticks',
  },
  {
    name: 'Mango Chili Gummies',
    category: 'Candy',
    weight: '80 g',
    priceMinor: 9_500,
    flavor: { spice: 2, sweet: 5, texture: 'chewy gummies' },
    allergens: [],
    alternativeGroup: 'sweet-heat',
  },
  {
    name: 'Brown Sugar Milk Tea',
    category: 'Drinks',
    weight: '315 ml',
    priceMinor: 11_500,
    flavor: { spice: 0, sweet: 4, texture: 'creamy drink' },
    allergens: ['milk'],
    alternativeGroup: 'milk-tea',
  },
  {
    name: 'Peanut Mochi Bites',
    category: 'Sweets',
    weight: '120 g',
    priceMinor: 10_500,
    flavor: { spice: 0, sweet: 3, texture: 'soft mochi' },
    allergens: ['peanuts'],
    alternativeGroup: 'mochi',
  },
  {
    name: 'Wasabi Pea Mix',
    category: 'Snacks',
    weight: '90 g',
    priceMinor: 9_900,
    flavor: { spice: 4, sweet: 1, texture: 'sharp crunchy peas' },
    allergens: ['soy'],
    alternativeGroup: 'spicy-crunch',
  },
  {
    name: 'Strawberry Cream Cake Roll',
    category: 'Cakes',
    weight: '68 g',
    priceMinor: 8_500,
    flavor: { spice: 0, sweet: 5, texture: 'soft sponge' },
    allergens: ['wheat', 'egg', 'milk'],
    alternativeGroup: 'soft-cakes',
  },
  {
    name: 'Fried Chicken Flavor Crisps',
    category: 'Snacks',
    weight: '105 g',
    priceMinor: 10_900,
    flavor: { spice: 2, sweet: 1, texture: 'stacked crisps' },
    allergens: ['wheat', 'soy'],
    alternativeGroup: 'savory-crunch',
  },
];

export const PRODUCT_SEEDS: readonly SeedProductRow[] = MARKETS.flatMap((market, marketIndex) =>
  PRODUCT_BLUEPRINTS.map((blueprint, blueprintIndex) => {
    const brand = market.brands[blueprintIndex % market.brands.length]!;

    return {
      name: `${brand} ${blueprint.name}`,
      category: blueprint.category,
      brand,
      country: market.country,
      weight: blueprint.weight,
      priceMinor: blueprint.priceMinor + marketIndex * 300 + blueprintIndex * 120,
      flavor: blueprint.flavor,
      allergens: blueprint.allergens,
      quantity: 4 + ((marketIndex + blueprintIndex) % 9),
      sortWeight: market.sortBoost + PRODUCT_BLUEPRINTS.length - blueprintIndex,
      isTriedByUs: (marketIndex + blueprintIndex) % 3 === 0,
      alternativeGroup: blueprint.alternativeGroup,
    };
  }),
);

type CountrySeed = {
  code: string;
  slug: string;
  name: LocalizedStringData;
  flagEmoji: string | null;
  themeKey: string | null;
};

const COUNTRY_SEEDS: Record<string, CountrySeed> = {
  China: {
    code: 'CN',
    slug: 'china',
    name: { uk: 'Китай', en: 'China' },
    flagEmoji: '🇨🇳',
    themeKey: 'CN',
  },
  Japan: {
    code: 'JP',
    slug: 'japan',
    name: { uk: 'Японія', en: 'Japan' },
    flagEmoji: '🇯🇵',
    themeKey: 'JP',
  },
  'South Korea': {
    code: 'KR',
    slug: 'south-korea',
    name: { uk: 'Південна Корея', en: 'South Korea' },
    flagEmoji: '🇰🇷',
    themeKey: 'KR',
  },
  Thailand: {
    code: 'TH',
    slug: 'thailand',
    name: { uk: 'Таїланд', en: 'Thailand' },
    flagEmoji: '🇹🇭',
    themeKey: 'TH',
  },
  USA: {
    code: 'US',
    slug: 'usa',
    name: { uk: 'США', en: 'USA' },
    flagEmoji: '🇺🇸',
    themeKey: 'US',
  },
  Canada: {
    code: 'CA',
    slug: 'canada',
    name: { uk: 'Канада', en: 'Canada' },
    flagEmoji: '🇨🇦',
    themeKey: 'CA',
  },
  Taiwan: {
    code: 'TW',
    slug: 'taiwan',
    name: { uk: 'Тайвань', en: 'Taiwan' },
    flagEmoji: '🇹🇼',
    themeKey: 'TW',
  },
};

export function resolveCountrySeed(countryName: string): CountrySeed {
  const known = COUNTRY_SEEDS[countryName];
  if (known) {
    return known;
  }

  const slug = slugify(countryName);
  return {
    code: slug.slice(0, 2).toUpperCase().padEnd(2, 'X'),
    slug,
    name: { uk: countryName, en: countryName },
    flagEmoji: null,
    themeKey: null,
  };
}

export function placeholderLocalized(name: string): LocalizedString {
  return new LocalizedString({ uk: name, en: name });
}

function hashText(value: string): number {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function pickByName(name: string, options: readonly string[]): string {
  return options[hashText(name) % options.length]!;
}

export function defaultProductCopy(seed: SeedProductRow | string): {
  description: LocalizedString;
  story: LocalizedString;
  forWhom: LocalizedString;
} {
  const name = typeof seed === 'string' ? seed : seed.name;
  const category = typeof seed === 'string' ? 'snack' : seed.category.toLowerCase();
  const country = typeof seed === 'string' ? 'its home country' : seed.country;
  const texture = typeof seed === 'string' ? 'bright texture' : seed.flavor.texture;

  const ukOpeners = [
    'яскрава знахідка для полиці з імпортними смаколиками',
    'той самий смак, через який рука тягнеться взяти ще один шматочок',
    'маленька подорож у форматі снека',
    'цікавий вибір для вечора, коли хочеться чогось не як завжди',
  ];
  const enOpeners = [
    'a bright little find for the imported-snack shelf',
    'the kind of treat that makes you reach back into the bag',
    'a tiny trip packed into snack form',
    'a fun pick for nights when ordinary snacks feel too ordinary',
  ];

  return {
    description: new LocalizedString({
      uk: `${name} — ${pickByName(name, ukOpeners)}. У смаку відчувається ${texture}, а категорія ${category} робить його легким кандидатом у кошик.`,
      en: `${name} is ${pickByName(name, enOpeners)}. Expect ${texture}, a clear ${category} mood, and enough personality to make the first try feel easy.`,
    }),
    story: new LocalizedString({
      uk: `Привезли натхнення з ${country}: це саме той продукт, який хочеться відкрити з друзями й обговорити після першого укусу.`,
      en: `Inspired by shelves in ${country}, this is the kind of product you open with friends and talk about after the first bite.`,
    }),
    forWhom: new LocalizedString({
      uk: pickByName(name, [
        'Для тих, хто любить пробувати нове без довгих роздумів.',
        'Для фанатів маленьких відкриттів і чесних, помітних смаків.',
        'Для кошика, в якому має бути щось несподіване.',
        'Для вечора кіно, офісної перерви або подарункового боксу.',
      ]),
      en: pickByName(name, [
        'For curious snack explorers who like low-risk discoveries.',
        'For fans of small surprises and flavors that actually show up.',
        'For carts that need one unexpected treat.',
        'For movie nights, office breaks, or a playful gift box.',
      ]),
    }),
  };
}

export function productImages(row: SeedProductRow): string[] {
  const slug = slugify(row.name);

  return [
    `https://picsum.photos/seed/${slug}-front/900/900`,
    `https://picsum.photos/seed/${slug}-detail/900/900`,
  ];
}

const SAMPLE_PRODUCT_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/fruits.mp4',
] as const;

export function productVideos(row: SeedProductRow): string[] {
  if (!row.isTriedByUs) {
    return [];
  }

  const slug = slugify(row.name);
  const index =
    Math.abs(slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) %
    SAMPLE_PRODUCT_VIDEOS.length;

  return [SAMPLE_PRODUCT_VIDEOS[index]!];
}

export function uniqueSlug(base: string, used: Set<string>): string {
  let candidate = slugify(base);
  if (!candidate) {
    candidate = 'product';
  }

  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }

  let suffix = 2;
  while (used.has(`${candidate}-${suffix}`)) {
    suffix += 1;
  }

  const unique = `${candidate}-${suffix}`;
  used.add(unique);
  return unique;
}
