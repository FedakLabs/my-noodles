import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AdminCountryDto, CreateCountryDto, LocalizedStringDto } from '@my-noodles/api-clients/admin';
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

import { useCountry, useCreateCountry, useUpdateCountry } from '@/api/countries';

type CountryFormState = {
  code: string;
  slug: string;
  name: LocalizedStringDto;
  flagEmoji: string;
  themeKey: string;
};

function defaultFormState(): CountryFormState {
  return { code: '', slug: '', name: emptyLocalizedString(), flagEmoji: '', themeKey: '' };
}

function formStateFromCountry(country: AdminCountryDto): CountryFormState {
  return {
    code: country.code,
    slug: country.slug,
    name: toRequiredLocalizedString(country.name),
    flagEmoji: country.flagEmoji ?? '',
    themeKey: country.themeKey ?? '',
  };
}

function buildPayload(state: CountryFormState): CreateCountryDto {
  return {
    code: state.code.trim(),
    slug: state.slug.trim(),
    name: cleanLocalizedString(state.name),
    flagEmoji: state.flagEmoji.trim() || null,
    themeKey: state.themeKey.trim() || null,
  };
}

type CountryFormModalData = { mode: 'create' } | { mode: 'edit'; countryId: string };

export type CountryFormModalRef = ModalRef<CountryFormModalData>;

function CountryFormModalContent() {
  const { t } = useTranslation(['countries', 'common']);
  const { data, close, setDisableClose } = useModal<CountryFormModalData>();
  const isEdit = data.mode === 'edit';
  const countryId = isEdit ? data.countryId : '';
  const { country, countryIsLoading } = useCountry(countryId);
  const { createCountryAsync, createCountryIsPending } = useCreateCountry();
  const { updateCountryAsync, updateCountryIsPending } = useUpdateCountry(countryId);

  const [form, setForm] = useState<CountryFormState>(defaultFormState());
  const [error, setError] = useState<string | null>(null);

  const isSaving = createCountryIsPending || updateCountryIsPending;
  const isReady = !isEdit || Boolean(country);

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
    if (data.mode === 'edit' && country) {
      setForm(formStateFromCountry(country));
      setError(null);
    }
  }, [data, country]);

  async function handleSave() {
    setError(null);
    const payload = buildPayload(form);
    try {
      if (isEdit) {
        await updateCountryAsync(payload);
      } else {
        await createCountryAsync(payload);
      }
      close();
    } catch {
      setError(t('countries:form.saveFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={isEdit ? t('countries:form.editTitle') : t('countries:form.createTitle')} />
      <Modal.Body scrollable>
        {isEdit && countryIsLoading ? <Typography>{t('countries:form.loading')}</Typography> : null}
        {isReady ? (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('countries:form.code')}
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={t('countries:form.slug')}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              fullWidth
              required
            />
            <LocalizedFields localeLabel={t('countries:form.language')} locales={LOCALE_OPTIONS}>
              <LocalizedTextField
                label={t('countries:form.name')}
                value={form.name}
                onChange={(name) => setForm((prev) => ({ ...prev, name: toRequiredLocalizedString(name) }))}
                required
              />
            </LocalizedFields>
            <TextField
              label={t('countries:form.flagEmoji')}
              value={form.flagEmoji}
              onChange={(event) => setForm((prev) => ({ ...prev, flagEmoji: event.target.value }))}
              sx={{ maxWidth: 200 }}
            />
            <TextField
              label={t('countries:form.themeKey')}
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
          disabled={!isReady || !form.code || !form.slug || !isLocalizedStringComplete(form.name)}
          onClick={() => void handleSave()}
        >
          {t('common:actions.save')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function CountryFormModal({ ref }: { ref?: Ref<CountryFormModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="sm">
      <CountryFormModalContent />
    </Modal>
  );
}
