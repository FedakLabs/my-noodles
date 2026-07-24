import { createHmac } from 'node:crypto';

import { TawkSupportChatProvider } from '@/application/support/providers/tawk-support-chat.provider';

describe('TawkSupportChatProvider', () => {
  it('creates HMAC-SHA256 session hash from visitor id', () => {
    const provider = new TawkSupportChatProvider();
    const visitorSessionId = '33333333-3333-4333-8333-333333333333';

    expect(provider.createSessionHash(visitorSessionId)).toBe(
      createHmac('sha256', 'test-tawk-api-key').update(visitorSessionId).digest('hex'),
    );
  });
});
