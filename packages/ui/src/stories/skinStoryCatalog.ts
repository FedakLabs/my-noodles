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
