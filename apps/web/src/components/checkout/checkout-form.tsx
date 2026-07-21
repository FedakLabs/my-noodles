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
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import type { Checkout } from '@/api/checkouts';
import { useSubmitCheckout, useUpdateCheckoutDelivery, useUpdateCheckoutReceiver } from '@/api/checkouts';
import { CheckoutCancelledState } from '@/components/checkout/checkout-cancelled-state';
import {
  canEstimateCheckoutDelivery,
  CheckoutDeliveryFields,
  isCheckoutDeliveryEstimateLoading,
} from '@/components/checkout/checkout-delivery-fields';
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
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cartLineToGa4Item } from '@/shared/analytics';

import {
  type CheckoutFormData,
  type CheckoutReceiverField,
  type CheckoutReceiverSchema,
  createCheckoutSchemas,
  isCheckoutFormValid,
  isCheckoutReceiverComplete,
  toValidDeliveryPatch,
  toValidReceiverFieldPatch,
} from './validation';

const AUTOSAVE_DEBOUNCE_MS = 500;
const RECEIVER_FIELDS = [
  'firstName',
  'lastName',
  'phone',
] as const satisfies readonly CheckoutReceiverField[];

type CheckoutFormProps = {
  checkoutId: string;
  checkout: Checkout;
  onHoldExpired: () => void;
};

function buildReceiverPatch(values: CheckoutFormData, receiverSchema: CheckoutReceiverSchema) {
  const patch: Partial<Pick<CheckoutFormData, CheckoutReceiverField>> = {};

  for (const field of RECEIVER_FIELDS) {
    const fieldPatch = toValidReceiverFieldPatch(field, values, receiverSchema);
    if (fieldPatch) {
      Object.assign(patch, fieldPatch);
    }
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function CheckoutForm({ checkoutId, checkout, onHoldExpired }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const tItems = useTranslations('checkout.items');
  const { isDesktop } = useViewport();
  const { updateCheckoutReceiver, updateCheckoutReceiverIsPending } = useUpdateCheckoutReceiver(checkoutId);
  const { updateCheckoutDelivery, updateCheckoutDeliveryIsPending } = useUpdateCheckoutDelivery(checkoutId);
  const { submitCheckout, submitCheckoutIsPending, submitCheckoutIsError, submitCheckoutError } =
    useSubmitCheckout(checkoutId);
  const session = useCheckoutSessionState({
    checkoutId,
    checkout,
    error: submitCheckoutIsError ? submitCheckoutError : undefined,
  });
  const { trackPurchase } = useAnalyticsActions();

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
      postalCode: '',
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
  const debouncedValues = useDebouncedValue(watchedValues, AUTOSAVE_DEBOUNCE_MS);
  const firstName = useWatch({ control: form.control, name: 'firstName' });
  const lastName = useWatch({ control: form.control, name: 'lastName' });
  const phone = useWatch({ control: form.control, name: 'phone' });
  const canSubmitForm = useMemo(
    () => isCheckoutFormValid(watchedValues as CheckoutFormData, checkoutSchema),
    [checkoutSchema, watchedValues],
  );
  const receiverComplete = isCheckoutReceiverComplete({ firstName, lastName, phone }, receiverSchema);
  const deliveryMethod = watchedValues.method ?? DeliveryMethod.WAREHOUSE;
  const deliveryEstimateInput = {
    method: deliveryMethod,
    cityName: watchedValues.cityName ?? '',
    warehouseRef: watchedValues.warehouseRef ?? '',
    warehouseNumber: watchedValues.warehouseNumber ?? '',
    street: watchedValues.street ?? '',
    building: watchedValues.building ?? '',
  };
  const canEstimateDelivery = canEstimateCheckoutDelivery(deliveryEstimateInput);
  const activeDeliveryEstimate = canEstimateDelivery ? (checkout.deliveryEstimate ?? null) : null;
  const deliveryEstimateIsLoading = isCheckoutDeliveryEstimateLoading(
    updateCheckoutDeliveryIsPending,
    deliveryEstimateInput,
  );
  const hydratedCheckoutIdRef = useRef<string | null>(null);
  const autosaveEnabledRef = useRef(false);
  const lastReceiverPatchRef = useRef<string | null>(null);
  const lastDeliveryPatchRef = useRef<string | null>(null);

  const isAutosaving = updateCheckoutReceiverIsPending || updateCheckoutDeliveryIsPending;
  const isSubmitBusy = isAutosaving || submitCheckoutIsPending;
  const canSubmit = canSubmitForm && !isSubmitBusy && checkout.order.items.length > 0;

  useEffect(() => {
    if (hydratedCheckoutIdRef.current === checkoutId) {
      return;
    }

    hydratedCheckoutIdRef.current = checkoutId;
    autosaveEnabledRef.current = false;

    const values = checkoutToFormValues(checkout);
    form.reset(values);
    void form.trigger();

    const receiverPatch = buildReceiverPatch(values, receiverSchema);
    lastReceiverPatchRef.current = receiverPatch ? JSON.stringify(receiverPatch) : null;
    const deliveryPatch = toValidDeliveryPatch(values, deliverySchema);
    lastDeliveryPatchRef.current = deliveryPatch ? JSON.stringify(deliveryPatch) : null;
    autosaveEnabledRef.current = true;
  }, [checkoutId, checkout, deliverySchema, form, receiverSchema]);

  useEffect(() => {
    if (!autosaveEnabledRef.current || hydratedCheckoutIdRef.current !== checkoutId) {
      return;
    }

    const values = debouncedValues as CheckoutFormData;
    const receiverPatch = buildReceiverPatch(values, receiverSchema);

    if (receiverPatch) {
      const receiverKey = JSON.stringify(receiverPatch);
      if (receiverKey !== lastReceiverPatchRef.current) {
        lastReceiverPatchRef.current = receiverKey;
        updateCheckoutReceiver(receiverPatch);
      }
    }

    const deliveryPatch = toValidDeliveryPatch(values, deliverySchema);
    if (deliveryPatch) {
      const deliveryKey = JSON.stringify(deliveryPatch);
      if (deliveryKey !== lastDeliveryPatchRef.current) {
        lastDeliveryPatchRef.current = deliveryKey;
        updateCheckoutDelivery(deliveryPatch);
      }
    }
  }, [
    checkoutId,
    debouncedValues,
    deliverySchema,
    receiverSchema,
    updateCheckoutDelivery,
    updateCheckoutReceiver,
  ]);

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
          items: checkout.order.items.map((item) =>
            cartLineToGa4Item({
              slug: item.productId,
              title: item.titleSnapshot,
              priceMinor: item.priceMinorSnapshot,
              qty: item.qty,
            }),
          ),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const onSubmit = form.handleSubmit(submitOrder);

  if (session.isExpired) {
    return <CheckoutCancelledState title={t('inactive.title')} description={session.expiredDescription} />;
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
                <TextField {...field} size="large" label={t('fields.lastName')} fullWidth />
              )}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <TextField {...field} size="large" label={t('fields.firstName')} fullWidth />
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
              onBlur={field.onBlur}
              size="large"
              label={t('fields.phone')}
              fullWidth
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
          deliveryEstimate={checkout.deliveryEstimate ?? null}
          deliveryEstimateIsPending={updateCheckoutDeliveryIsPending}
          enabled={receiverComplete}
          showEstimate={!isDesktop}
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
        shippingCostMinor={activeDeliveryEstimate?.shippingCostMinor}
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

        {isDesktop ? (
          <CheckoutOrderSidebar
            checkout={checkout}
            footer={submitButton}
            sticky
            deliveryEstimate={activeDeliveryEstimate}
            deliveryEstimateIsLoading={deliveryEstimateIsLoading}
            deliveryMethod={deliveryMethod}
          />
        ) : null}
      </Box>
    </Stack>
  );
}
