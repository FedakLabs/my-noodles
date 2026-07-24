import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { CreateSellerDto, Seller } from '@my-noodles/api-clients/admin';
import { Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateSeller, useSeller, useUpdateSeller } from '@/api/sellers';

type SellerFormState = {
  slug: string;
  name: string;
  logoUrl: string;
};

function defaultFormState(): SellerFormState {
  return { slug: '', name: '', logoUrl: '' };
}

function formStateFromSeller(seller: Seller): SellerFormState {
  return {
    slug: seller.slug,
    name: seller.name,
    logoUrl: seller.logoUrl ?? '',
  };
}

function buildPayload(state: SellerFormState): CreateSellerDto {
  return {
    slug: state.slug.trim(),
    name: state.name.trim(),
    logoUrl: state.logoUrl.trim() || null,
  };
}

type SellerFormModalData = { mode: 'create' } | { mode: 'edit'; sellerId: string };

export type SellerFormModalRef = ModalRef<SellerFormModalData>;

function SellerFormModalContent() {
  const { t } = useTranslation(['sellers', 'common']);
  const { data, close, setDisableClose } = useModal<SellerFormModalData>();
  const isEdit = data.mode === 'edit';
  const sellerId = isEdit ? data.sellerId : '';
  const { seller, sellerIsLoading } = useSeller(sellerId);
  const { createSellerAsync, createSellerIsPending } = useCreateSeller();
  const { updateSellerAsync, updateSellerIsPending } = useUpdateSeller(sellerId);

  const [form, setForm] = useState<SellerFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createSellerIsPending || updateSellerIsPending;
  const isReady = !isEdit || Boolean(seller);

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
    if (data.mode === 'edit' && seller) {
      setForm(formStateFromSeller(seller));
      setError(null);
    }
  }, [data, seller]);

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateSellerAsync(payload);
      } else {
        await createSellerAsync(payload);
      }
      close();
    } catch {
      setError(t('sellers:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('sellers:form.editTitle') : t('sellers:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && sellerIsLoading ? <Typography>{t('sellers:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('sellers:form.slug')}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={t('sellers:form.name')}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={t('sellers:form.logoUrl')}
              value={form.logoUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
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

export function SellerFormModal({ ref }: { ref?: Ref<SellerFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="lg">
      <SellerFormModalContent />
    </Modal>
  );
}
