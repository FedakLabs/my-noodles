import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DEFAULT_LOCALE, pickLocalized, SUPPORTED_LOCALES, type Locale } from '@my-noodles/locale';
import {
  DiscoveryCard,
  type DiscoveryCardViewPhase,
  discoveryCardGroupedCartButtonSx,
  discoveryCardGroupedDetailsButtonSx,
  isView,
  Modal,
  type ModalRef,
  ProductDiscoveryCard,
  productDiscoveryCardLabelQuickActionSx,
  SelectField,
  useModal,
} from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { type Ref, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useProduct } from '@/api/products';
import { formatCurrency } from '@/utils/format-currency';

type ProductCardPreviewModalData = {
  productId: string;
};

export type ProductCardPreviewModalRef = ModalRef<ProductCardPreviewModalData>;

const CARD_VIEW_MODES = [
  { value: 'summary', labelKey: 'products:preview.summaryCaption' },
  { value: 'expanded', labelKey: 'products:preview.expandedCaption' },
] as const satisfies ReadonlyArray<{
  value: DiscoveryCardViewPhase;
  labelKey: string;
}>;

function ProductCardPreviewModalContent({ onEditProduct }: { onEditProduct?: (productId: string) => void }) {
  const { t, i18n } = useTranslation(['products', 'common']);
  const { data, close } = useModal<ProductCardPreviewModalData>();
  const productId = data?.productId ?? '';
  const { product, productIsLoading, productIsError } = useProduct(productId);
  const [view, setView] = useState<DiscoveryCardViewPhase>('expanded');
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [catalogInteractions, setCatalogInteractions] = useState(false);
  /** Preview locale can differ from admin chrome language. */
  const tCard = useMemo(() => i18n.getFixedT(locale, 'discoveryCard'), [i18n, locale]);

  useEffect(() => {
    setView('expanded');
    setLocale(DEFAULT_LOCALE);
    setCatalogInteractions(false);
  }, [productId]);

  const name = product ? pickLocalized(product.name, locale) || product.slug : '';
  const countryLabel = product ? pickLocalized(product.country.name, locale) : '';
  const priceLabel = product ? formatCurrency(product.priceMinor, product.currency) : '';
  const inStock = (product?.quantity ?? 0) > 0;

  const mediaItems = useMemo(() => {
    if (!product) {
      return [];
    }
    return [
      ...product.images.map((url) => ({ type: 'image' as const, url, alt: name })),
      ...product.videos.map((url) => ({ type: 'video' as const, url, alt: name })),
    ];
  }, [name, product]);

  const skinInput = useMemo(
    () =>
      product
        ? {
            brand: product.brand?.slug,
            country: product.country.slug,
            category: product.category.slug,
            slug: product.slug,
          }
        : { slug: '' },
    [product],
  );

  const details = useMemo(
    () =>
      product
        ? {
            loading: false,
            story: pickLocalized(product.story, locale),
            description: pickLocalized(product.description, locale),
            forWhom: pickLocalized(product.forWhom, locale),
            emptyMessage: tCard('detailsEmpty'),
            storyLabel: tCard('story'),
            descriptionLabel: tCard('description'),
            forWhomLabel: tCard('forWhom'),
          }
        : undefined,
    [locale, product, tCard],
  );

  const catalogActions = ({ view: cardView }: { view: DiscoveryCardViewPhase }) => [
    <Button
      key="cart"
      variant="text"
      color="inherit"
      size="small"
      disabled
      sx={[productDiscoveryCardLabelQuickActionSx, discoveryCardGroupedDetailsButtonSx]}
      aria-label={
        isView(cardView, 'expanded') ? undefined : inStock ? tCard('addToCart') : tCard('outOfStock')
      }
      onClick={(event) => event.stopPropagation()}
    >
      <Stack
        direction="row"
        spacing={isView(cardView, 'expanded') ? 1 : 0}
        sx={{ minWidth: 0, alignItems: 'center' }}
      >
        <CartIcon aria-hidden size={20} />
        <DiscoveryCard.Collapse expanded={isView(cardView, 'expanded')} orientation="horizontal">
          {inStock ? tCard('addShort') : tCard('outOfStock')}
        </DiscoveryCard.Collapse>
      </Stack>
    </Button>,
    <Button
      key="details"
      variant="text"
      color="inherit"
      size="small"
      disabled
      sx={[productDiscoveryCardLabelQuickActionSx, discoveryCardGroupedCartButtonSx]}
      aria-label={isView(cardView, 'expanded') ? undefined : tCard('goToDetails')}
      onClick={(event) => event.stopPropagation()}
    >
      <Stack
        direction="row"
        spacing={isView(cardView, 'expanded') ? 1 : 0}
        sx={{ minWidth: 0, alignItems: 'center' }}
      >
        <ChevronRightIcon aria-hidden size={20} />
        <DiscoveryCard.Collapse expanded={isView(cardView, 'expanded')} orientation="horizontal">
          {tCard('goToProduct')}
        </DiscoveryCard.Collapse>
      </Stack>
    </Button>,
  ];

  return (
    <>
      <Modal.Header
        title={
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {onEditProduct && productId ? (
              <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                  close();
                  onEditProduct(productId);
                }}
              >
                {t('products:form.editTitle')}
              </Button>
            ) : null}
            <Typography variant="h6" component="h2">
              {t('products:preview.title')}
            </Typography>
          </Stack>
        }
      />
      <Modal.Body scrollable>
        {productIsLoading ? <Typography>{t('common:states.loading')}</Typography> : null}
        {productIsError || (!productIsLoading && !product) ? (
          <Typography color="error">{t('products:detail.notFound')}</Typography>
        ) : null}

        {product && details ? (
          <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto' }}>
            <ProductDiscoveryCard
              name={name}
              countryLabel={countryLabel}
              priceLabel={priceLabel}
              mediaItems={mediaItems}
              skinInput={skinInput}
              details={details}
              actions={catalogActions}
              view={view}
              onViewChange={catalogInteractions ? setView : undefined}
              previewAnchor="center"
              gridColumns={1}
            />
          </Box>
        ) : null}
      </Modal.Body>
      <Modal.Footer align="center">
        <SelectField
          label={t('products:preview.language')}
          size="small"
          width={120}
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
        >
          {SUPPORTED_LOCALES.map((value) => (
            <MenuItem key={value} value={value}>
              {value.toUpperCase()}
            </MenuItem>
          ))}
        </SelectField>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, next: DiscoveryCardViewPhase | null) => {
            if (next != null) {
              setView(next);
            }
          }}
          aria-label={t('products:preview.modeSwitch')}
        >
          {CARD_VIEW_MODES.map((mode) => (
            <ToggleButton key={mode.value} value={mode.value}>
              {t(mode.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={catalogInteractions}
              onChange={(event) => setCatalogInteractions(event.target.checked)}
            />
          }
          label={t('products:preview.catalogInteractions')}
        />
      </Modal.Footer>
    </>
  );
}

export function ProductCardPreviewModal({
  ref,
  onEditProduct,
}: {
  ref?: Ref<ProductCardPreviewModalRef>;
  onEditProduct?: (productId: string) => void;
}) {
  return (
    <Modal ref={ref} maxWidth="xl">
      <ProductCardPreviewModalContent onEditProduct={onEditProduct} />
    </Modal>
  );
}
