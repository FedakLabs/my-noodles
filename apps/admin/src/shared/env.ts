import { z } from 'zod';

const envSchema = z.object({
  ADMIN_API_URL: z.url({ message: 'ADMIN_API_URL must be a valid URL' }),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  ADMIN_API_URL: import.meta.env.ADMIN_API_URL,
});
