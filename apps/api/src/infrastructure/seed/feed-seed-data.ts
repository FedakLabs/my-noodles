import type { LocalizedStringData } from '@my-noodles/locale';

const FEED_COMMENT_AUTHORS = [
  'Оля',
  'Андрій',
  'Sofia',
  'Темур',
  'Nina',
  'Карина',
  'Lee',
  'Богдан',
  'Daria',
  'Марко',
  'Yuki',
  'Іра',
] as const;

const FEED_COMMENT_TEMPLATES: readonly LocalizedStringData[] = [
  {
    uk: 'Перший укус — і одразу хочеться ще. Смак яскравий, але не набридає.',
    en: 'One bite and I wanted more. Bright flavor that never gets old.',
  },
  {
    uk: 'Текстура просто космос: хрустить саме так, як треба.',
    en: 'The texture is unreal — it crunches exactly the way it should.',
  },
  {
    uk: 'Брали на вечір кіно, зникло за пів години. Винні всі.',
    en: 'Grabbed it for movie night, gone in half an hour. Everyone is to blame.',
  },
  {
    uk: 'Несподівано збалансований смак — солодке й солоне в ідеальній парі.',
    en: 'Surprisingly balanced — sweet and salty in perfect harmony.',
  },
  {
    uk: 'Те відчуття, коли пробуєш щось нове й думаєш: де ти був усе життя?',
    en: 'That feeling when you try something new and think: where have you been all my life?',
  },
  {
    uk: 'Аромат відчувається ще до того, як відкрив пачку. Дуже апетитно.',
    en: 'You catch the aroma before the pack is even open. So appetizing.',
  },
  {
    uk: 'Ідеально під чай. Маленький ритуал затишку на кожен день.',
    en: 'Perfect with tea. A tiny daily ritual of comfort.',
  },
  {
    uk: 'Гострота приємна, не вибиває — саме та межа, коли смачно.',
    en: 'The heat is pleasant, not overwhelming — right at the tasty edge.',
  },
  {
    uk: 'Поділилася з колегами — тепер усі питають, де купити.',
    en: 'Shared it with coworkers — now everyone asks where to buy it.',
  },
  {
    uk: 'Виглядає скромно, а смак запамʼятовується надовго.',
    en: 'Looks modest, but the taste stays with you for a long time.',
  },
];

const COMMENTS_PER_PRODUCT = 3;

function hashText(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash + char.charCodeAt(0)) % 1_000_000;
  }
  return hash;
}

export type FeedCommentSeed = {
  authorName: string;
  comment: LocalizedStringData;
};

/** Deterministically pick a few distinct comments + authors for a product (stable across re-seeds). */
export function buildFeedCommentSeeds(productKey: string): FeedCommentSeed[] {
  const base = hashText(productKey);
  const seeds: FeedCommentSeed[] = [];

  for (let offset = 0; offset < COMMENTS_PER_PRODUCT; offset += 1) {
    const comment = FEED_COMMENT_TEMPLATES[(base + offset * 3) % FEED_COMMENT_TEMPLATES.length]!;
    const authorName = FEED_COMMENT_AUTHORS[(base + offset * 5) % FEED_COMMENT_AUTHORS.length]!;
    seeds.push({ authorName, comment });
  }

  return seeds;
}
