export type SocialShareTarget = 'telegram' | 'facebook' | 'whatsapp' | 'viber';

export function buildSocialShareUrl(target: SocialShareTarget, url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const message = `${text}\n${url}`;

  switch (target) {
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    case 'viber':
      return `viber://forward?text=${encodeURIComponent(message)}`;
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function nativeShare(payload: { title: string; text: string; url: string }): Promise<void> {
  await navigator.share(payload);
}
