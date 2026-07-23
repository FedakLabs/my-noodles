import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Brand, CreateBrandDto } from '@my-noodles/api-clients/admin';
import { Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrand, useCreateBrand, useUpdateBrand } from '@/api/brands';

type BrandFormState = {
  slug: string;
  name: string;
  logoUrl: string;
  themeKey: string;
};

function defaultFormState(): BrandFormState {
  return { slug: '', name: '', logoUrl: '', themeKey: '' };
}

function formStateFromBrand(brand: Brand): BrandFormState {
  return {
    slug: brand.slug,
    name: brand.name,
    logoUrl: brand.logoUrl ?? '',
    themeKey: brand.themeKey ?? '',
  };
}

function buildPayload(state: BrandFormState): CreateBrandDto {
  return {
    slug: state.slug.trim(),
    name: state.name.trim(),
    logoUrl: state.logoUrl.trim() || null,
    themeKey: state.themeKey.trim() || null,
  };
}

type BrandFormModalData = { mode: 'create' } | { mode: 'edit'; brandId: string };

export type BrandFormModalRef = ModalRef<BrandFormModalData>;

function BrandFormModalContent() {
  const { t } = useTranslation(['brands', 'common']);
  const { data, close, setDisableClose } = useModal<BrandFormModalData>();
  const isEdit = data.mode === 'edit';
  const brandId = isEdit ? data.brandId : '';
  const { brand, brandIsLoading } = useBrand(brandId);
  const { createBrandAsync, createBrandIsPending } = useCreateBrand();
  const { updateBrandAsync, updateBrandIsPending } = useUpdateBrand(brandId);

  const [form, setForm] = useState<BrandFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createBrandIsPending || updateBrandIsPending;
  const isReady = !isEdit || Boolean(brand);

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
    if (data.mode === 'edit' && brand) {
      setForm(formStateFromBrand(brand));
      setError(null);
    }
  }, [data, brand]);

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateBrandAsync(payload);
      } else {
        await createBrandAsync(payload);
      }
      close();
    } catch {
      setError(t('brands:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('brands:form.editTitle') : t('brands:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && brandIsLoading ? <Typography>{t('brands:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('brands:form.slug')}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={t('brands:form.name')}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={t('brands:form.logoUrl')}
              value={form.logoUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t('brands:form.themeKey')}
              value={form.themeKey}
              onChange={(event) => setForm((prev) => ({ ...prev, themeKey: event.target.value }))}
              fullWidth
            />
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
          disabled={!isReady || !form.slug || !form.name}
          onClick={() => void handleSave()}
        >
          {t('common:actions.save')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function BrandFormModal({ ref }: { ref?: Ref<BrandFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="sm">
      <BrandFormModalContent />
    </Modal>
  );
}
