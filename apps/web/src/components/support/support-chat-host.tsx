'use client';

import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { layoutDisplay, sheetShadow } from '@my-noodles/theme';
import ChatIcon from '@my-noodles/ui/icons/chat.svg';
import { useTranslations } from 'next-intl';

import { isImmersiveRoute } from '@/components/layout/site-nav-config';
import { usePathname } from '@/i18n/navigation';

import {
  SUPPORT_CHAT_FAB_ICON_SIZE,
  SUPPORT_CHAT_FAB_INSET,
  SUPPORT_CHAT_FAB_SIZE,
  SUPPORT_CHAT_PANEL_INSET,
} from './support-chat-layout';
import { SupportChatPanel } from './support-chat-panel';
import { useSupportChat } from './use-support-chat';

const mobileDrawerPaperSx = {
  height: '80dvh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
} as const;

export function SupportChatHost() {
  const t = useTranslations('common');
  const theme = useTheme();
  const pathname = usePathname();
  const chat = useSupportChat();

  if (!chat.isConfigured || isImmersiveRoute(pathname)) {
    return null;
  }

  const panelProps = {
    phase: chat.panelPhase,
    onClose: chat.close,
    onRetry: chat.retry,
  } as const;

  return (
    <>
      <Fab
        color={chat.isActive ? 'default' : 'primary'}
        aria-label={chat.isActive ? t('support.close') : t('support.open')}
        aria-expanded={chat.isActive}
        aria-pressed={chat.isActive}
        onClick={chat.toggle}
        sx={{
          position: 'fixed',
          right: SUPPORT_CHAT_FAB_INSET.right,
          bottom: SUPPORT_CHAT_FAB_INSET.bottom,
          width: SUPPORT_CHAT_FAB_SIZE,
          height: SUPPORT_CHAT_FAB_SIZE,
          zIndex: theme.zIndex.speedDial,
          ...(chat.isActive
            ? {
                bgcolor: 'background.paper',
                color: 'primary.main',
                border: 2,
                borderColor: 'primary.main',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              }
            : undefined),
        }}
      >
        <ChatIcon aria-hidden size={SUPPORT_CHAT_FAB_ICON_SIZE} />
      </Fab>

      <Drawer
        anchor="bottom"
        open={chat.isOpen}
        onClose={chat.close}
        sx={{ display: layoutDisplay.mobileOnlyBlock }}
        slotProps={{ paper: { sx: mobileDrawerPaperSx } }}
      >
        <SupportChatPanel {...panelProps} />
      </Drawer>

      {chat.isOpen ? (
        <Paper
          component="dialog"
          open
          elevation={0}
          aria-label={t('support.title')}
          aria-busy={chat.panelPhase === 'loadingSession' || chat.panelPhase === 'connecting'}
          sx={{
            display: layoutDisplay.desktopOnlyFlex,
            position: 'fixed',
            inset: 'auto',
            right: SUPPORT_CHAT_PANEL_INSET.right,
            bottom: SUPPORT_CHAT_PANEL_INSET.bottom,
            zIndex: theme.zIndex.modal,
            width: 380,
            maxWidth: 'none',
            height: 560,
            maxHeight: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            borderRadius: `${theme.borderRadius.sheet}px`,
            boxShadow: sheetShadow,
            margin: 0,
            padding: 0,
            '&::backdrop': { display: 'none' },
          }}
        >
          <SupportChatPanel {...panelProps} />
        </Paper>
      ) : null}
    </>
  );
}
