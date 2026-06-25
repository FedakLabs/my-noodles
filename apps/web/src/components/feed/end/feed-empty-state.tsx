'use client';

import Box from '@mui/material/Box';

import { type FeedTagChip } from '@/hooks/feed';

import { FeedEndContent } from './feed-end-content';

type FeedEmptyStateProps = {
  activeTags: FeedTagChip[];
  tagLabels: Record<string, string>;
  onRemoveTag: (chip: FeedTagChip) => void;
  onReshuffle: () => void;
  reshuffling: boolean;
};

export function FeedEmptyState({
  activeTags,
  tagLabels,
  onRemoveTag,
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
        onReshuffle={onReshuffle}
        reshuffling={reshuffling}
      />
    </Box>
  );
}
