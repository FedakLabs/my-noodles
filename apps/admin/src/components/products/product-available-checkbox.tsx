import Checkbox from '@mui/material/Checkbox';
import { showToast } from '@my-noodles/ui';
import { useTranslation } from 'react-i18next';

import { useUpdateProduct } from '@/api/products';

type ProductAvailableCheckboxProps = {
  productId: string;
  available: boolean;
};

export function ProductAvailableCheckbox({ productId, available }: ProductAvailableCheckboxProps) {
  const { t } = useTranslation('products');
  const { updateProductAsync, updateProductIsPending } = useUpdateProduct(productId);

  return (
    <Checkbox
      size="small"
      checked={available}
      disabled={updateProductIsPending}
      slotProps={{ input: { 'aria-label': t('list.columnAvailable') } }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onChange={(event) => {
        const next = event.target.checked;
        void (async () => {
          try {
            await updateProductAsync({ available: next });
            showToast.success(t('available.updateSuccess'));
          } catch {
            showToast.error(t('available.updateFailed'));
          }
        })();
      }}
    />
  );
}
