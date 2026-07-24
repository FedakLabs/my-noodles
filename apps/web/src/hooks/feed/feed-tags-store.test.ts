import { beforeEach, describe, expect, it } from 'vitest';

import { countFeedTags, feedTagLabel, flattenFeedTags, useFeedTagsStore } from './feed-tags-store';

describe('useFeedTagsStore', () => {
  beforeEach(() => {
    useFeedTagsStore.setState({
      filters: { category: [], country: [], brand: [], seller: [] },
      labels: {},
    });
  });

  it('adds a value to its dimension and captures the label', () => {
    useFeedTagsStore.getState().addTag('category', 'snacks', 'Snacks');

    const { filters, labels } = useFeedTagsStore.getState();
    expect(filters.category).toEqual(['snacks']);
    expect(labels['category:snacks']).toBe('Snacks');
  });

  it('does not add duplicate values', () => {
    const { addTag } = useFeedTagsStore.getState();
    addTag('country', 'japan');
    addTag('country', 'japan');

    expect(useFeedTagsStore.getState().filters.country).toEqual(['japan']);
  });

  it('removes a value from its dimension', () => {
    const { addTag, removeTag } = useFeedTagsStore.getState();
    addTag('brand', 'glico', 'Glico');
    addTag('brand', 'lotte');
    removeTag('brand', 'glico');

    expect(useFeedTagsStore.getState().filters.brand).toEqual(['lotte']);
  });

  it('drops the captured label when a tag is removed', () => {
    const { addTag, removeTag } = useFeedTagsStore.getState();
    addTag('category', 'snacks', 'Snacks');
    removeTag('category', 'snacks');

    expect(useFeedTagsStore.getState().labels).toEqual({});
  });

  it('clears all filters', () => {
    const { addTag, clear } = useFeedTagsStore.getState();
    addTag('category', 'snacks');
    addTag('country', 'japan');
    clear();

    expect(countFeedTags(useFeedTagsStore.getState().filters)).toBe(0);
  });
});

describe('flattenFeedTags', () => {
  it('produces one chip per dimension value, grouped by dimension order', () => {
    const chips = flattenFeedTags({
      category: ['snacks'],
      country: ['japan', 'korea'],
      brand: [],
      seller: [],
    });

    expect(chips).toEqual([
      { type: 'category', value: 'snacks' },
      { type: 'country', value: 'japan' },
      { type: 'country', value: 'korea' },
    ]);
  });
});

describe('feedTagLabel', () => {
  it('prefers a captured label', () => {
    expect(feedTagLabel({ 'category:snacks': 'Snacks' }, { type: 'category', value: 'snacks' })).toBe(
      'Snacks',
    );
  });

  it('humanizes the slug when no label was captured', () => {
    expect(feedTagLabel({}, { type: 'brand', value: 'meiji-choco' })).toBe('meiji choco');
  });
});
