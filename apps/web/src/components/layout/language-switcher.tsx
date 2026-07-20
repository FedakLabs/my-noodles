'use client';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import { cardShadow } from '@my-noodles/theme';
import { iconStyle } from '@my-noodles/ui';
import GlobeIcon from '@my-noodles/ui/icons/globe.svg';
import { useTranslations } from 'next-intl';
import { type MouseEvent, useId, useState } from 'react';

import { useSwitchLocale } from '@/hooks/locale';
import type { AppLocale } from '@/i18n/routing';

type LanguageSwitcherProps = {
  onSwitched?: () => void;
  sx?: SxProps<Theme>;
};

export function LanguageSwitcher({ onSwitched, sx }: LanguageSwitcherProps) {
  const t = useTranslations('common.language');
  const menuId = useId();
  const { switchLocale, options, locale, isSwitching } = useSwitchLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    if (isSwitching) {
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleSelect = (nextLocale: AppLocale) => {
    if (isSwitching) {
      return;
    }

    switchLocale(nextLocale);
    closeMenu();
    onSwitched?.();
  };

  const menu = (
    <Menu
      id={menuId}
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 180,
            mt: 0.75,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: `${cardShadow}, 0 8px 28px rgba(26, 22, 20, 0.14)`,
          },
        },
      }}
    >
      {options.map((option) => {
        const selected = option.value === locale;

        return (
          <MenuItem
            key={option.value}
            selected={selected}
            onClick={() => handleSelect(option.value)}
            sx={{
              fontWeight: selected ? 600 : 400,
              color: selected ? 'primary.main' : 'text.primary',
            }}
          >
            {option.label}
          </MenuItem>
        );
      })}
    </Menu>
  );

  return (
    <>
      <ListItemButton
        onClick={openMenu}
        disabled={isSwitching}
        aria-busy={isSwitching || undefined}
        aria-label={t('switchTo')}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        sx={{
          flex: '0 0 auto',
          alignSelf: 'stretch',
          justifyContent: 'flex-start',
          px: 2,
          py: 1.5,
          ...sx,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            justifyContent: 'center',
          }}
        >
          <GlobeIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
        </ListItemIcon>
        <ListItemText primary={t('label')} />
      </ListItemButton>
      {menu}
    </>
  );
}
