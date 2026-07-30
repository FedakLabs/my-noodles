export type SupportChatWidgetConfig = {
  propertyId: string;
  widgetId: string;
};

export abstract class SupportChatProvider {
  abstract createSessionHash(visitorSessionId: string): string;

  abstract getWidgetConfig(): SupportChatWidgetConfig;
}
