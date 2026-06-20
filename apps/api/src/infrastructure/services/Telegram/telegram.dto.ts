export type OrderTelegramLine = {
  title: string;
  qty: number;
  lineTotalMinor: number;
};

export type OrderTelegramPayload = {
  orderId: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  deliverySummary: string;
  currency: string;
  totalMinor: number;
  lines: OrderTelegramLine[];
};
