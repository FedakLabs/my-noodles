/** Display order + copy for Storybook — mirrors `typography.ts` variant keys. */
export const typographyVariantOrder = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body1',
  'body2',
  'subtitle1',
  'subtitle2',
  'button',
  'actions',
  'caption',
  'overline',
] as const;

export type StoryTypographyVariant = (typeof typographyVariantOrder)[number];

export const typographySpecimens: Record<StoryTypographyVariant, { sample: string; usage: string }> = {
  h1: { sample: 'Що спробуємо сьогодні?', usage: 'Page title — Unbounded' },
  h2: { sample: 'Колекція TikTok Foods', usage: 'Section header — Unbounded' },
  h3: { sample: 'Категорія солодощів', usage: 'Subsection — Manrope semibold' },
  h4: { sample: 'Фільтри та сортування', usage: 'Group title — Manrope semibold' },
  h5: { sample: 'Популярне зараз', usage: 'Compact heading — Manrope semibold' },
  h6: { sample: 'Деталі доставки', usage: 'Label heading — Manrope semibold' },
  body1: {
    sample: 'Чесний опис смаку, текстура, для кого — основний текст сторінки.',
    usage: 'Body default — Manrope',
  },
  body2: {
    sample: 'Додаткові нотатки, вторинний текст, підписи під картками.',
    usage: 'Body compact — Manrope',
  },
  subtitle1: {
    sample: 'Рamen Buldak Cheese — 2 рядки max на картці',
    usage: 'Product card title — Manrope semibold',
  },
  subtitle2: {
    sample: '249 ₴ · Корея',
    usage: 'Meta line — Manrope semibold',
  },
  button: { sample: 'Додати в кошик', usage: 'Button label style — Manrope semibold' },
  actions: { sample: 'Показати 12 товарів', usage: 'Custom actions variant — Manrope semibold' },
  caption: { sample: 'Алергени: глютен, соя', usage: 'Fine print — Manrope' },
  overline: { sample: 'Спробували ми', usage: 'Eyebrow label — Manrope semibold' },
};

export const colorGroupOrder = ['text', 'icon', 'surface', 'border', 'buttonFill'] as const;

export const colorTokenOrder: Record<(typeof colorGroupOrder)[number], readonly string[]> = {
  text: ['primary', 'secondary', 'disabled', 'inverse'],
  icon: ['primary', 'secondary', 'accent'],
  surface: ['page', 'card', 'elevated', 'bgHueBrand'],
  border: ['subtle', 'strong', 'focus'],
  buttonFill: ['primary', 'primaryHover', 'secondary', 'disabled'],
};

export const borderRadiusOrder = ['none', 'utility', 'discovery', 'sheet', 'pill'] as const;

export const spacingScaleOrder = ['xs', 'sm', 'md', 'lg'] as const;

export const modalWidthOrder = ['sm', 'md', 'lg', 'xl'] as const;

export const countrySkinOrder = ['CN', 'KR', 'TH', 'US', 'CA', 'TW'] as const;

export const brandSkinOrder = ['BULDAK', 'POCKY', 'PRINGLES'] as const;

export const categorySkinOrder = ['NOODLES', 'SWEETS', 'DRINKS'] as const;

export type StoryCountrySkin = (typeof countrySkinOrder)[number];
export type StoryBrandSkin = (typeof brandSkinOrder)[number];
export type StoryCategorySkin = (typeof categorySkinOrder)[number];

export const countrySkinMeta: Record<
  StoryCountrySkin,
  { label: string; mood: string; sampleTitle: string; sampleMeta: string }
> = {
  CN: {
    label: 'China',
    mood: 'Lunar warmth, tea-house',
    sampleTitle: 'Latiao Classic',
    sampleMeta: '249 ₴ · CN',
  },
  KR: {
    label: 'South Korea',
    mood: 'K-pop clean neon pop',
    sampleTitle: 'Buldak Cheese',
    sampleMeta: '249 ₴ · KR',
  },
  TH: {
    label: 'Thailand',
    mood: 'Tropical fruit, temple',
    sampleTitle: 'Tom Yum Chips',
    sampleMeta: '189 ₴ · TH',
  },
  US: {
    label: 'United States',
    mood: 'Diner retro, bold pack',
    sampleTitle: 'Cheetos Flamin',
    sampleMeta: '159 ₴ · US',
  },
  CA: {
    label: 'Canada',
    mood: 'Maple cozy, outdoors',
    sampleTitle: 'Ketchup Chips',
    sampleMeta: '139 ₴ · CA',
  },
  TW: {
    label: 'Taiwan',
    mood: 'Night market, bubble tea',
    sampleTitle: 'Bubble Tea Mochi',
    sampleMeta: '199 ₴ · TW',
  },
};

export const brandSkinMeta: Record<
  StoryBrandSkin,
  { label: string; mood: string; sampleTitle: string; sampleMeta: string }
> = {
  BULDAK: {
    label: 'Samyang Buldak',
    mood: 'Fire ramen, heat-forward',
    sampleTitle: 'Buldak Carbonara',
    sampleMeta: '249 ₴ · brand skin',
  },
  POCKY: {
    label: 'Glico Pocky',
    mood: 'Sweet stick, playful pink',
    sampleTitle: 'Pocky Strawberry',
    sampleMeta: '89 ₴ · brand skin',
  },
  PRINGLES: {
    label: 'Pringles',
    mood: 'Classic crunch, golden bold',
    sampleTitle: 'Pringles Original',
    sampleMeta: '119 ₴ · brand skin',
  },
};

export const categorySkinMeta: Record<
  StoryCategorySkin,
  { label: string; mood: string; sampleTitle: string; sampleMeta: string }
> = {
  NOODLES: {
    label: 'Noodles',
    mood: 'Broth warmth, comfort bowl',
    sampleTitle: 'Instant Ramen Cup',
    sampleMeta: 'category · NOODLES',
  },
  SWEETS: {
    label: 'Sweets',
    mood: 'Candy shelf, treat-yourself',
    sampleTitle: 'Mochi Assortment',
    sampleMeta: 'category · SWEETS',
  },
  DRINKS: {
    label: 'Drinks',
    mood: 'Refreshing, bright pour',
    sampleTitle: 'Matcha Latte Can',
    sampleMeta: 'category · DRINKS',
  },
};
