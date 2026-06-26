'use client';

import Box from '@mui/material/Box';

import { type FeedTagChip } from '@/hooks/feed';

import { FeedEndContent } from './feed-end-content';

type FeedEmptyStateProps = {
  activeTags: FeedTagChip[];
  tagLabels: Record<string, string>;
  onRemoveTag: (chip: FeedTagChip) => void;
  onOpenSaved: () => void;
  onReshuffle: () => void;
  reshuffling: boolean;
};

export function FeedEmptyState({
  activeTags,
  tagLabels,
  onRemoveTag,
  onOpenSaved,
  onReshuffle,
  reshuffling,
}: FeedEmptyStateProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        textAlign: 'center',
      }}
    >
      <FeedEndContent
        activeTags={activeTags}
        tagLabels={tagLabels}
        onRemoveTag={onRemoveTag}
        onOpenSaved={onOpenSaved}
        onReshuffle={onReshuffle}
        reshuffling={reshuffling}
      />
    </Box>
  );
}
