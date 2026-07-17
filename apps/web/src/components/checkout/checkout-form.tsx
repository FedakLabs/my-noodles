'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';
import { PhoneInput } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import type { CheckoutDetailDto } from '@/api/checkouts';
import { useSubmitCheckout, useUpdateCheckoutDelivery, useUpdateCheckoutReceiver } from '@/api/checkouts';
import { CheckoutCancelledState } from '@/components/checkout/checkout-cancelled-state';
import { CheckoutDeliveryFields } from '@/components/checkout/checkout-delivery-fields';
import { CheckoutFormSection } from '@/components/checkout/checkout-form-section';
import { checkoutToFormValues, formValuesToSubmitCheckout } from '@/components/checkout/checkout-form-values';
import { CheckoutHoldTimer } from '@/components/checkout/checkout-hold-timer';
import { CheckoutOrderCard } from '@/components/checkout/checkout-order-card';
import { CheckoutOrderItemsList } from '@/components/checkout/checkout-order-items-list';
import { CheckoutOrderSidebar } from '@/components/checkout/checkout-order-sidebar';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { useAnalyticsActions } from '@/hooks/analytics';
import { useCheckoutSessionState } from '@/hooks/checkout';
import { useViewport } from '@/hooks/layout';
import { usePendingRouter } from '@/hooks/smooth';
import { cartLineToGa4Item } from '@/shared/analytics';

import {
  type CheckoutFormData,
  type CheckoutReceiverField,
  createCheckoutSchemas,
  isCheckoutFormValid,
  isCheckoutReceiverComplete,
  toValidDeliveryPatch,
  toValidReceiverFieldPatch,
} from './validation';

type CheckoutFormProps = {
  checkoutId: string;
  checkout: CheckoutDetailDto;
  onHoldExpired: () => void;
};

function isCheckoutFieldTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.closest('[data-testid="checkout-submit"]')) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, select, [role="combobox"], .MuiInputBase-root, .MuiSelect-select, .MuiAutocomplete-root',
    ),
  );
}

export function CheckoutForm({ checkoutId, checkout, onHoldExpired }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const tItems = useTranslations('checkout.items');
  const { isDesktop } = useViewport();
  const router = usePendingRouter();
  const { updateCheckoutReceiver, updateCheckoutReceiverIsPending } = useUpdateCheckoutReceiver(checkoutId);
  const { updateCheckoutDelivery, updateCheckoutDeliveryIsPending } = useUpdateCheckoutDelivery(checkoutId);
  const { submitCheckout, submitCheckoutIsPending, submitCheckoutIsError, submitCheckoutError } =
    useSubmitCheckout(checkoutId);
  const session = useCheckoutSessionState({
    checkoutId,
    error: submitCheckoutIsError ? submitCheckoutError : undefined,
  });
  const { trackPurchase } = useAnalyticsActions();
  const [isFieldFocused, setIsFieldFocused] = useState(false);

  const { receiverSchema, deliverySchema, checkoutSchema } = useMemo(() => createCheckoutSchemas(), []);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      method: DeliveryMethod.WAREHOUSE,
      provider: DeliveryProvider.NOVA_POSHTA,
      cityName: '',
      cityRef: '',
      warehouseRef: '',
      warehouseName: '',
      warehouseNumber: '',
      street: '',
      building: '',
      apartment: '',
      notes: '',
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const firstName = useWatch({ control: form.control, name: 'firstName' });
  const lastName = useWatch({ control: form.control, name: 'lastName' });
  const phone = useWatch({ control: form.control, name: 'phone' });
  const canSubmitForm = useMemo(
    () => isCheckoutFormValid(watchedValues as CheckoutFormData, checkoutSchema),
    [checkoutSchema, watchedValues],
  );
  const receiverComplete = isCheckoutReceiverComplete({ firstName, lastName, phone }, receiverSchema);
  const hydratedCheckoutIdRef = useRef<string | null>(null);

  const isAutosaving = updateCheckoutReceiverIsPending || updateCheckoutDeliveryIsPending;
  const isSubmitBusy = isAutosaving || submitCheckoutIsPending;
  const canSubmit = canSubmitForm && !isFieldFocused && !isSubmitBusy && checkout.items.length > 0;

  useEffect(() => {
    if (hydratedCheckoutIdRef.current === checkoutId) {
      return;
    }

    hydratedCheckoutIdRef.current = checkoutId;
    form.reset(checkoutToFormValues(checkout));
    void form.trigger();
  }, [checkoutId, checkout, form]);

  const syncFieldFocus = () => {
    setIsFieldFocused(isCheckoutFieldTarget(document.activeElement));
  };

  const autosaveReceiverField = (field: CheckoutReceiverField) => {
    const values = form.getValues();
    const patch = toValidReceiverFieldPatch(field, values, receiverSchema);

    if (!patch) {
      return;
    }

    updateCheckoutReceiver(patch);
  };

  const autosaveDelivery = (override?: Partial<CheckoutFormData>) => {
    const values = { ...form.getValues(), ...override };
    const patch = toValidDeliveryPatch(values, deliverySchema);

    if (!patch) {
      return;
    }

    updateCheckoutDelivery(patch);
  };

  const submitOrder = (data: CheckoutFormData) => {
    if (!canSubmit) {
      return;
    }

    submitCheckout(formValuesToSubmitCheckout(data), {
      onSuccess: (order) => {
        trackPurchase({
          transactionId: order.id,
          valueMinor: order.totalMinor,
          currency: order.currency,
          items: checkout.items.map((item) =>
            cartLineToGa4Item({
              slug: item.productId,
              title: item.title,
              priceMinor: item.priceMinor,
              qty: item.qty,
            }),
          ),
        });
        router.push('/checkout/success');
      },
    });
  };

  const onSubmit = form.handleSubmit(submitOrder);

  if (session.isExpired) {
    return <CheckoutCancelledState title={t('inactive.title')} description={session.expiredDescription} />;
  }

  if (session.isNotInProgress) {
    return <Alert severity="error">{session.submitErrorMessage}</Alert>;
  }

  const submitButton = (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      data-testid="checkout-submit"
      disabled={!canSubmit}
      aria-busy={isSubmitBusy}
      startIcon={isSubmitBusy ? <CircularProgress size={22} color="inherit" aria-hidden /> : undefined}
    >
      {t('submit')}
    </Button>
  );

  const formFields = (
    <Stack spacing={3}>
      {session.showSubmitErrorAlert ? <Alert severity="error">{session.submitErrorMessage}</Alert> : null}

      <CheckoutFormSection step={1} title={t('sections.receiver')}>
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="large"
                  label={t('fields.lastName')}
                  fullWidth
                  onBlur={() => {
                    field.onBlur();
                    autosaveReceiverField('lastName');
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="large"
                  label={t('fields.firstName')}
                  fullWidth
                  onBlur={() => {
                    field.onBlur();
                    autosaveReceiverField('firstName');
                  }}
                />
              )}
            />
          </Box>
        </Stack>

        <Controller
          name="phone"
          control={form.control}
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
              size="large"
              label={t('fields.phone')}
              fullWidth
              onBlur={() => {
                field.onBlur();
                autosaveReceiverField('phone');
              }}
            />
          )}
        />
      </CheckoutFormSection>

      <CheckoutFormSection
        step={2}
        title={t('sections.delivery')}
        locked={!receiverComplete}
        lockedHint={t('sections.deliveryLocked')}
      >
        <CheckoutDeliveryFields
          key={checkoutId}
          control={form.control}
          setValue={form.setValue}
          onDeliverySave={autosaveDelivery}
          deliveryEstimate={checkout.deliveryEstimate}
          deliveryEstimateIsPending={updateCheckoutDeliveryIsPending}
          enabled={receiverComplete}
        />
      </CheckoutFormSection>
    </Stack>
  );

  const mobileOrderItems = (
    <CheckoutOrderCard aria-label={tItems('title')}>
      <CheckoutOrderItemsList checkout={checkout} />
    </CheckoutOrderCard>
  );

  const mobileOrderSummary = (
    <CheckoutOrderCard aria-label={tItems('summaryTitle')}>
      <CheckoutOrderSummary
        checkout={checkout}
        deliveryEstimate={checkout.deliveryEstimate}
        footer={submitButton}
      />
    </CheckoutOrderCard>
  );

  const mainColumn = (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {checkout.expiresAt ? (
        <CheckoutHoldTimer expiresAt={checkout.expiresAt} onExpired={onHoldExpired} />
      ) : null}

      {!isDesktop ? mobileOrderItems : null}

      {formFields}

      {!isDesktop ? mobileOrderSummary : null}
    </Stack>
  );

  return (
    <Stack
      component="form"
      spacing={2}
      onFocusCapture={syncFieldFocus}
      onBlurCapture={() => {
        queueMicrotask(syncFieldFocus);
      }}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr',
        }}
      >
        {mainColumn}

        {isDesktop ? <CheckoutOrderSidebar checkout={checkout} footer={submitButton} sticky /> : null}
      </Box>
    </Stack>
  );
}
