'use client';

import { useMemo, useState } from 'react';

export type FeedPanels = {
  commentsOpen: boolean;
  detailsOpen: boolean;
  likedOpen: boolean;
  openComments: () => void;
  closeComments: () => void;
  openDetails: () => void;
  closeDetails: () => void;
  openLiked: () => void;
  closeLiked: () => void;
};

export function useFeedPanels(): FeedPanels {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);

  return useMemo(
    () => ({
      commentsOpen,
      detailsOpen,
      likedOpen,
      openComments: () => setCommentsOpen((open) => !open),
      closeComments: () => setCommentsOpen(false),
      openDetails: () => setDetailsOpen(true),
      closeDetails: () => setDetailsOpen(false),
      openLiked: () => setLikedOpen(true),
      closeLiked: () => setLikedOpen(false),
    }),
    [commentsOpen, detailsOpen, likedOpen],
  );
}
