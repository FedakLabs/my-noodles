/**
 * Ukrainian Cyrillic ↔ Latin (KMU 55:2010 / passport-style ASCII).
 *
 * Encode path adapted from paiv/uklatn (MIT), https://github.com/paiv/uklatn @ v1.22.1
 * Copyright (c) 2024 Pavel Ivashkov
 *
 * Decode is a practical reverse for search (e.g. Nova Poshta Latin queries → Cyrillic).
 */

import { isWordStart, matchCase, UK_VOWELS } from './utils';

/** Word-initial vowel digraphs (Є/Ї/Ю/Я → Ye/Yi/Yu/Ya). */
const UK_TO_LATIN_WORD_INITIAL_VOWEL = new Map([
  ['Є', 'Ye'],
  ['Ї', 'Yi'],
  ['Ю', 'Yu'],
  ['Я', 'Ya'],
]);

/** Word-initial full forms. */
const UK_TO_LATIN_WORD_INITIAL = new Map([
  ['Й', 'Y'],
  ['й', 'y'],
  ['Є', 'YE'],
  ['є', 'ye'],
  ['Ї', 'YI'],
  ['ї', 'yi'],
  ['Ю', 'YU'],
  ['ю', 'yu'],
  ['Я', 'YA'],
  ['я', 'ya'],
]);

/** Mid-word title-case digraphs. */
const UK_TO_LATIN_DIGRAPH = new Map([
  ['ЗГ', 'ZGh'],
  ['зГ', 'zGh'],
  ['Ж', 'Zh'],
  ['Х', 'Kh'],
  ['Ц', 'Ts'],
  ['Щ', 'Shch'],
  ['Ш', 'Sh'],
  ['Ч', 'Ch'],
  ['Є', 'Ie'],
  ['Ї', 'I'],
  ['Ю', 'Iu'],
  ['Я', 'Ia'],
]);

/** Primary Cyrillic → Latin letter map (KMU 55:2010). */
const UK_TO_LATIN = new Map([
  ['ЗГ', 'ZGH'],
  ['Зг', 'Zgh'],
  ['зГ', 'zGH'],
  ['зг', 'zgh'],
  ['А', 'A'],
  ['а', 'a'],
  ['Б', 'B'],
  ['б', 'b'],
  ['В', 'V'],
  ['в', 'v'],
  ['Г', 'H'],
  ['г', 'h'],
  ['Ґ', 'G'],
  ['ґ', 'g'],
  ['Д', 'D'],
  ['д', 'd'],
  ['Е', 'E'],
  ['е', 'e'],
  ['Є', 'IE'],
  ['є', 'ie'],
  ['Ж', 'ZH'],
  ['ж', 'zh'],
  ['З', 'Z'],
  ['з', 'z'],
  ['И', 'Y'],
  ['и', 'y'],
  ['І', 'I'],
  ['і', 'i'],
  ['Ї', 'I'],
  ['ї', 'i'],
  ['Х', 'KH'],
  ['х', 'kh'],
  ['К', 'K'],
  ['к', 'k'],
  ['Л', 'L'],
  ['л', 'l'],
  ['М', 'M'],
  ['м', 'm'],
  ['Н', 'N'],
  ['н', 'n'],
  ['О', 'O'],
  ['о', 'o'],
  ['П', 'P'],
  ['п', 'p'],
  ['Р', 'R'],
  ['р', 'r'],
  ['Щ', 'SHCH'],
  ['щ', 'shch'],
  ['Ш', 'SH'],
  ['ш', 'sh'],
  ['С', 'S'],
  ['с', 's'],
  ['Т', 'T'],
  ['т', 't'],
  ['У', 'U'],
  ['у', 'u'],
  ['Ф', 'F'],
  ['ф', 'f'],
  ['Ч', 'CH'],
  ['ч', 'ch'],
  ['Ц', 'TS'],
  ['ц', 'ts'],
  ['Ю', 'IU'],
  ['ю', 'iu'],
  ['Я', 'IA'],
  ['я', 'ia'],
  ['Й', 'I'],
  ['й', 'i'],
  ['Ь', ''],
  ['ь', ''],
  ['’', ''],
]);

/** Word-initial only (KMU Ye/Yi/Yu/Ya). */
const LATIN_TO_UK_WORD_INITIAL: Array<[string, string]> = [
  ['ye', 'є'],
  ['yi', 'ї'],
  ['yu', 'ю'],
  ['ya', 'я'],
];

/** Longest-first Latin digraphs / letters → Cyrillic. */
const LATIN_TO_UK: Array<[string, string]> = [
  ['shch', 'щ'],
  ['zgh', 'зг'],
  ['zh', 'ж'],
  ['kh', 'х'],
  ['ts', 'ц'],
  ['ch', 'ч'],
  ['sh', 'ш'],
  ['yo', 'йо'],
  ['ie', 'є'],
  ['iu', 'ю'],
  ['ia', 'я'],
  ['a', 'а'],
  ['b', 'б'],
  ['v', 'в'],
  ['h', 'г'],
  ['g', 'ґ'],
  ['d', 'д'],
  ['e', 'е'],
  ['z', 'з'],
  ['y', 'и'],
  ['i', 'і'],
  ['k', 'к'],
  ['l', 'л'],
  ['m', 'м'],
  ['n', 'н'],
  ['o', 'о'],
  ['p', 'п'],
  ['r', 'р'],
  ['s', 'с'],
  ['t', 'т'],
  ['u', 'у'],
  ['f', 'ф'],
  ['j', 'й'],
  ["'", '’'],
];

export function toLatin(text: string): string {
  let normalized = text.normalize('NFC');
  normalized = normalized.replace(/(?<=[ЁЄІЇЎА-яёєіїўҐґ])([’'])(?=[ЁЄІЇЎА-яёєіїўҐґ])/gu, '');

  return normalized
    .replace(
      /(?<=^|[^\p{L}\p{M}\p{N}])([ЄЇЮЯ])(?=\u0301?[а-яёєіїўґ’])|(?<=^|[^\p{L}\p{M}\p{N}])([ЙйЄЇЮЯєїюя])|([Зз]Г|[ЖХЦЩШЧЄЇЮЯ])(?=\u0301?[а-яёєіїўґ’])|([Зз][Гг]|[ЄІЇА-ЩЬЮ-щьюяєіїҐґ’])/gu,
      (
        match,
        g1: string | undefined,
        g2: string | undefined,
        g3: string | undefined,
        g4: string | undefined,
      ) => {
        if (g4 !== undefined) {
          return UK_TO_LATIN.get(g4) ?? match;
        }
        if (g3 !== undefined) {
          return UK_TO_LATIN_DIGRAPH.get(g3) ?? match;
        }
        if (g2 !== undefined) {
          return UK_TO_LATIN_WORD_INITIAL.get(g2) ?? match;
        }
        if (g1 !== undefined) {
          return UK_TO_LATIN_WORD_INITIAL_VOWEL.get(g1) ?? match;
        }
        return match;
      },
    )
    .normalize('NFC');
}

export function toUk(text: string): string {
  const input = text.normalize('NFC');
  let result = '';
  let i = 0;

  while (i < input.length) {
    const rest = input.slice(i);
    const restLower = rest.toLowerCase();
    let matched = false;

    const candidates = isWordStart(result) ? [...LATIN_TO_UK_WORD_INITIAL, ...LATIN_TO_UK] : LATIN_TO_UK;

    for (const [latin, cyr] of candidates) {
      if (!restLower.startsWith(latin)) {
        continue;
      }

      const raw = rest.slice(0, latin.length);
      let mapped = cyr;

      // KMU encodes ї as "i" after vowels (Київ → Kyiv). Prefer ї after a vowel.
      if (latin === 'i' && result.length > 0 && UK_VOWELS.has(result[result.length - 1]!)) {
        mapped = 'ї';
      }

      result += matchCase(raw, mapped);
      i += latin.length;
      matched = true;
      break;
    }

    if (!matched) {
      result += input[i];
      i += 1;
    }
  }

  return result.normalize('NFC');
}
