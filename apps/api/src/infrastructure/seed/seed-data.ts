import type { LocalizedStringData } from '@/infrastructure/i18n';
import { LocalizedString } from '@/infrastructure/i18n';
import { slugify } from '@/utils/slugify';

export type SeedProductRow = {
  name: string;
  category: string;
  brand: string;
  country: string;
};

/** Dev-only catalog rows — extend here when adding sample products. */
export const PRODUCT_SEEDS: readonly SeedProductRow[] = [
  {
    name: 'Samyang Buldak Cheese Ramen',
    category: 'Snacks',
    brand: 'Samyang',
    country: 'South Korea',
  },
  {
    name: 'Nongshim Shin Ramyun Black',
    category: 'Noodles',
    brand: 'Nongshim',
    country: 'South Korea',
  },
  {
    name: "Lay's KFC Fried Chicken Flavor",
    category: 'Snacks',
    brand: "Lay's",
    country: 'China',
  },
  {
    name: 'Pocky Chocolate',
    category: 'Snacks',
    brand: 'Glico',
    country: 'Taiwan',
  },
  {
    name: 'Pringles Hot & Spicy',
    category: 'Snacks',
    brand: 'Pringles',
    country: 'USA',
  },
  {
    name: 'Tao Kae Noi Seaweed Snack',
    category: 'Snacks',
    brand: 'Tao Kae Noi',
    country: 'Thailand',
  },
  {
    name: 'Kinder Bueno',
    category: 'Chocolate',
    brand: 'Ferrero',
    country: 'Canada',
  },
];

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

export function defaultProductCopy(name: string): {
  description: LocalizedString;
  story: LocalizedString;
  forWhom: LocalizedString;
} {
  return {
    description: new LocalizedString({
      uk: `${name} — смачний імпортний снек. Деталі скоро.`,
      en: `${name} — tasty imported snack. Details coming soon.`,
    }),
    story: new LocalizedString({
      uk: 'Історія продукту з’явиться незабаром.',
      en: 'Product story coming soon.',
    }),
    forWhom: new LocalizedString({
      uk: 'Для тих, хто любить пробувати нове.',
      en: 'For curious snack explorers.',
    }),
  };
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
