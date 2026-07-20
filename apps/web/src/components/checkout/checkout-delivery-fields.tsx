'use client';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DeliveryMethod, type OrderDeliveryEstimateDto } from '@my-noodles/api-clients/storefront';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import type { DeliveryCityDto, DeliveryWarehouseDto } from '@/api/delivery';
import {
  DELIVERY_SEARCH_MIN_LENGTH,
  removeDeliverySearchQueries,
  useDeliveryCities,
  useDeliveryProviders,
  useDeliveryWarehouses,
} from '@/api/delivery';
import { formatEstimateDeliveryDate } from '@/components/checkout/delivery';

import {
  canEstimateCheckoutDelivery,
  deliveryAutocompleteEmptyText,
  isCheckoutDeliveryEstimateLoading,
  resetAfterCityChange,
  resetAfterMethodChange,
  resetAfterProviderChange,
} from './checkout-delivery-fields.utils';
import type { CheckoutFormData } from './validation';

export {
  canEstimateCheckoutDelivery,
  isCheckoutDeliveryEstimateLoading,
  type CheckoutDeliveryEstimateInput,
} from './checkout-delivery-fields.utils';

type CheckoutDeliveryFieldsProps = {
  control: Control<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  deliveryEstimate: OrderDeliveryEstimateDto | null;
  deliveryEstimateIsPending?: boolean;
  enabled?: boolean;
  showEstimate?: boolean;
};

export function CheckoutDeliveryEstimate({
  estimate,
  isLoading = false,
  method,
}: {
  estimate: OrderDeliveryEstimateDto | null;
  isLoading?: boolean;
  method: DeliveryMethod;
}) {
  const t = useTranslations('checkout.delivery');
  const locale = useLocale();

  if (isLoading) {
    return (
      <Alert
        severity="info"
        variant="outlined"
        aria-busy="true"
        aria-labelledby="checkout-delivery-estimate-loading"
      >
        <Stack spacing={0.75}>
          <Typography id="checkout-delivery-estimate-loading" variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('estimateLabel')}
          </Typography>
          <Skeleton variant="text" width="70%" sx={{ fontSize: '0.875rem' }} aria-hidden />
          <Skeleton variant="text" width="90%" sx={{ fontSize: '0.875rem' }} aria-hidden />
          <Typography variant="caption" color="text.secondary">
            {t('estimateCalculating')}
          </Typography>
        </Stack>
      </Alert>
    );
  }

  if (!estimate) {
    const pendingMessage =
      method === DeliveryMethod.COURIER
        ? t('estimatePendingCourier')
        : method === DeliveryMethod.CUSTOM
          ? t('estimatePendingCustom')
          : t('estimatePending');

    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {pendingMessage}
      </Typography>
    );
  }

  const formattedDate = formatEstimateDeliveryDate(estimate.estimatedDeliveryAt, locale);

  return (
    <Alert severity="info" variant="outlined" aria-labelledby="checkout-delivery-estimate-ready">
      <Stack spacing={0.5}>
        <Typography id="checkout-delivery-estimate-ready" variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('estimateLabel')}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {t('estimateDateLabel')}{' '}
          </Box>
          {formattedDate}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {t('estimateTermLabel')}{' '}
          </Box>
          {t('estimateTerm', {
            daysMin: estimate.estimatedDaysMin,
            daysMax: estimate.estimatedDaysMax,
          })}
        </Typography>
      </Stack>
    </Alert>
  );
}

export function CheckoutDeliveryFields({
  control,
  setValue,
  deliveryEstimate,
  deliveryEstimateIsPending = false,
  enabled = true,
  showEstimate = true,
}: CheckoutDeliveryFieldsProps) {
  const t = useTranslations('checkout');
  const queryClient = useQueryClient();
  const { deliveryProviders, deliveryProvidersIsInitialLoad } = useDeliveryProviders();

  const method = useWatch({ control, name: 'method' });
  const provider = useWatch({ control, name: 'provider' });
  const cityRef = useWatch({ control, name: 'cityRef' });
  const cityName = useWatch({ control, name: 'cityName' });
  const warehouseName = useWatch({ control, name: 'warehouseName' });
  const warehouseRef = useWatch({ control, name: 'warehouseRef' });
  const warehouseNumber = useWatch({ control, name: 'warehouseNumber' });
  const street = useWatch({ control, name: 'street' });
  const building = useWatch({ control, name: 'building' });

  const [cityDraft, setCityDraft] = useState<string | null>(null);
  const [warehouseDraft, setWarehouseDraft] = useState<string | null>(null);
  const cityInput = cityDraft ?? cityName;
  const warehouseInput = warehouseDraft ?? warehouseName;

  const selectedProvider = (deliveryProviders ?? []).find((item) => item.id === provider);
  const availableMethods = selectedProvider?.methods ?? [];
  const isCustom = method === DeliveryMethod.CUSTOM;
  const isWarehouse = method === DeliveryMethod.WAREHOUSE;
  const usesCatalog = !isCustom;

  useEffect(() => {
    if (!cityName) {
      setCityDraft(null);
    }
  }, [cityName]);

  useEffect(() => {
    if (!warehouseName) {
      setWarehouseDraft(null);
    }
  }, [warehouseName]);

  useEffect(() => {
    const methods = selectedProvider?.methods;
    if (!methods?.length) {
      return;
    }

    if (methods.some((item) => item.id === method)) {
      return;
    }

    setValue('method', methods[0]!.id);
    resetAfterMethodChange(setValue);
    removeDeliverySearchQueries(queryClient);
    setCityDraft(null);
    setWarehouseDraft(null);
  }, [method, selectedProvider, setValue, queryClient]);

  const { deliveryCities, deliveryCitiesIsFetching, deliveryCitiesIsError } = useDeliveryCities(
    provider,
    method,
    cityInput,
    enabled && usesCatalog,
  );
  const { deliveryWarehouses, deliveryWarehousesIsFetching, deliveryWarehousesIsError } =
    useDeliveryWarehouses(provider, method, cityRef || null, warehouseInput, enabled && isWarehouse);

  const fieldsDisabled = !enabled;
  const estimateInput = {
    method,
    cityName,
    warehouseRef,
    warehouseNumber,
    street,
    building,
  };
  const canEstimate = canEstimateCheckoutDelivery(estimateInput);
  const showEstimateLoading = isCheckoutDeliveryEstimateLoading(deliveryEstimateIsPending, estimateInput);

  return (
    <Stack spacing={1.5}>
      <Controller
        name="provider"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="large" disabled={fieldsDisabled}>
            <InputLabel id="checkout-provider-label">{t('fields.provider')}</InputLabel>
            <Select
              {...field}
              size="large"
              labelId="checkout-provider-label"
              label={t('fields.provider')}
              disabled={fieldsDisabled || deliveryProvidersIsInitialLoad}
              onChange={(event) => {
                const nextProvider = event.target.value;

                if (nextProvider === field.value) {
                  return;
                }

                const nextMethods =
                  (deliveryProviders ?? []).find((item) => item.id === nextProvider)?.methods ?? [];
                const nextMethod = nextMethods[0]?.id ?? DeliveryMethod.WAREHOUSE;

                field.onChange(nextProvider);
                resetAfterProviderChange(setValue, nextMethod);
                removeDeliverySearchQueries(queryClient);
                setCityDraft(null);
                setWarehouseDraft(null);
              }}
            >
              {(deliveryProviders ?? []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="method"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="large" disabled={fieldsDisabled}>
            <InputLabel id="checkout-method-label">{t('fields.method')}</InputLabel>
            <Select
              {...field}
              size="large"
              labelId="checkout-method-label"
              label={t('fields.method')}
              disabled={fieldsDisabled || availableMethods.length === 0}
              onChange={(event) => {
                const nextMethod = event.target.value;

                if (nextMethod === field.value) {
                  return;
                }

                field.onChange(nextMethod);
                resetAfterMethodChange(setValue);
                removeDeliverySearchQueries(queryClient);
                setCityDraft(null);
                setWarehouseDraft(null);
              }}
            >
              {availableMethods.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {isCustom ? (
        <>
          <Typography variant="body2" color="text.secondary">
            {t('delivery.customHint')}
          </Typography>

          <Controller
            name="cityName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.city')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="postalCode"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.postalCode')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="warehouseNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.branchNumber')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="warehouseName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.branchName')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="street"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.street')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="building"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.building')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="apartment"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                size="large"
                fullWidth
                label={t('fields.apartment')}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </>
      ) : (
        <>
          <Controller
            name="cityName"
            control={control}
            render={({ field }) => (
              <Autocomplete
                key={`checkout-city-${provider}-${method}`}
                size="large"
                options={cityInput.trim().length >= DELIVERY_SEARCH_MIN_LENGTH ? (deliveryCities ?? []) : []}
                openOnFocus
                disabled={fieldsDisabled}
                getOptionKey={(option) => (typeof option === 'string' ? option : option.ref)}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                isOptionEqualToValue={(option, value) => option.ref === value.ref}
                inputValue={cityInput}
                onInputChange={(_event, value) => {
                  setCityDraft(value);
                  field.onChange(value);
                  setValue('cityRef', '');
                  resetAfterCityChange(setValue);
                  setWarehouseDraft(null);
                }}
                onChange={(_event, option: DeliveryCityDto | null) => {
                  if (!option) {
                    return;
                  }

                  field.onChange(option.name);
                  setCityDraft(null);
                  setValue('cityRef', option.ref);
                  resetAfterCityChange(setValue);
                  setWarehouseDraft(null);
                }}
                loading={deliveryCitiesIsFetching}
                loadingText={t('delivery.searchLoading')}
                filterOptions={(options) => options}
                noOptionsText={deliveryAutocompleteEmptyText({
                  input: cityInput,
                  isError: deliveryCitiesIsError,
                  minLength: DELIVERY_SEARCH_MIN_LENGTH,
                  startTyping: t('delivery.searchStartTyping', { min: DELIVERY_SEARCH_MIN_LENGTH }),
                  notFound: (query) => t('delivery.searchNotFound', { query }),
                  error: t('delivery.searchError'),
                })}
                renderInput={(params) => <TextField {...params} size="large" label={t('fields.city')} />}
              />
            )}
          />

          {isWarehouse ? (
            <Controller
              name="warehouseName"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  key={`checkout-warehouse-${provider}-${cityRef}`}
                  size="large"
                  options={
                    warehouseInput.trim().length >= DELIVERY_SEARCH_MIN_LENGTH
                      ? (deliveryWarehouses ?? [])
                      : []
                  }
                  getOptionKey={(option) => (typeof option === 'string' ? option : option.ref)}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  isOptionEqualToValue={(option, value) => option.ref === value.ref}
                  disabled={fieldsDisabled || !cityRef}
                  inputValue={warehouseInput}
                  onInputChange={(_event, value) => {
                    setWarehouseDraft(value);
                    field.onChange(value);
                    setValue('warehouseRef', '');
                    setValue('warehouseNumber', '');
                  }}
                  onChange={(_event, option: DeliveryWarehouseDto | null) => {
                    if (!option) {
                      return;
                    }

                    field.onChange(option.name);
                    setWarehouseDraft(null);
                    setValue('warehouseRef', option.ref);
                    setValue('warehouseNumber', option.number);
                  }}
                  loading={deliveryWarehousesIsFetching}
                  loadingText={t('delivery.searchLoading')}
                  filterOptions={(options) => options}
                  noOptionsText={deliveryAutocompleteEmptyText({
                    input: warehouseInput,
                    isError: deliveryWarehousesIsError,
                    minLength: DELIVERY_SEARCH_MIN_LENGTH,
                    startTyping: t('delivery.branchHint', { min: DELIVERY_SEARCH_MIN_LENGTH }),
                    notFound: (query) => t('delivery.searchNotFound', { query }),
                    error: t('delivery.searchError'),
                  })}
                  renderInput={(params) => <TextField {...params} size="large" label={t('fields.branch')} />}
                />
              )}
            />
          ) : (
            <>
              <Controller
                name="street"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="large"
                    fullWidth
                    label={t('fields.street')}
                    disabled={fieldsDisabled || !cityRef}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="building"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="large"
                    fullWidth
                    label={t('fields.building')}
                    disabled={fieldsDisabled || !cityRef}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="apartment"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="large"
                    fullWidth
                    label={t('fields.apartment')}
                    disabled={fieldsDisabled || !cityRef}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </>
          )}
        </>
      )}

      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            size="large"
            fullWidth
            multiline
            minRows={2}
            label={t('fields.notes')}
            disabled={fieldsDisabled || (!isCustom && !cityRef)}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {showEstimate ? (
        <CheckoutDeliveryEstimate
          estimate={canEstimate ? deliveryEstimate : null}
          isLoading={showEstimateLoading}
          method={method}
        />
      ) : null}
    </Stack>
  );
}
