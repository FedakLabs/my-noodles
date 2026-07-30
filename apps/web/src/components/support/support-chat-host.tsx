'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChatIcon from '@my-noodles/ui/icons/chat.svg';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import RefreshIcon from '@my-noodles/ui/icons/refresh.svg';
import { useTranslations } from 'next-intl';

import { isImmersiveRoute } from '@/components/layout/site-nav-config';
import { usePathname } from '@/i18n/navigation';

import { SUPPORT_CHAT_WIDGET_INSET } from './support-chat-layout';
import { useSupportChat } from './use-support-chat';

const iconSwapSx = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  transition: 'opacity 180ms ease',
} as const;

/**
 * Boots Tawk on non-immersive routes. Shows a calm corner chip while loading or on
 * error; hides once the native widget is ready.
 */
export function SupportChatHost() {
  const t = useTranslations('common');
  const theme = useTheme();
  const pathname = usePathname();
  const enabled = !isImmersiveRoute(pathname);
  const chat = useSupportChat({ enabled });

  if (!enabled || (chat.status !== 'loading' && chat.status !== 'error')) {
    return null;
  }

  const isError = chat.status === 'error';

  const chip = (
    <Stack
      component={isError ? 'button' : 'div'}
      {...(isError ? { type: 'button' as const, onClick: chat.retry } : {})}
      direction="row"
      spacing={0.75}
      sx={{
        position: 'fixed',
        right: SUPPORT_CHAT_WIDGET_INSET.right,
        bottom: SUPPORT_CHAT_WIDGET_INSET.bottom,
        zIndex: theme.zIndex.speedDial,
        alignItems: 'center',
        px: 1.25,
        py: 0.75,
        borderRadius: `${theme.borderRadius.pill}px`,
        bgcolor: 'background.paper',
        color: 'text.secondary',
        border: 1,
        borderColor: 'divider',
        boxShadow: theme.shadows[2],
        opacity: 0.92,
        cursor: isError ? 'pointer' : 'default',
        userSelect: 'none',
        appearance: 'none',
        font: 'inherit',
        m: 0,
        ...(isError
          ? {
              '&:hover .support-chat-error-idle': { opacity: 0 },
              '&:hover .support-chat-error-refresh': { opacity: 1 },
            }
          : {}),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 22,
          height: 22,
          color: 'text.disabled',
        }}
      >
        {isError ? (
          <>
            <Box className="support-chat-error-idle" sx={iconSwapSx} aria-hidden>
              <ChatIcon size={20} />
              <Box
                sx={{
                  position: 'absolute',
                  right: -3,
                  bottom: -2,
                  width: 12,
                  height: 12,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CloseIcon size={8} />
              </Box>
            </Box>
            <Box className="support-chat-error-refresh" sx={{ ...iconSwapSx, opacity: 0 }} aria-hidden>
              <RefreshIcon size={18} />
            </Box>
          </>
        ) : (
          <Box sx={{ ...iconSwapSx, position: 'relative' }}>
            <CircularProgress size={16} color="inherit" aria-hidden />
          </Box>
        )}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
        {t('support.label')}
      </Typography>
    </Stack>
  );

  if (!isError) {
    return chip;
  }

  return (
    <Tooltip title={t('support.unavailableHint')} placement="top" describeChild>
      {chip}
    </Tooltip>
  );
}
