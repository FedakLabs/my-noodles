import { describe, expect, it } from 'vitest';

import { buildSocialShareUrl } from './social-share';

describe('buildSocialShareUrl', () => {
  const url = 'https://example.com/uk/product/mochi';
  const text = 'Check out Mochi!';

  it('builds Telegram share URL', () => {
    expect(buildSocialShareUrl('telegram', url, text)).toBe(
      'https://t.me/share/url?url=https%3A%2F%2Fexample.com%2Fuk%2Fproduct%2Fmochi&text=Check%20out%20Mochi!',
    );
  });

  it('builds Facebook share URL', () => {
    expect(buildSocialShareUrl('facebook', url, text)).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fuk%2Fproduct%2Fmochi',
    );
  });

  it('builds WhatsApp share URL', () => {
    expect(buildSocialShareUrl('whatsapp', url, text)).toContain('https://wa.me/?text=');
    expect(buildSocialShareUrl('whatsapp', url, text)).toContain(encodeURIComponent(`${text}\n${url}`));
  });

  it('builds Viber share URL', () => {
    expect(buildSocialShareUrl('viber', url, text)).toBe(
      `viber://forward?text=${encodeURIComponent(`${text}\n${url}`)}`,
    );
  });
});
