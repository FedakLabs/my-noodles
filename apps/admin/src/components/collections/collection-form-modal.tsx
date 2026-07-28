import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Collection, CreateCollectionDto, LocalizedStringDto } from '@my-noodles/api-clients/admin';
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

import { useCollection, useCreateCollection, useUpdateCollection } from '@/api/collections';

type CollectionFormState = {
  slug: string;
  nameLocale: LocalizedStringDto;
  descriptionLocale: LocalizedStringDto;
  longDescriptionLocale: LocalizedStringDto;
  emoji: string;
  color: string;
  particles: string;
  sortOrder: string;
  isActive: boolean;
};

function defaultFormState(): CollectionFormState {
  return {
    slug: '',
    nameLocale: emptyLocalizedString(),
    descriptionLocale: emptyLocalizedString(),
    longDescriptionLocale: emptyLocalizedString(),
    emoji: '',
    color: '',
    particles: '',
    sortOrder: '0',
    isActive: true,
  };
}

function formStateFromCollection(c: Collection): CollectionFormState {
  return {
    slug: c.slug,
    nameLocale: toRequiredLocalizedString(c.nameLocale),
    descriptionLocale: toRequiredLocalizedString(c.descriptionLocale),
    longDescriptionLocale: toRequiredLocalizedString(c.longDescriptionLocale),
    emoji: c.emoji,
    color: c.color,
    particles: c.particles.join(', '),
    sortOrder: String(c.sortOrder),
    isActive: c.isActive,
  };
}

function buildPayload(state: CollectionFormState): CreateCollectionDto {
  return {
    slug: state.slug.trim(),
    nameLocale: cleanLocalizedString(state.nameLocale),
    descriptionLocale: cleanLocalizedString(state.descriptionLocale),
    longDescriptionLocale: cleanLocalizedString(state.longDescriptionLocale),
    emoji: state.emoji.trim(),
    color: state.color.trim(),
    particles: state.particles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    sortOrder: Number(state.sortOrder) || 0,
    isActive: state.isActive,
  };
}

type CollectionFormModalData = { mode: 'create' } | { mode: 'edit'; collectionId: string };

export type CollectionFormModalRef = ModalRef<CollectionFormModalData>;

function CollectionFormModalContent() {
  const { t } = useTranslation(['collections', 'common']);
  const { data, close, setDisableClose } = useModal<CollectionFormModalData>();
  const isEdit = data.mode === 'edit';
  const collectionId = isEdit ? data.collectionId : '';
  const { collection, collectionIsLoading } = useCollection(collectionId);
  const { createCollectionAsync, createCollectionIsPending } = useCreateCollection();
  const { updateCollectionAsync, updateCollectionIsPending } = useUpdateCollection(collectionId);

  const [form, setForm] = useState<CollectionFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createCollectionIsPending || updateCollectionIsPending;
  const isReady = !isEdit || Boolean(collection);

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
    if (data.mode === 'edit' && collection) {
      setForm(formStateFromCollection(collection));
      setError(null);
    }
  }, [data, collection]);

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateCollectionAsync(payload);
      } else {
        await createCollectionAsync(payload);
      }
      close();
    } catch {
      setError(t('collections:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('collections:form.editTitle') : t('collections:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && collectionIsLoading ? <Typography>{t('collections:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('collections:form.slug')}
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              fullWidth
              required
            />
            <LocalizedFields localeLabel={t('collections:form.language')} locales={LOCALE_OPTIONS}>
              <LocalizedTextField
                label={t('collections:form.name')}
                value={form.nameLocale}
                onChange={(nameLocale) =>
                  setForm((p) => ({ ...p, nameLocale: toRequiredLocalizedString(nameLocale) }))
                }
                required
              />
              <LocalizedTextField
                label={t('collections:form.description')}
                value={form.descriptionLocale}
                onChange={(descriptionLocale) =>
                  setForm((p) => ({
                    ...p,
                    descriptionLocale: toRequiredLocalizedString(descriptionLocale),
                  }))
                }
                required
              />
              <LocalizedTextField
                label={t('collections:form.longDescription')}
                value={form.longDescriptionLocale}
                onChange={(longDescriptionLocale) =>
                  setForm((p) => ({
                    ...p,
                    longDescriptionLocale: toRequiredLocalizedString(longDescriptionLocale),
                  }))
                }
                required
              />
            </LocalizedFields>
            <TextField
              label={t('collections:form.emoji')}
              value={form.emoji}
              onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
              fullWidth
              required
              placeholder="🎵"
            />
            <TextField
              label={t('collections:form.color')}
              value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              fullWidth
              required
              placeholder="#9D4EDD"
            />
            <TextField
              label={t('collections:form.particles')}
              value={form.particles}
              onChange={(e) => setForm((p) => ({ ...p, particles: e.target.value }))}
              fullWidth
              placeholder="🎵, 🎶, ♪, 🎤, ✨"
              helperText={t('collections:form.particlesHint')}
            />
            <TextField
              type="number"
              label={t('collections:form.sortOrder')}
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              sx={{ maxWidth: 200 }}
              required
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <Typography variant="body2">{t('collections:form.isActive')}</Typography>
            </Stack>
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
          disabled={
            !isReady ||
            !form.slug ||
            !form.emoji.trim() ||
            !form.color.trim() ||
            !isLocalizedStringComplete(form.nameLocale) ||
            !isLocalizedStringComplete(form.descriptionLocale) ||
            !isLocalizedStringComplete(form.longDescriptionLocale)
          }
          onClick={() => void handleSave()}
        >
          {t('common:actions.save')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function CollectionFormModal({ ref }: { ref?: Ref<CollectionFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="lg">
      <CollectionFormModalContent />
    </Modal>
  );
}
