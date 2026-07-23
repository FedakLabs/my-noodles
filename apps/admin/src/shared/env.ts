import { z } from 'zod';

const envSchema = z.object({
  ADMIN_API_URL: z.url({ message: 'ADMIN_API_URL must be a valid URL' }),
  /** Optional; defaults to ADMIN_API_URL. Set separately when auth is a distinct service. */
  AUTH_API_URL: z.url({ message: 'AUTH_API_URL must be a valid URL' }).optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  ADMIN_API_URL: import.meta.env.ADMIN_API_URL,
  AUTH_API_URL: import.meta.env.AUTH_API_URL || undefined,
});
