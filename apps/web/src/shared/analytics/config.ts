import { env } from '@/shared/env';

export const ANALYTICS_ENABLED = env.NEXT_PUBLIC_GTM_ID !== undefined;

export const GA4_MEASUREMENT_ID = env.NEXT_PUBLIC_GA4_ID;
