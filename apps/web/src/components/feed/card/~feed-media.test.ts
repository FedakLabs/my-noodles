import { describe, expect, it } from 'vitest';

import { toFeedMediaItems } from './feed-media';

describe('toFeedMediaItems', () => {
  it('orders images before videos and applies the product name as alt text', () => {
    const items = toFeedMediaItems({
      name: 'Mochi',
      slug: 'mochi',
      images: ['a.jpg', 'b.jpg'],
      videos: ['c.mp4'],
    });

    expect(items).toEqual([
      { type: 'image', url: 'a.jpg', alt: 'Mochi' },
      { type: 'image', url: 'b.jpg', alt: 'Mochi' },
      { type: 'video', url: 'c.mp4', alt: 'Mochi' },
    ]);
  });

  it('falls back to the slug when the name is missing', () => {
    const [item] = toFeedMediaItems({ name: null, slug: 'mochi', images: ['a.jpg'], videos: [] });

    expect(item?.alt).toBe('mochi');
  });

  it('returns an empty list when there is no media', () => {
    expect(toFeedMediaItems({ name: 'Mochi', slug: 'mochi', images: [], videos: [] })).toEqual([]);
  });
});
