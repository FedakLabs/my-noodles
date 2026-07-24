import { SupportService } from '@/application/support';
import type { SupportChatProvider } from '@/application/support/providers/support-chat.provider';
import type { VisitorSession } from '@/application/visitor-session';

import { jest } from '../jest-globals';

describe('SupportService', () => {
  it('returns visitor id and session hash', () => {
    const createSessionHash = jest.fn().mockReturnValue('session-hash');
    const service = new SupportService({ createSessionHash } as unknown as SupportChatProvider);

    const visitorSessionId = '33333333-3333-4333-8333-333333333333';
    const result = service.openSession({ id: visitorSessionId } as VisitorSession);

    expect(createSessionHash).toHaveBeenCalledWith(visitorSessionId);
    expect(result).toEqual({ visitorSessionId, sessionHash: 'session-hash' });
  });
});
