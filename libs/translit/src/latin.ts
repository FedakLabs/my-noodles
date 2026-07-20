const LATIN_LETTER = /[A-Za-z]/;

export function hasLatin(text: string): boolean {
  return LATIN_LETTER.test(text);
}
