import { createHmac } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { SupportChatProvider, type SupportChatWidgetConfig } from './support-chat.provider';
import { tawkSupportConfig } from './tawk-support.config';

@Injectable()
export class TawkSupportChatProvider extends SupportChatProvider {
  createSessionHash(visitorSessionId: string): string {
    return createHmac('sha256', tawkSupportConfig.apiKey).update(visitorSessionId).digest('hex');
  }

  getWidgetConfig(): SupportChatWidgetConfig {
    return {
      propertyId: tawkSupportConfig.propertyId,
      widgetId: tawkSupportConfig.widgetId,
    };
  }
}
