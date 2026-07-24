'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type ReactNode, useCallback, useMemo, useRef } from 'react';

import { resolveSkin, type SkinInput } from '../../utils/skins';
import {
  DiscoveryCard,
  isView,
  useDiscoveryCardView,
  type DiscoveryCardViewAnchor,
  type DiscoveryCardViewPhase,
} from '../DiscoveryCard';
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
  view: DiscoveryCardViewPhase;
};

export type ProductDiscoveryCardProps = {
  name: string;
  countryLabel: string;
  priceLabel: string;
  mediaItems: MediaGalleryItem[];
  skinInput: SkinInput;
  actions: ReactNode[] | ((context: ProductDiscoveryCardActionContext) => ReactNode[]);
  details?: ProductDiscoveryCardDetails;
  /** Starting view when uncontrolled. Defaults to summary. */
  defaultView?: DiscoveryCardViewPhase;
  /**
   * Controlled view phase. When set without `onViewChange`, the card is locked
   * (no click / outside-click / Escape toggle). Pass `onViewChange` for controlled + interactive.
   */
  view?: DiscoveryCardViewPhase;
  onViewChange?: (view: DiscoveryCardViewPhase) => void;
  gridIndex?: number;
  gridColumns?: number;
  /** Overrides grid-derived expand direction. */
  previewAnchor?: DiscoveryCardViewAnchor;
  mediaLabels?: Pick<MediaGalleryLabels, 'gallery' | 'slide' | 'video'>;
};

export function ProductDiscoveryCard({
  name,
  countryLabel,
  priceLabel,
  mediaItems,
  skinInput,
  actions,
  details,
  defaultView = 'summary',
  view: viewProp,
  onViewChange,
  gridIndex = 0,
  gridColumns = 2,
  previewAnchor,
  mediaLabels,
}: ProductDiscoveryCardProps) {
  const skin = resolveSkin(skinInput);
  const viewAnchor = previewAnchor ?? productCardPreviewAnchor(gridIndex, gridColumns);
  const { view: uncontrolledView, setView: setUncontrolledView } = useDiscoveryCardView(defaultView);
  const isControlled = viewProp !== undefined;
  const canToggle = !isControlled || onViewChange != null;
  const view = viewProp ?? uncontrolledView;
  const rootRef = useRef<HTMLDivElement>(null);
  const resolvedActions = typeof actions === 'function' ? actions({ view }) : actions;

  const setView = useCallback(
    (next: DiscoveryCardViewPhase) => {
      if (!isControlled) {
        setUncontrolledView(next);
      }
      onViewChange?.(next);
    },
    [isControlled, onViewChange, setUncontrolledView],
  );

  const toggleView = useCallback(() => {
    setView(isView(view, 'expanded') ? 'summary' : 'expanded');
  }, [setView, view]);

  const handleCollapse = useCallback(() => {
    setView('summary');
  }, [setView]);

  usePreviewCollapse(isView(view, 'expanded') && canToggle, handleCollapse, rootRef);

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
      <Typography
        variant="subtitle1"
        sx={!isView(view, 'expanded') ? productDiscoveryCardSummaryTitleSx : undefined}
      >
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
            mode={isView(view, 'expanded') ? 'carousel' : 'static'}
            labels={mediaLabels}
          />
        }
        meta={cardMeta}
        actions={<DiscoveryCard.Actions actions={resolvedActions} />}
        onClick={canToggle ? toggleView : undefined}
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
