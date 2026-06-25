import { describe, expect, it } from 'vitest';

import { feedAvatarColor, feedAvatarInitial } from './feed-avatar';

describe('feedAvatarColor', () => {
  it('is deterministic for the same name', () => {
    expect(feedAvatarColor('Olena')).toBe(feedAvatarColor('Olena'));
  });

  it('always returns a hex colour from the palette', () => {
    for (const name of ['Olena', 'Andrii', 'Maria', '🍜', '']) {
      expect(feedAvatarColor(name)).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('feedAvatarInitial', () => {
  it('uppercases the first character', () => {
    expect(feedAvatarInitial('olena')).toBe('O');
  });

  it('trims surrounding whitespace', () => {
    expect(feedAvatarInitial('  andrii')).toBe('A');
  });

  it('falls back to a placeholder for empty names', () => {
    expect(feedAvatarInitial('   ')).toBe('?');
    expect(feedAvatarInitial('')).toBe('?');
  });
});
