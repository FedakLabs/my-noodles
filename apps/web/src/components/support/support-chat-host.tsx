'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChatIcon from '@my-noodles/ui/icons/chat.svg';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { isImmersiveRoute } from '@/components/layout/site-nav-config';
import { usePathname } from '@/i18n/navigation';
import { APP_ROUTES } from '@/shared/routes';

import { SUPPORT_CHAT_WIDGET_INSET } from './support-chat-layout';
import { useSupportChat } from './use-support-chat';

function isSupportRoute(pathname: string): boolean {
  return !isImmersiveRoute(pathname) && pathname !== APP_ROUTES.home;
}

/**
 * Boots Tawk on support routes. On failure, a calm chip marks the launcher corner;
 * hover shows why. Navigation or reload retries bootstrap — no click action.
 */
export function SupportChatHost() {
  const t = useTranslations('common');
  const theme = useTheme();
  const pathname = usePathname();
  const enabled = isSupportRoute(pathname);
  const chat = useSupportChat({ enabled });

  if (!chat.isConfigured || !enabled || chat.status !== 'error') {
    return null;
  }

  return (
    <Tooltip title={t('support.unavailableHint')} placement="top" describeChild>
      <Stack
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
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 22,
            height: 22,
            display: 'grid',
            placeItems: 'center',
            color: 'text.disabled',
          }}
        >
          <ChatIcon aria-hidden size={20} />
          <Box
            aria-hidden
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
        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
          {t('support.label')}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
