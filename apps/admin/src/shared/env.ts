import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url({ message: 'VITE_API_URL must be a valid URL' }),
  VITE_AUTH_API_URL: z.url({ message: 'VITE_AUTH_API_URL must be a valid URL' }),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL,
});
