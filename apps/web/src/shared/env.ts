import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
});

const { NEXT_PUBLIC_API_URL: API_URL } = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

export { API_URL };
