import { TelegramClient } from '@/infrastructure/services/Telegram';

import { jest } from '../jest-globals';

describe('TelegramClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('skips sending when Telegram is not configured', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    const client = new TelegramClient({ botToken: '', chatId: '' });
    await client.sendOrderNotification({
      orderId: 'order-1',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      customerName: 'Andrii',
      phone: '+380501112233',
      deliverySummary: 'Нова Пошта (відділення)\nКиїв',
      currency: 'UAH',
      totalMinor: 9_900,
      lines: [{ title: 'Pocky', qty: 1, lineTotalMinor: 9_900 }],
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends HTML payload when configured', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') });
    global.fetch = fetchMock;

    const client = new TelegramClient({ botToken: 'token', chatId: 'chat' });
    await client.sendOrderNotification({
      orderId: 'order-1',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      customerName: 'Andrii',
      phone: '+380501112233',
      deliverySummary: 'Нова Пошта (відділення)\nКиїв',
      currency: 'UAH',
      totalMinor: 9_900,
      lines: [{ title: 'Pocky', qty: 1, lineTotalMinor: 9_900 }],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bottoken/sendMessage',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
