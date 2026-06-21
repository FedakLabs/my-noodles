import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  city: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  company: z.string().max(0).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function branchToWarehouseNumber(branch: string): string {
  const match = branch.match(/\d+/);
  return match?.[0] ?? '1';
}
