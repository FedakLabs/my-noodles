export function safeJsonStringify(value: unknown): string {
  if (value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return typeof value === 'string' ? value : '[unserializable]';
  }
}
