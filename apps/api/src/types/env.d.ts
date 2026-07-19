declare namespace NodeJS {
  interface ProcessEnv {
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    NOVA_POSHTA_API_KEY?: string;
    NOVA_POSHTA_API_BASE_URL?: string;
    MEEST_API_BASE_URL?: string;
    UKRPOSHTA_API_BASE_URL?: string;
  }
}
