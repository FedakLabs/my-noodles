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
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import type { DeliveryCityDto, DeliveryWarehouseDto } from '@/api/delivery';
import { useDeliveryCities, useDeliveryProviders, useDeliveryWarehouses } from '@/api/delivery';
import { formatEstimateDeliveryDate } from '@/components/checkout/delivery';

import type { CheckoutFormData } from './validation';

type CheckoutDeliveryFieldsProps = {
  control: Control<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  onDeliverySave: (values?: Partial<CheckoutFormData>) => void;
  deliveryEstimate: OrderDeliveryEstimateDto | null;
  deliveryEstimateIsPending?: boolean;
  enabled?: boolean;
};

export function canEstimateCheckoutDelivery(values: {
  method: DeliveryMethod;
  cityName: string;
  warehouseRef: string;
  warehouseNumber: string;
  street: string;
  building: string;
}): boolean {
  if (!values.cityName.trim()) {
    return false;
  }

  if (values.method === DeliveryMethod.WAREHOUSE) {
    return Boolean(values.warehouseRef.trim() || values.warehouseNumber.trim());
  }

  return Boolean(values.street.trim() && values.building.trim());
}

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
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {method === DeliveryMethod.COURIER ? t('estimatePendingCourier') : t('estimatePending')}
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

function clearCityFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('cityRef', '');
  setValue('cityName', '');
}

function clearWarehouseFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('warehouseRef', '');
  setValue('warehouseName', '');
  setValue('warehouseNumber', '');
}

function clearCourierFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('street', '');
  setValue('building', '');
  setValue('apartment', '');
}

function clearAddressFields(setValue: UseFormSetValue<CheckoutFormData>) {
  clearWarehouseFields(setValue);
  clearCourierFields(setValue);
  setValue('notes', '');
}

function resetAfterProviderChange(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('method', DeliveryMethod.WAREHOUSE);
  clearCityFields(setValue);
  clearAddressFields(setValue);
}

function resetAfterMethodChange(setValue: UseFormSetValue<CheckoutFormData>) {
  clearCityFields(setValue);
  clearAddressFields(setValue);
}

function resetAfterCityChange(setValue: UseFormSetValue<CheckoutFormData>) {
  clearAddressFields(setValue);
}

export function CheckoutDeliveryFields({
  control,
  setValue,
  onDeliverySave,
  deliveryEstimate,
  deliveryEstimateIsPending = false,
  enabled = true,
}: CheckoutDeliveryFieldsProps) {
  const t = useTranslations('checkout');
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

  const { deliveryCities, deliveryCitiesIsFetching } = useDeliveryCities(
    provider,
    method,
    cityInput,
    enabled,
  );
  const { deliveryWarehouses, deliveryWarehousesIsFetching } = useDeliveryWarehouses(
    provider,
    cityRef || null,
    warehouseInput,
    enabled && method === DeliveryMethod.WAREHOUSE,
  );

  const fieldsDisabled = !enabled;
  const isWarehouse = method === DeliveryMethod.WAREHOUSE;
  const showEstimateLoading =
    deliveryEstimateIsPending &&
    canEstimateCheckoutDelivery({
      method,
      cityName,
      warehouseRef,
      warehouseNumber,
      street,
      building,
    });

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

                field.onChange(nextProvider);
                resetAfterProviderChange(setValue);
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
              disabled={fieldsDisabled}
              onChange={(event) => {
                const nextMethod = event.target.value;

                if (nextMethod === field.value) {
                  return;
                }

                field.onChange(nextMethod);
                resetAfterMethodChange(setValue);
                setCityDraft(null);
                setWarehouseDraft(null);
              }}
            >
              <MenuItem value={DeliveryMethod.WAREHOUSE}>{t('delivery.methods.warehouse')}</MenuItem>
              <MenuItem value={DeliveryMethod.COURIER}>{t('delivery.methods.courier')}</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="cityName"
        control={control}
        render={({ field }) => (
          <Autocomplete
            key={`checkout-city-${provider}-${method}`}
            size="large"
            options={deliveryCities ?? []}
            openOnFocus
            disabled={fieldsDisabled}
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
            filterOptions={(options) => options}
            noOptionsText={t('delivery.cityHint')}
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
              options={deliveryWarehouses ?? []}
              getOptionLabel={(option) =>
                typeof option === 'string'
                  ? option
                  : `${option.name}${option.address ? ` — ${option.address}` : ''}`
              }
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

                const label = `${option.name}${option.address ? ` — ${option.address}` : ''}`;
                field.onChange(label);
                setWarehouseDraft(null);
                setValue('warehouseRef', option.ref);
                setValue('warehouseNumber', option.number);
                onDeliverySave({
                  warehouseName: label,
                  warehouseRef: option.ref,
                  warehouseNumber: option.number,
                });
              }}
              loading={deliveryWarehousesIsFetching}
              filterOptions={(options) => options}
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
                onBlur={() => {
                  field.onBlur();
                  onDeliverySave();
                }}
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
            disabled={fieldsDisabled || !cityRef}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            onBlur={() => {
              field.onBlur();
              onDeliverySave();
            }}
          />
        )}
      />

      <CheckoutDeliveryEstimate estimate={deliveryEstimate} isLoading={showEstimateLoading} method={method} />
    </Stack>
  );
}
