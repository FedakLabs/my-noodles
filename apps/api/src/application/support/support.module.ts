import { Module } from '@nestjs/common';

import { VisitorSessionModule } from '../visitor-session';
import { SupportChatProvider } from './providers/support-chat.provider';
import { TawkSupportChatProvider } from './providers/tawk-support-chat.provider';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [VisitorSessionModule],
  controllers: [SupportController],
  providers: [SupportService, { provide: SupportChatProvider, useClass: TawkSupportChatProvider }],
})
export class SupportModule {}
