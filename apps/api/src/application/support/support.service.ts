import { Inject, Injectable } from '@nestjs/common';

import type { VisitorSession } from '../visitor-session';
import { SupportChatProvider } from './providers/support-chat.provider';
import type { SupportSessionResponseDto } from './support.dto';

@Injectable()
export class SupportService {
  constructor(@Inject(SupportChatProvider) private readonly supportChatProvider: SupportChatProvider) {}

  openSession(visitor: VisitorSession): SupportSessionResponseDto {
    const visitorSessionId = visitor.id;
    const sessionHash = this.supportChatProvider.createSessionHash(visitorSessionId);

    return { visitorSessionId, sessionHash };
  }
}
