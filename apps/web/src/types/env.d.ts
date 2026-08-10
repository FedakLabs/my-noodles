declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_GTM_ID?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    NEXT_PUBLIC_APP_VERSION?: string;
  }
}
