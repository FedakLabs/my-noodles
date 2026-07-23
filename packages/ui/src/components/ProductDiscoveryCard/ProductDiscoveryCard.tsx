'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

import { resolveSkin, type SkinInput } from '../../utils/skins';
import { DiscoveryCard, useDiscoveryCardView } from '../DiscoveryCard';
import type { MediaGalleryItem, MediaGalleryLabels } from '../MediaGallery';
import { productCardPreviewAnchor } from './product-card-preview-anchor';
import { productDiscoveryCardSummaryTitleSx } from './product-discovery-card-sx';
import { ProductDiscoveryCardDetailsEmpty } from './ProductDiscoveryCardDetailsEmpty';
import { usePreviewCollapse } from './use-preview-collapse';

export type ProductDiscoveryCardDetails = {
  loading: boolean;
  story?: string | null;
  description?: string | null;
  forWhom?: string | null;
  emptyMessage: string;
  storyLabel: string;
  descriptionLabel: string;
  forWhomLabel: string;
};

export type ProductDiscoveryCardActionContext = {
  isPreview: boolean;
};

export type ProductDiscoveryCardProps = {
  name: string;
  countryLabel: string;
  priceLabel: string;
  mediaItems: MediaGalleryItem[];
  skinInput: SkinInput;
  actions: ReactNode[] | ((context: ProductDiscoveryCardActionContext) => ReactNode[]);
  details?: ProductDiscoveryCardDetails;
  previewEnabled?: boolean;
  gridIndex?: number;
  gridColumns?: number;
  mediaLabels?: Pick<MediaGalleryLabels, 'gallery' | 'slide' | 'video'>;
  onPreviewChange?: (isPreview: boolean) => void;
};

export function ProductDiscoveryCard({
  name,
  countryLabel,
  priceLabel,
  mediaItems,
  skinInput,
  actions,
  details,
  previewEnabled = true,
  gridIndex = 0,
  gridColumns = 2,
  mediaLabels,
  onPreviewChange,
}: ProductDiscoveryCardProps) {
  const skin = resolveSkin(skinInput);
  const viewAnchor = productCardPreviewAnchor(gridIndex, gridColumns);
  const { view, isPreview, toggleView, setView } = useDiscoveryCardView();
  const rootRef = useRef<HTMLDivElement>(null);
  const resolvedActions = typeof actions === 'function' ? actions({ isPreview }) : actions;

  const handleCollapse = useCallback(() => {
    setView('summary');
  }, [setView]);

  usePreviewCollapse(isPreview && previewEnabled, handleCollapse, rootRef);

  useEffect(() => {
    onPreviewChange?.(isPreview && previewEnabled);
  }, [isPreview, previewEnabled, onPreviewChange]);

  const detailsContent = useMemo(() => {
    if (!details) {
      return null;
    }

    if (details.loading) {
      return null;
    }

    const previewCopy = details.story ?? details.description;
    const previewHeading = details.story
      ? details.storyLabel
      : details.description
        ? details.descriptionLabel
        : null;
    const hasForWhom = Boolean(details.forWhom);

    if (!previewCopy && !hasForWhom) {
      return <ProductDiscoveryCardDetailsEmpty message={details.emptyMessage} />;
    }

    return (
      <Stack spacing={1.5}>
        {previewCopy ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{previewHeading}</Typography>
            <Typography variant="body2" color="text.secondary">
              {previewCopy}
            </Typography>
          </Stack>
        ) : null}
        {hasForWhom ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{details.forWhomLabel}</Typography>
            <Typography variant="body2">{details.forWhom}</Typography>
          </Stack>
        ) : null}
      </Stack>
    );
  }, [details]);

  const cardMeta = (
    <DiscoveryCard.Body>
      <Typography variant="subtitle1" sx={!isPreview ? productDiscoveryCardSummaryTitleSx : undefined}>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {countryLabel}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
        {priceLabel}
      </Typography>
    </DiscoveryCard.Body>
  );

  return (
    <Box ref={rootRef} sx={{ height: '100%', width: '100%', minWidth: 0 }}>
      <DiscoveryCard.View
        view={view}
        anchor={viewAnchor}
        skin={skin}
        media={
          <DiscoveryCard.Media
            unframed
            items={mediaItems}
            mode={isPreview ? 'carousel' : 'static'}
            labels={mediaLabels}
          />
        }
        meta={cardMeta}
        actions={<DiscoveryCard.Actions actions={resolvedActions} />}
        onClick={previewEnabled ? toggleView : undefined}
        details={
          details
            ? {
                loading: details.loading,
                content: detailsContent,
              }
            : undefined
        }
      />
    </Box>
  );
}
