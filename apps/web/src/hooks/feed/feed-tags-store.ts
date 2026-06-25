import type { FeedFiltersDto } from '@my-noodles/api-clients/storefront';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORE_VERSION = 1;

/** Filter dimensions, identical to the catalog + the `FeedFiltersDto` wire shape. */
export type FeedTagDimension = 'category' | 'country' | 'brand';

/** Canonical grouped filters — persisted as-is and sent directly on `POST /feed/next`. */
export type FeedFilters = Required<Pick<FeedFiltersDto, FeedTagDimension>>;

/** Flat "hashtag" view of the grouped filters — one chip per dimension value. */
export type FeedTagChip = {
  type: FeedTagDimension;
  value: string;
};

type FeedTagsState = {
  filters: FeedFilters;
  /** Display labels captured at add-time (e.g. localized names), keyed `type:value`. Not persisted. */
  labels: Record<string, string>;
  addTag: (type: FeedTagDimension, value: string, label?: string) => void;
  removeTag: (type: FeedTagDimension, value: string) => void;
  clear: () => void;
};

function emptyFilters(): FeedFilters {
  return { category: [], country: [], brand: [] };
}

function tagKey(type: FeedTagDimension, value: string): string {
  return `${type}:${value}`;
}

export const useFeedTagsStore = create<FeedTagsState>()(
  persist(
    (set) => ({
      filters: emptyFilters(),
      labels: {},
      addTag: (type, value, label) =>
        set((state) => {
          const labels = label ? { ...state.labels, [tagKey(type, value)]: label } : state.labels;

          if (state.filters[type].includes(value)) {
            return { labels };
          }

          return { filters: { ...state.filters, [type]: [...state.filters[type], value] }, labels };
        }),
      removeTag: (type, value) =>
        set((state) => {
          const key = tagKey(type, value);
          const { [key]: _removed, ...labels } = state.labels;

          return {
            filters: { ...state.filters, [type]: state.filters[type].filter((entry) => entry !== value) },
            labels,
          };
        }),
      clear: () => set({ filters: emptyFilters(), labels: {} }),
    }),
    {
      name: 'my-noodles-feed-tags',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      migrate: () => ({ filters: emptyFilters() }),
      partialize: (state) => ({ filters: state.filters }),
    },
  ),
);

/** Resolve a chip's display label: captured label, else a humanized slug. */
export function feedTagLabel(labels: Record<string, string>, chip: FeedTagChip): string {
  return labels[tagKey(chip.type, chip.value)] ?? chip.value.replace(/-/g, ' ');
}

const TAG_DIMENSIONS: FeedTagDimension[] = ['category', 'country', 'brand'];

/** Derive the flat chips view for rendering — each chip maps back to a `removeTag(type, value)`. */
export function flattenFeedTags(filters: FeedFilters): FeedTagChip[] {
  return TAG_DIMENSIONS.flatMap((type) => filters[type].map((value) => ({ type, value })));
}

export function countFeedTags(filters: FeedFilters): number {
  return TAG_DIMENSIONS.reduce((total, type) => total + filters[type].length, 0);
}
