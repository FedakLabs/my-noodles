const CYRILLIC_LETTER = /\p{Script=Cyrillic}/u;

export function hasCyrillic(text: string): boolean {
  return CYRILLIC_LETTER.test(text);
}
