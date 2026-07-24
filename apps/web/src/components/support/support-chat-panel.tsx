'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { sheetShadow } from '@my-noodles/theme';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { SUPPORT_CHAT_PANEL_INSET } from './support-chat-layout';

export type SupportChatPanelPhase = 'loadingSession' | 'sessionError' | 'connecting' | 'connectError';

type SupportChatPanelProps = {
  phase: SupportChatPanelPhase;
  onClose: () => void;
  onRetry: () => void;
};

export function SupportChatPanel({ phase, onClose, onRetry }: SupportChatPanelProps) {
  const t = useTranslations('common');
  const isLoading = phase === 'loadingSession' || phase === 'connecting';
  const isError = phase === 'sessionError' || phase === 'connectError';

  const statusLabel =
    phase === 'loadingSession'
      ? t('support.loadingSession')
      : phase === 'connecting'
        ? t('support.connecting')
        : phase === 'sessionError'
          ? t('support.sessionFailed')
          : t('support.connectFailed');

  return (
    <Paper
      component="dialog"
      open
      elevation={0}
      aria-label={t('support.title')}
      aria-busy={isLoading}
      sx={{
        position: 'fixed',
        inset: 'auto',
        right: SUPPORT_CHAT_PANEL_INSET.right,
        bottom: SUPPORT_CHAT_PANEL_INSET.bottom,
        zIndex: (theme) => theme.zIndex.modal,
        width: { mobile: 'min(100vw - 32px, 380px)', desktop: 380 },
        maxWidth: 'none',
        height: { mobile: 'min(70dvh, 560px)', desktop: 560 },
        maxHeight: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        borderRadius: (theme) => `${theme.borderRadius.sheet}px`,
        boxShadow: sheetShadow,
        margin: 0,
        padding: 0,
        '&::backdrop': { display: 'none' },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">{t('support.title')}</Typography>
        <IconButton onClick={onClose} aria-label={t('support.close')}>
          <CloseIcon aria-hidden size={24} />
        </IconButton>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 4,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 280 }}>
          {isLoading ? (
            <>
              <CircularProgress size={36} aria-hidden />
              <Typography variant="body2" color="text.secondary">
                {statusLabel}
              </Typography>
            </>
          ) : null}

          {isError ? (
            <>
              <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                {statusLabel}
              </Alert>
              <Button variant="contained" onClick={onRetry}>
                {t('retry')}
              </Button>
            </>
          ) : null}
        </Stack>
      </Box>
    </Paper>
  );
}
