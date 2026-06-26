'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreateOrder } from '@/api/orders';
import { useAnalyticsActions } from '@/hooks/analytics';
import { useCartActions, useCartItems } from '@/hooks/cart';
import { usePendingRouter } from '@/hooks/smooth';
import { cartLineToGa4Item } from '@/shared/analytics';
import { testIds } from '@/tests/test-ids';

import { branchToWarehouseNumber, type CheckoutFormData, checkoutSchema } from './validation';

export function CheckoutForm() {
  const t = useTranslations('checkout');
  const router = usePendingRouter();
  const items = useCartItems();
  const { clear } = useCartActions();
  const { trackPurchase } = useAnalyticsActions();
  const { createOrderAsync, createOrderIsPending, createOrderIsError } = useCreateOrder();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      city: '',
      branch: '',
      company: '',
    },
  });

  const submitOrder = (data: CheckoutFormData) => {
    if (items.length === 0) {
      return;
    }

    void createOrderAsync({
      customerName: data.customerName,
      phone: data.phone,
      company: data.company,
      delivery: {
        provider: DeliveryProvider.NOVA_POSHTA,
        method: DeliveryMethod.WAREHOUSE,
        city: data.city,
        warehouseNumber: branchToWarehouseNumber(data.branch),
        warehouseName: data.branch,
      },
      items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
    }).then((order) => {
      trackPurchase({
        transactionId: order.id,
        valueMinor: order.totalMinor,
        currency: order.currency,
        items: items.map((item) => cartLineToGa4Item(item)),
      });
      clear();
      router.push('/checkout/success');
    });
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={(event) => {
        void form.handleSubmit(submitOrder)(event);
      }}
    >
      {createOrderIsError ? <Alert severity="error">{t('error')}</Alert> : null}

      <Controller
        name="customerName"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label={t('fields.name')}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label={t('fields.phone')}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="city"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label={t('fields.city')}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="branch"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label={t('fields.branch')}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />

      <TextField
        {...form.register('company')}
        label={t('fields.company')}
        sx={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      <Button
        type="submit"
        variant="contained"
        data-testid={testIds.checkout.submit}
        disabled={createOrderIsPending || items.length === 0}
      >
        {t('submit')}
      </Button>
    </Stack>
  );
}
