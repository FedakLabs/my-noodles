export function formatOrderReceiverName(order: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return [order.lastName, order.firstName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}
