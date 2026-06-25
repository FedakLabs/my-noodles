'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { iconStyle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useFeedComments } from '@/api/feed';

import { feedAvatarColor, feedAvatarInitial } from './feed-avatar';
import { FeedCommentsSkeleton } from './feed-comments-skeleton';

type FeedCommentsPanelProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
};

function CommentsContent({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const t = useTranslations('feed');
  const { feedComments, feedCommentsIsInitialLoad, feedCommentsIsFetching } = useFeedComments(productId, {
    enabled: Boolean(productId),
  });

  const showSkeleton = feedCommentsIsInitialLoad || feedCommentsIsFetching;
  const comments = showSkeleton ? [] : (feedComments ?? []);

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">{t('commentsPanel.title')}</Typography>
        <IconButton aria-label={t('commentsPanel.close')} onClick={onClose}>
          <CloseIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
        </IconButton>
      </Stack>

      <Box
        data-feed-scroll-host
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}
        aria-busy={showSkeleton}
      >
        {showSkeleton ? (
          <FeedCommentsSkeleton />
        ) : comments.length === 0 ? (
          <Typography color="text.secondary">{t('commentsPanel.empty')}</Typography>
        ) : (
          <Stack spacing={2.5}>
            {comments.map((comment) => (
              <Stack key={comment.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: feedAvatarColor(comment.authorName), width: 40, height: 40 }}>
                  {feedAvatarInitial(comment.authorName)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {comment.authorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.comment}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />
      <Stack spacing={1} sx={{ px: 2.5, py: 2 }}>
        <TextField fullWidth size="small" disabled placeholder={t('commentsPanel.inputPlaceholder')} />
        <Typography variant="caption" color="text.secondary">
          {t('commentsPanel.disclaimer')}
        </Typography>
      </Stack>
    </Stack>
  );
}

export function FeedCommentsPanel({ open, productId, onClose }: FeedCommentsPanelProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));

  if (isDesktop) {
    return (
      <Box
        sx={{
          display: open ? 'block' : 'none',
          width: { desktop: 300, lg: 'min(42%, 460px)' },
          flexShrink: 0,
          height: '100%',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderLeft: 1,
          borderColor: 'divider',
        }}
      >
        <CommentsContent key={productId ?? 'none'} productId={productId} onClose={onClose} />
      </Box>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { height: '80dvh', display: 'flex', flexDirection: 'column' } },
      }}
    >
      <CommentsContent key={productId ?? 'none'} productId={productId} onClose={onClose} />
    </Drawer>
  );
}
