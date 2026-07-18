const FEED_AVATAR_COLORS = [
  '#E4572E',
  '#F3A712',
  '#3D9970',
  '#2E86AB',
  '#A23B72',
  '#6A4C93',
  '#1B998B',
  '#C73E1D',
];

function hashName(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % 1_000_000;
  }
  return hash;
}

export function feedAvatarColor(name: string): string {
  return FEED_AVATAR_COLORS[hashName(name) % FEED_AVATAR_COLORS.length]!;
}

export function feedAvatarInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0]!.toUpperCase() : '?';
}
