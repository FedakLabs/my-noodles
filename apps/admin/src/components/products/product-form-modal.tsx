import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AdminProductDto, CreateProductDto, LocalizedStringDto } from '@my-noodles/api-clients/admin';
import {
  CurrencySelect,
  LocalizedTextField,
  Modal,
  SelectField,
  type ModalRef,
  useModal,
} from '@my-noodles/ui';
import { CURRENCY_CODES, DEFAULT_CURRENCY, resolveCurrency, type CurrencyCode } from '@my-noodles/utils';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrandsList } from '@/api/brands';
import { useCategoriesList } from '@/api/categories';
import { useCountriesList } from '@/api/countries';
import { useCreateProduct, useProduct, useUpdateProduct } from '@/api/products';

type ProductFormState = {
  slug: string;
  name: LocalizedStringDto;
  description: LocalizedStringDto;
  story: LocalizedStringDto;
  forWhom: LocalizedStringDto;
  weight: string;
  priceMinor: string;
  currency: CurrencyCode;
  quantity: string;
  sortWeight: string;
  spice: string;
  sweet: string;
  texture: string;
  allergens: string[];
  images: string[];
  videos: string[];
  isTriedByUs: boolean;
  brandId: string;
  countryId: string;
  categoryId: string;
};

function defaultFormState(): ProductFormState {
  return {
    slug: '',
    name: { uk: '' },
    description: { uk: '' },
    story: { uk: '' },
    forWhom: { uk: '' },
    weight: '',
    priceMinor: '0',
    currency: DEFAULT_CURRENCY,
    quantity: '0',
    sortWeight: '0',
    spice: '0',
    sweet: '0',
    texture: '',
    allergens: [],
    images: [],
    videos: [],
    isTriedByUs: false,
    brandId: '',
    countryId: '',
    categoryId: '',
  };
}

function formStateFromProduct(product: AdminProductDto): ProductFormState {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    story: product.story,
    forWhom: product.forWhom,
    weight: product.weight ?? '',
    priceMinor: String(product.priceMinor),
    currency: resolveCurrency(product.currency),
    quantity: String(product.quantity),
    sortWeight: String(product.sortWeight),
    spice: String(product.flavor.spice),
    sweet: String(product.flavor.sweet),
    texture: product.flavor.texture,
    allergens: product.allergens,
    images: product.images,
    videos: product.videos,
    isTriedByUs: product.isTriedByUs,
    brandId: product.brand?.id ?? '',
    countryId: product.country.id,
    categoryId: product.category.id,
  };
}

function cleanLocalized(value: LocalizedStringDto): LocalizedStringDto {
  const en = value.en?.trim();
  return en ? { uk: value.uk.trim(), en } : { uk: value.uk.trim() };
}

function buildPayload(state: ProductFormState): CreateProductDto {
  return {
    slug: state.slug.trim(),
    name: cleanLocalized(state.name),
    description: cleanLocalized(state.description),
    story: cleanLocalized(state.story),
    forWhom: cleanLocalized(state.forWhom),
    weight: state.weight.trim() || null,
    priceMinor: Number(state.priceMinor) || 0,
    currency: state.currency,
    flavor: {
      spice: Number(state.spice) || 0,
      sweet: Number(state.sweet) || 0,
      texture: state.texture.trim(),
    },
    allergens: state.allergens.map((value) => value.trim()).filter(Boolean),
    images: state.images.map((value) => value.trim()).filter(Boolean),
    videos: state.videos.map((value) => value.trim()).filter(Boolean),
    isTriedByUs: state.isTriedByUs,
    quantity: Number(state.quantity) || 0,
    sortWeight: Number(state.sortWeight) || 0,
    brandId: state.brandId || null,
    countryId: state.countryId,
    categoryId: state.categoryId,
  };
}

function StringListEditor({
  values,
  onChange,
  addLabel,
  removeLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  addLabel: string;
  removeLabel: string;
}) {
  return (
    <Stack spacing={1}>
      {values.map((value, index) => (
        <Stack key={index} direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button size="small" color="error" onClick={() => onChange(values.filter((_, i) => i !== index))}>
            {removeLabel}
          </Button>
        </Stack>
      ))}
      <Button
        size="small"
        variant="outlined"
        onClick={() => onChange([...values, ''])}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

type ProductFormModalData = { mode: 'create' } | { mode: 'edit'; productId: string };

export type ProductFormModalRef = ModalRef<ProductFormModalData>;

function ProductFormModalContent() {
  const { t } = useTranslation(['products', 'common']);
  const { data, close, setDisableClose } = useModal<ProductFormModalData>();
  const isEdit = data.mode === 'edit';
  const productId = isEdit ? data.productId : '';
  const { product, productIsLoading } = useProduct(productId);
  const { createProductAsync, createProductIsPending } = useCreateProduct();
  const { updateProductAsync, updateProductIsPending } = useUpdateProduct(productId);
  const { brands } = useBrandsList({ page: 1, limit: 100 });
  const { categories } = useCategoriesList({ page: 1, limit: 100 });
  const { countries } = useCountriesList({ page: 1, limit: 100 });

  const [form, setForm] = useState<ProductFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createProductIsPending || updateProductIsPending;
  const isReady = !isEdit || Boolean(product);

  useEffect(() => {
    setDisableClose(isSaving);
    return () => {
      setDisableClose(false);
    };
  }, [isSaving, setDisableClose]);

  useEffect(() => {
    if (data.mode === 'create') {
      setForm(defaultFormState());
      setError(null);
    }
  }, [data]);

  useEffect(() => {
    if (data.mode === 'edit' && product) {
      setForm(formStateFromProduct(product));
      setError(null);
    }
  }, [data, product]);

  function updateLocalized(
    field: 'name' | 'description' | 'story' | 'forWhom',
    next: { uk?: string; en?: string },
  ) {
    setForm((prev) => ({ ...prev, [field]: { uk: next.uk ?? '', en: next.en } }));
  }

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateProductAsync(payload);
      } else {
        await createProductAsync(payload);
      }
      close();
    } catch {
      setError(t('products:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('products:form.editTitle') : t('products:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && productIsLoading ? <Typography>{t('products:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label={t('products:form.slug')}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              fullWidth
            />

            <LocalizedTextField
              label={t('products:form.name')}
              value={form.name}
              onChange={(value) => updateLocalized('name', value)}
              required
              requiredLocale="uk"
            />
            <LocalizedTextField
              label={t('products:form.description')}
              value={form.description}
              onChange={(value) => updateLocalized('description', value)}
              multiline
              minRows={2}
            />
            <LocalizedTextField
              label={t('products:form.story')}
              value={form.story}
              onChange={(value) => updateLocalized('story', value)}
              multiline
              minRows={2}
            />
            <LocalizedTextField
              label={t('products:form.forWhom')}
              value={form.forWhom}
              onChange={(value) => updateLocalized('forWhom', value)}
              multiline
              minRows={2}
            />

            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <TextField
                label={t('products:form.weight')}
                value={form.weight}
                onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                sx={{ minWidth: 140 }}
              />
              <TextField
                type="number"
                label={t('products:form.priceMinor')}
                value={form.priceMinor}
                onChange={(event) => setForm((prev) => ({ ...prev, priceMinor: event.target.value }))}
                sx={{ minWidth: 140 }}
              />
              <CurrencySelect
                label={t('products:form.currency')}
                value={form.currency}
                currencies={CURRENCY_CODES}
                onChange={(currency) => setForm((prev) => ({ ...prev, currency }))}
              />
              <TextField
                type="number"
                label={t('products:form.quantity')}
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                sx={{ minWidth: 120 }}
              />
              <TextField
                type="number"
                label={t('products:form.sortWeight')}
                value={form.sortWeight}
                onChange={(event) => setForm((prev) => ({ ...prev, sortWeight: event.target.value }))}
                sx={{ minWidth: 140 }}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('products:form.flavor')}</Typography>
              <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  label={t('products:form.spice')}
                  value={form.spice}
                  onChange={(event) => setForm((prev) => ({ ...prev, spice: event.target.value }))}
                  slotProps={{ htmlInput: { min: 0, max: 5 } }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  type="number"
                  label={t('products:form.sweet')}
                  value={form.sweet}
                  onChange={(event) => setForm((prev) => ({ ...prev, sweet: event.target.value }))}
                  slotProps={{ htmlInput: { min: 0, max: 5 } }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label={t('products:form.texture')}
                  value={form.texture}
                  onChange={(event) => setForm((prev) => ({ ...prev, texture: event.target.value }))}
                  sx={{ minWidth: 140 }}
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('products:form.allergens')}</Typography>
              <StringListEditor
                values={form.allergens}
                onChange={(allergens) => setForm((prev) => ({ ...prev, allergens }))}
                addLabel={t('products:form.addAllergen')}
                removeLabel={t('common:actions.remove')}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('products:form.images')}</Typography>
              <StringListEditor
                values={form.images}
                onChange={(images) => setForm((prev) => ({ ...prev, images }))}
                addLabel={t('products:form.addImage')}
                removeLabel={t('common:actions.remove')}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('products:form.videos')}</Typography>
              <StringListEditor
                values={form.videos}
                onChange={(videos) => setForm((prev) => ({ ...prev, videos }))}
                addLabel={t('products:form.addVideo')}
                removeLabel={t('common:actions.remove')}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isTriedByUs}
                  onChange={(event) => setForm((prev) => ({ ...prev, isTriedByUs: event.target.checked }))}
                />
              }
              label={t('products:form.isTriedByUs')}
            />

            <SelectField
              label={t('products:form.brand')}
              value={form.brandId}
              onChange={(event) => setForm((prev) => ({ ...prev, brandId: event.target.value }))}
              fullWidth
              visuallyFilledWhenEmpty
            >
              <MenuItem value="">{t('products:form.noBrand')}</MenuItem>
              {(brands?.items ?? []).map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </SelectField>

            <SelectField
              label={t('products:form.country')}
              value={form.countryId}
              onChange={(event) => setForm((prev) => ({ ...prev, countryId: event.target.value }))}
              fullWidth
              required
            >
              {(countries?.items ?? []).map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name.uk}
                </MenuItem>
              ))}
            </SelectField>

            <SelectField
              label={t('products:form.category')}
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              fullWidth
              required
            >
              {(categories?.items ?? []).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name.uk}
                </MenuItem>
              ))}
            </SelectField>
          </Stack>
        ) : null}
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close} disabled={isSaving}>
          {t('common:actions.cancel')}
        </Button>
        <Button
          variant="contained"
          loading={isSaving}
          disabled={!isReady || !form.slug || !form.countryId || !form.categoryId}
          onClick={() => void handleSave()}
        >
          {t('common:actions.save')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function ProductFormModal({ ref }: { ref?: Ref<ProductFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="md">
      <ProductFormModalContent />
    </Modal>
  );
}
