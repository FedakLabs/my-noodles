'use client';

import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useCallback, useEffect } from 'react';

import { usePendingRouter } from '@/hooks/smooth';

import { feedExitButtonSx } from './feed-chrome';

type FeedExitButtonProps = {
  label: string;
};

export function FeedExitButton({ label }: FeedExitButtonProps) {
  const theme = useTheme();
  const router = usePendingRouter();

  const exitFeed = useCallback(() => {
    router.push('/catalog');
  }, [router]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      event.preventDefault();
      exitFeed();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [exitFeed]);

  return (
    <IconButton
      aria-label={label}
      onClick={exitFeed}
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 5,
        ...feedExitButtonSx(theme),
      }}
    >
      <CloseIcon aria-hidden size={22} />
    </IconButton>
  );
}
