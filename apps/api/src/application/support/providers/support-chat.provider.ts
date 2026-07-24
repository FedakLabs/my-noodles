export abstract class SupportChatProvider {
  abstract createSessionHash(visitorSessionId: string): string;
}
