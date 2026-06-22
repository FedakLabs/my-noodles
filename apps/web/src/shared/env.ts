import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
  NEXT_PUBLIC_SITE_URL: z.url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' }),
});

const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL } = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const API_URL = NEXT_PUBLIC_API_URL;

export const SITE_URL = NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
