import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url({ message: 'VITE_API_URL must be a valid URL' }),
  VITE_AUTH_API_URL: z.url({ message: 'VITE_AUTH_API_URL must be a valid URL' }),
  VITE_SENTRY_DSN: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .pipe(z.union([z.undefined(), z.url({ message: 'VITE_SENTRY_DSN must be a valid URL' })])),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
});
