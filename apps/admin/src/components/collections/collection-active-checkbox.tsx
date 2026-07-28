import Checkbox from '@mui/material/Checkbox';
import { showToast } from '@my-noodles/ui';
import { useTranslation } from 'react-i18next';

import { useUpdateCollection } from '@/api/collections';

type CollectionActiveCheckboxProps = {
  collectionId: string;
  isActive: boolean;
};

export function CollectionActiveCheckbox({ collectionId, isActive }: CollectionActiveCheckboxProps) {
  const { t } = useTranslation('collections');
  const { updateCollectionAsync, updateCollectionIsPending } = useUpdateCollection(collectionId);

  return (
    <Checkbox
      size="small"
      checked={isActive}
      disabled={updateCollectionIsPending}
      slotProps={{ input: { 'aria-label': t('list.columnActive') } }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onChange={(event) => {
        const next = event.target.checked;
        void (async () => {
          try {
            await updateCollectionAsync({ isActive: next });
            showToast.success(t('active.updateSuccess'));
          } catch {
            showToast.error(t('active.updateFailed'));
          }
        })();
      }}
    />
  );
}
