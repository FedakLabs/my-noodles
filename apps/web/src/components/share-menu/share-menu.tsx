'use client';

import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { cardShadow } from '@my-noodles/theme';
import { iconStyle, showToast } from '@my-noodles/ui';
import ShareIcon from '@my-noodles/ui/icons/share.svg';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';

import {
  buildSocialShareUrl,
  canUseNativeShare,
  copyToClipboard,
  nativeShare,
  type SocialShareTarget,
} from '@/shared/share/social-share';

type ShareOptionKey = 'native' | 'copyLink' | 'telegram' | 'facebook' | 'whatsapp' | 'viber';

type ShareOption =
  | { kind: 'native'; labelKey: ShareOptionKey }
  | { kind: 'copy'; labelKey: ShareOptionKey }
  | { kind: 'social'; target: SocialShareTarget; labelKey: ShareOptionKey };

const SOCIAL_SHARE_OPTIONS: ShareOption[] = [
  { kind: 'copy', labelKey: 'copyLink' },
  { kind: 'social', target: 'telegram', labelKey: 'telegram' },
  { kind: 'social', target: 'facebook', labelKey: 'facebook' },
  { kind: 'social', target: 'whatsapp', labelKey: 'whatsapp' },
  { kind: 'social', target: 'viber', labelKey: 'viber' },
];

export type ShareMenuProps = {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  ariaLabel: string;
  iconSize?: number;
};

export function ShareMenu({ shareUrl, shareTitle, shareText, ariaLabel, iconSize = 20 }: ShareMenuProps) {
  const t = useTranslations('common.share');
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  const shareOptions = useMemo(() => {
    const options = [...SOCIAL_SHARE_OPTIONS];

    if (canUseNativeShare()) {
      options.unshift({ kind: 'native', labelKey: 'native' });
    }

    return options;
  }, []);

  const handleClose = () => setAnchorEl(null);

  const handleOptionClick = async (option: ShareOption) => {
    if (option.kind === 'native') {
      handleClose();
      try {
        await nativeShare({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
      return;
    }

    if (option.kind === 'copy') {
      handleClose();
      const copied = await copyToClipboard(shareUrl);
      if (copied) {
        showToast.success(t('linkCopied'));
      } else {
        showToast.error(t('linkCopyFailed'));
      }
      return;
    }

    handleClose();
    const href = buildSocialShareUrl(option.target, shareUrl, shareText);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={ariaLabel}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ color: open ? 'primary.main' : 'inherit', p: 0.25, flexShrink: 0 }}
      >
        <ShareIcon aria-hidden style={iconStyle({ size: iconSize, color: 'inherit' })} />
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              maxWidth: 320,
              mt: 0.75,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: `${cardShadow}, 0 8px 28px rgba(26, 22, 20, 0.14)`,
            },
          },
        }}
      >
        {shareOptions.map((option) => (
          <MenuItem key={option.labelKey} onClick={() => void handleOptionClick(option)} sx={{ py: 1.25 }}>
            <ListItemText primary={t(option.labelKey)} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
