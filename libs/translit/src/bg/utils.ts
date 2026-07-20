export function matchCase(source: string, mapped: string): string {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return mapped.toUpperCase();
  }
  if (source[0] === source[0]?.toUpperCase() && source.slice(1) === source.slice(1).toLowerCase()) {
    return mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }
  return mapped;
}

export function isLetter(char: string | undefined): boolean {
  return Boolean(char && /\p{L}/u.test(char));
}
