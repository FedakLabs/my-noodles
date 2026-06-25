'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { cardShadow } from '@my-noodles/theme';
import { iconStyle } from '@my-noodles/ui';
import GlobeIcon from '@my-noodles/ui/icons/globe.svg';
import { useTranslations } from 'next-intl';
import { type MouseEvent, useId, useState } from 'react';

import { useSwitchLocale } from '@/hooks/locale';
import type { AppLocale } from '@/i18n/routing';

type LanguageSwitcherProps = {
  variant?: 'header' | 'drawer';
  onSwitched?: () => void;
  sx?: SxProps<Theme>;
};

export function LanguageSwitcher({ variant = 'header', onSwitched, sx }: LanguageSwitcherProps) {
  const t = useTranslations('common.language');
  const menuId = useId();
  const { switchLocale, options, locale } = useSwitchLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;
  const isDrawer = variant === 'drawer';

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleSelect = (nextLocale: AppLocale) => {
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
        horizontal: isDrawer ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: isDrawer ? 'left' : 'right',
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

  if (isDrawer) {
    return (
      <>
        <ListItemButton
          onClick={openMenu}
          aria-label={t('switchTo')}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? true : undefined}
          sx={sx}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <GlobeIcon aria-hidden style={iconStyle({ size: 22, color: 'inherit' })} />
          </ListItemIcon>
          <ListItemText primary={t('label')} />
        </ListItemButton>
        {menu}
      </>
    );
  }

  return (
    <Box sx={sx}>
      <Button
        variant="text"
        color="inherit"
        size="small"
        onClick={openMenu}
        aria-label={t('switchTo')}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        sx={{ minWidth: 'auto', px: 1 }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'inherit' }}>
          <GlobeIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
          <Typography variant="body2" component="span">
            {t('label')}
          </Typography>
        </Stack>
      </Button>
      {menu}
    </Box>
  );
}
