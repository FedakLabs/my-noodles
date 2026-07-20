/**
 * Bulgarian Cyrillic ↔ Latin (Streamlined System / Transliteration Act 2009).
 * Template locale showing how to add another Cyrillic language alongside `uk`.
 */

import { isLetter, matchCase } from './utils';

/** Primary Cyrillic → Latin letter map. */
const BG_TO_LATIN: Record<string, string> = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Е: 'E',
  е: 'e',
  Ж: 'Zh',
  ж: 'zh',
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Й: 'Y',
  й: 'y',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'H',
  х: 'h',
  Ц: 'Ts',
  ц: 'ts',
  Ч: 'Ch',
  ч: 'ch',
  Ш: 'Sh',
  ш: 'sh',
  Щ: 'Sht',
  щ: 'sht',
  Ъ: 'A',
  ъ: 'a',
  Ь: 'Y',
  ь: 'y',
  Ю: 'Yu',
  ю: 'yu',
  Я: 'Ya',
  я: 'ya',
};

/** Longest-first Latin digraphs / letters → Cyrillic. */
const LATIN_TO_BG: Array<[string, string]> = [
  ['sht', 'щ'],
  ['zh', 'ж'],
  ['ts', 'ц'],
  ['ch', 'ч'],
  ['sh', 'ш'],
  ['yu', 'ю'],
  ['ya', 'я'],
  ['a', 'а'],
  ['b', 'б'],
  ['v', 'в'],
  ['g', 'г'],
  ['d', 'д'],
  ['e', 'е'],
  ['z', 'з'],
  ['i', 'и'],
  ['y', 'й'],
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
  ['h', 'х'],
];

export function toLatin(text: string): string {
  const normalized = text.normalize('NFC');
  // Official exception: word-final "ия" → "ia"
  const withIa = normalized.replace(/ия(?=$|[^\p{L}])/gu, 'ia').replace(/ИЯ(?=$|[^\p{L}])/gu, 'IA');

  let result = '';
  for (const char of withIa) {
    result += BG_TO_LATIN[char] ?? char;
  }
  return result;
}

export function toBg(text: string): string {
  const input = text.normalize('NFC');
  let result = '';
  let i = 0;

  while (i < input.length) {
    const rest = input.slice(i);
    const restLower = rest.toLowerCase();

    // Reverse of final "ия" → "ia"
    if (restLower.startsWith('ia') && !isLetter(input[i + 2])) {
      result += matchCase(rest.slice(0, 2), 'ия');
      i += 2;
      continue;
    }

    let matched = false;
    for (const [latin, cyr] of LATIN_TO_BG) {
      if (!restLower.startsWith(latin)) {
        continue;
      }
      const raw = rest.slice(0, latin.length);
      result += matchCase(raw, cyr);
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
