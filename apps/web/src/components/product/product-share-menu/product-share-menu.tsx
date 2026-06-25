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

import { useAppLocale } from '@/hooks/locale';
import { absoluteUrl, localePath } from '@/shared/seo/urls';
import {
  buildSocialShareUrl,
  canUseNativeShare,
  copyToClipboard,
  nativeShare,
  type SocialShareTarget,
} from '@/shared/share/social-share';

type ShareOptionKey =
  | 'shareNative'
  | 'shareCopyLink'
  | 'shareTelegram'
  | 'shareFacebook'
  | 'shareWhatsapp'
  | 'shareViber';

type ShareOption =
  | { kind: 'native'; labelKey: ShareOptionKey }
  | { kind: 'copy'; labelKey: ShareOptionKey }
  | { kind: 'social'; target: SocialShareTarget; labelKey: ShareOptionKey };

const SOCIAL_SHARE_OPTIONS: ShareOption[] = [
  { kind: 'copy', labelKey: 'shareCopyLink' },
  { kind: 'social', target: 'telegram', labelKey: 'shareTelegram' },
  { kind: 'social', target: 'facebook', labelKey: 'shareFacebook' },
  { kind: 'social', target: 'whatsapp', labelKey: 'shareWhatsapp' },
  { kind: 'social', target: 'viber', labelKey: 'shareViber' },
];

type ProductShareMenuProps = {
  productName: string;
  productSlug: string;
};

export function ProductShareMenu({ productName, productSlug }: ProductShareMenuProps) {
  const t = useTranslations('product');
  const locale = useAppLocale();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  const shareUrl = useMemo(
    () => absoluteUrl(localePath(locale, `/product/${productSlug}`)),
    [locale, productSlug],
  );
  const shareText = t('shareText', { name: productName });

  const shareOptions = useMemo(() => {
    const options = [...SOCIAL_SHARE_OPTIONS];

    if (canUseNativeShare()) {
      options.unshift({ kind: 'native', labelKey: 'shareNative' });
    }

    return options;
  }, []);

  const handleClose = () => setAnchorEl(null);

  const handleOptionClick = async (option: ShareOption) => {
    if (option.kind === 'native') {
      handleClose();
      try {
        await nativeShare({ title: productName, text: shareText, url: shareUrl });
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
        showToast.success(t('shareLinkCopied'));
      } else {
        showToast.error(t('shareLinkCopyFailed'));
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
        aria-label={t('share')}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ color: open ? 'primary.main' : 'inherit', p: 0.25, flexShrink: 0 }}
      >
        <ShareIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
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
