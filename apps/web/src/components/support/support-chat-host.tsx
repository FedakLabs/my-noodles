'use client';

import Fab from '@mui/material/Fab';
import { useTheme } from '@mui/material/styles';
import ChatIcon from '@my-noodles/ui/icons/chat.svg';
import { useTranslations } from 'next-intl';

import { isImmersiveRoute } from '@/components/layout/site-nav-config';
import { usePathname } from '@/i18n/navigation';

import {
  SUPPORT_CHAT_FAB_ICON_SIZE,
  SUPPORT_CHAT_FAB_INSET,
  SUPPORT_CHAT_FAB_SIZE,
} from './support-chat-layout';
import { SupportChatPanel } from './support-chat-panel';
import { useSupportChat } from './use-support-chat';

export function SupportChatHost() {
  const t = useTranslations('common');
  const theme = useTheme();
  const pathname = usePathname();
  const chat = useSupportChat();

  if (!chat.isConfigured || isImmersiveRoute(pathname)) {
    return null;
  }

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

      {chat.isOpen ? (
        <SupportChatPanel phase={chat.panelPhase} onClose={chat.close} onRetry={chat.retry} />
      ) : null}
    </>
  );
}
