import { describe, expect, it } from '@jest/globals';

import { bgToLatin, latinToBg } from './bg';
import { hasCyrillic } from './cyrillic';
import { hasLatin } from './latin';
import { latinToUk, ukToLatin } from './uk';

describe('hasLatin / hasCyrillic', () => {
  it('detects latin letters and ignores digits', () => {
    expect(hasLatin('Kyiv')).toBe(true);
    expect(hasLatin('Київ')).toBe(false);
    expect(hasLatin('42')).toBe(false);
    expect(hasLatin('№1')).toBe(false);
  });

  it('detects cyrillic letters', () => {
    expect(hasCyrillic('Київ')).toBe(true);
    expect(hasCyrillic('Kyiv')).toBe(false);
    expect(hasCyrillic('42')).toBe(false);
  });
});

describe('ukrainian', () => {
  it('round-trips Kyiv', () => {
    expect(ukToLatin('Київ')).toBe('Kyiv');
    expect(latinToUk('Kyiv')).toBe('Київ');
  });

  it('handles Kharkiv and digraphs', () => {
    expect(ukToLatin('Харків')).toBe('Kharkiv');
    expect(latinToUk('Kharkiv')).toBe('Харків');
  });

  it('handles Odesa and Lviv', () => {
    expect(ukToLatin('Одеса')).toBe('Odesa');
    expect(latinToUk('Odesa')).toBe('Одеса');
    expect(ukToLatin('Львів')).toBe('Lviv');
    expect(latinToUk('Lviv')).toBe('Лвів');
  });
});

describe('bulgarian', () => {
  it('round-trips Sofia via final ия→ia', () => {
    expect(bgToLatin('София')).toBe('Sofia');
    expect(latinToBg('Sofia')).toBe('София');
  });

  it('handles digraphs', () => {
    expect(bgToLatin('Щастие')).toBe('Shtastie');
    expect(latinToBg('Shtastie')).toBe('Щастие');
  });
});
