import { z } from 'zod';

const gtmIdSchema = z.string().regex(/^GTM-[A-Z0-9]+$/);
const ga4IdSchema = z.string().regex(/^G-[A-Z0-9]+$/);

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' })
    .transform((url) => url.replace(/\/$/, '')),
  NEXT_PUBLIC_GTM_ID: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .pipe(z.union([z.undefined(), gtmIdSchema])),
  NEXT_PUBLIC_GA4_ID: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .pipe(z.union([z.undefined(), ga4IdSchema])),
});

const env = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
});

export const API_URL = env.NEXT_PUBLIC_API_URL;
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
export const GTM_ID = env.NEXT_PUBLIC_GTM_ID;
export const GA4_ID = env.NEXT_PUBLIC_GA4_ID;
