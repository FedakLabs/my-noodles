'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useOrder } from '@/api/orders';
import { PageContainer } from '@/components/layout/page-container';
import { OrderDetails } from '@/components/order/order-details';

type OrderScreenProps = {
  orderId: string;
};

export function OrderScreen({ orderId }: OrderScreenProps) {
  const t = useTranslations('order');
  const { order, orderIsInitialLoad, orderError } = useOrder(orderId);

  let content;

  if (orderIsInitialLoad) {
    content = (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} aria-hidden />
        <Typography color="text.secondary">{t('loading')}</Typography>
      </Stack>
    );
  } else if (orderError) {
    content = <Typography color="error">{t('error')}</Typography>;
  } else if (!order) {
    content = <Typography color="text.secondary">{t('empty')}</Typography>;
  } else {
    content = <OrderDetails order={order} />;
  }

  return (
    <PageContainer>
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: { mobile: 480, desktop: 640 },
          mx: 'auto',
        }}
      >
        {content}
      </Stack>
    </PageContainer>
  );
}
