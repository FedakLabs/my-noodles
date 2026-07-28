import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Modal, showToast, type ModalRef, useModal } from '@my-noodles/ui';
import { type Ref, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useUpdateProduct } from '@/api/products';

type ConfirmQuantityChangeModalData = {
  productId: string;
  slug: string;
  name: string;
  from: number;
  to: number;
};

export type ConfirmQuantityChangeModalRef = ModalRef<ConfirmQuantityChangeModalData>;

function ConfirmQuantityChangeModalContent() {
  const { t } = useTranslation('products');
  const { t: tCommon } = useTranslation('common');
  const { data, close, setDisableClose } = useModal<ConfirmQuantityChangeModalData>();
  const productId = data?.productId ?? '';
  const { updateProductAsync, updateProductIsPending } = useUpdateProduct(productId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [data?.productId, data?.from, data?.to]);

  useEffect(() => {
    setDisableClose(updateProductIsPending);
    return () => {
      setDisableClose(false);
    };
  }, [setDisableClose, updateProductIsPending]);

  if (!data) {
    return null;
  }

  const displayName = data.name;
  const nextQuantity = data.to;

  async function confirmChange() {
    setError(null);
    try {
      await updateProductAsync({ quantity: nextQuantity });
      showToast.success(t('quantity.updateSuccess'));
      close();
    } catch {
      setError(t('quantity.updateFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={t('quantity.confirmTitle')} />
      <Modal.Body>
        <Stack spacing={1.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack spacing={0.75}>
            <Typography variant="body1" component="div">
              <Trans
                t={t}
                i18nKey="quantity.confirmIntro"
                values={{ name: displayName, slug: data.slug }}
                components={{ bold: <strong /> }}
              />
            </Typography>
            <Typography variant="body1" component="div">
              <Trans
                t={t}
                i18nKey="quantity.confirmFrom"
                values={{ from: data.from }}
                components={{ bold: <strong /> }}
              />
            </Typography>
            <Typography variant="body1" component="div">
              <Trans
                t={t}
                i18nKey="quantity.confirmTo"
                values={{ to: data.to }}
                components={{ bold: <strong /> }}
              />
            </Typography>
          </Stack>
        </Stack>
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close} disabled={updateProductIsPending}>
          {tCommon('actions.cancel')}
        </Button>
        <Button variant="contained" loading={updateProductIsPending} onClick={() => void confirmChange()}>
          {t('quantity.confirm')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function ConfirmQuantityChangeModal({ ref }: { ref?: Ref<ConfirmQuantityChangeModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="sm">
      <ConfirmQuantityChangeModalContent />
    </Modal>
  );
}
