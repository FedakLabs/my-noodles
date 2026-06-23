'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { cardShadow } from '@my-noodles/theme';
import { iconStyle } from '@my-noodles/ui';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import MenuIcon from '@my-noodles/ui/icons/menu.svg';
import { useTranslations } from 'next-intl';
import { type FC, type SVGProps, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useViewMode } from './catalog-view-mode-context';
import { type CatalogViewMode, DEFAULT_CATALOG_VIEW_MODE } from './view-mode';

type ViewModeOptionKey =
  | 'viewMode'
  | 'viewModeInfinite'
  | 'viewModeInfiniteDescription'
  | 'viewModePagination'
  | 'viewModePaginationDescription'
  | 'viewModeIntroTitle'
  | 'viewModeIntroDescription';

type ViewModeOption = {
  value: CatalogViewMode;
  labelKey: ViewModeOptionKey;
  descriptionKey: ViewModeOptionKey;
  Icon: FC<SVGProps<SVGSVGElement>>;
  iconTransform?: string;
};

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  {
    value: 'infinite',
    labelKey: 'viewModeInfinite',
    descriptionKey: 'viewModeInfiniteDescription',
    Icon: ChevronRightIcon,
    iconTransform: 'rotate(90deg)',
  },
  {
    value: 'pagination',
    labelKey: 'viewModePagination',
    descriptionKey: 'viewModePaginationDescription',
    Icon: ChevronRightIcon,
  },
];

type CatalogViewModeMenuProps = {
  disabled?: boolean;
};

export function CatalogViewModeMenu({ disabled }: CatalogViewModeMenuProps) {
  const t = useTranslations('catalog.filters');
  const { viewMode, setViewMode, menuOpen: contextMenuOpen, setMenuOpen } = useViewMode();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = anchorEl != null;

  const activeOption = useMemo(
    () => VIEW_MODE_OPTIONS.find((option) => option.value === viewMode) ?? VIEW_MODE_OPTIONS[0]!,
    [viewMode],
  );
  const isNonDefaultViewMode = viewMode !== DEFAULT_CATALOG_VIEW_MODE;

  useEffect(() => {
    if (contextMenuOpen && buttonRef.current) {
      setAnchorEl(buttonRef.current);
      return;
    }

    if (contextMenuOpen === false) {
      setAnchorEl(null);
    }
  }, [contextMenuOpen]);

  const handleClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        size="small"
        disabled={disabled}
        aria-label={`${t('viewMode')}: ${t(activeOption.labelKey)}`}
        aria-controls={isMenuOpen ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen ? true : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          setMenuOpen(true);
        }}
        sx={{
          color: isMenuOpen || isNonDefaultViewMode ? 'primary.main' : 'inherit',
          p: 0.25,
        }}
      >
        <MenuIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            autoFocusItem: false,
          },
          paper: {
            sx: {
              width: 'min(360px, calc(100vw - 32px))',
              minWidth: 280,
              maxWidth: 'min(360px, calc(100vw - 32px))',
              mt: 0.75,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: `${cardShadow}, 0 8px 28px rgba(26, 22, 20, 0.14)`,
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ whiteSpace: 'normal' }}>
            {t('viewModeIntroTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'normal' }}>
            {t('viewModeIntroDescription')}
          </Typography>
        </Box>

        {VIEW_MODE_OPTIONS.map((option) => {
          const selected = option.value === viewMode;
          const OptionIcon = option.Icon;

          return (
            <MenuItem
              key={option.value}
              selected={selected}
              onClick={() => {
                setViewMode(option.value);
                handleClose();
              }}
              sx={{
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.25,
                whiteSpace: 'normal',
              }}
            >
              <OptionIcon
                aria-hidden
                style={{
                  ...iconStyle({ size: 20, color: 'inherit' }),
                  marginTop: 2,
                  flexShrink: 0,
                  ...(option.iconTransform ? { transform: option.iconTransform } : {}),
                }}
              />
              <ListItemText
                primary={t(option.labelKey)}
                secondary={t(option.descriptionKey)}
                sx={{ minWidth: 0, flex: 1, m: 0 }}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: selected ? 600 : 400,
                      color: selected ? 'primary.main' : 'text.primary',
                      whiteSpace: 'normal',
                    },
                  },
                  secondary: {
                    variant: 'body2',
                    sx: {
                      whiteSpace: 'normal',
                      display: 'block',
                    },
                  },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
