import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Category, CreateCategoryDto, LocalizedStringDto } from '@my-noodles/api-clients/admin';
import {
  cleanLocalizedString,
  emptyLocalizedString,
  isLocalizedStringComplete,
  LOCALE_OPTIONS,
  toRequiredLocalizedString,
} from '@my-noodles/locale';
import { LocalizedFields, LocalizedTextField, Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCategory, useCreateCategory, useUpdateCategory } from '@/api/categories';

type CategoryFormState = {
  slug: string;
  nameLocale: LocalizedStringDto;
  icon: string;
  sortOrder: string;
  themeKey: string;
};

function defaultFormState(): CategoryFormState {
  return { slug: '', nameLocale: emptyLocalizedString(), icon: '', sortOrder: '0', themeKey: '' };
}

function formStateFromCategory(category: Category): CategoryFormState {
  return {
    slug: category.slug,
    nameLocale: toRequiredLocalizedString(category.nameLocale),
    icon: category.icon ?? '',
    sortOrder: String(category.sortOrder),
    themeKey: category.themeKey ?? '',
  };
}

function buildPayload(state: CategoryFormState): CreateCategoryDto {
  return {
    slug: state.slug.trim(),
    nameLocale: cleanLocalizedString(state.nameLocale),
    icon: state.icon.trim() || null,
    sortOrder: Number(state.sortOrder) || 0,
    themeKey: state.themeKey.trim() || null,
  };
}

type CategoryFormModalData = { mode: 'create' } | { mode: 'edit'; categoryId: string };

export type CategoryFormModalRef = ModalRef<CategoryFormModalData>;

function CategoryFormModalContent() {
  const { t } = useTranslation(['categories', 'common']);
  const { data, close, setDisableClose } = useModal<CategoryFormModalData>();
  const isEdit = data.mode === 'edit';
  const categoryId = isEdit ? data.categoryId : '';
  const { category, categoryIsLoading } = useCategory(categoryId);
  const { createCategoryAsync, createCategoryIsPending } = useCreateCategory();
  const { updateCategoryAsync, updateCategoryIsPending } = useUpdateCategory(categoryId);

  const [form, setForm] = useState<CategoryFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createCategoryIsPending || updateCategoryIsPending;
  const isReady = !isEdit || Boolean(category);

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
    if (data.mode === 'edit' && category) {
      setForm(formStateFromCategory(category));
      setError(null);
    }
  }, [data, category]);

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateCategoryAsync(payload);
      } else {
        await createCategoryAsync(payload);
      }
      close();
    } catch {
      setError(t('categories:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('categories:form.editTitle') : t('categories:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && categoryIsLoading ? <Typography>{t('categories:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('categories:form.slug')}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              fullWidth
              required
            />
            <LocalizedFields localeLabel={t('categories:form.language')} locales={LOCALE_OPTIONS}>
              <LocalizedTextField
                label={t('categories:form.name')}
                value={form.nameLocale}
                onChange={(nameLocale) =>
                  setForm((prev) => ({ ...prev, nameLocale: toRequiredLocalizedString(nameLocale) }))
                }
                required
              />
            </LocalizedFields>
            <TextField
              label={t('categories:form.icon')}
              value={form.icon}
              onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
              fullWidth
            />
            <TextField
              type="number"
              label={t('categories:form.sortOrder')}
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
              sx={{ maxWidth: 200 }}
            />
            <TextField
              label={t('categories:form.themeKey')}
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
          disabled={!isReady || !form.slug || !isLocalizedStringComplete(form.nameLocale)}
          onClick={() => void handleSave()}
        >
          {t('common:actions.save')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function CategoryFormModal({ ref }: { ref?: Ref<CategoryFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="lg">
      <CategoryFormModalContent />
    </Modal>
  );
}
