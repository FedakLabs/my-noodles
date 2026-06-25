import { baseColors, borderRadius, cardShadow, colors, fontFamilyFallback } from '@my-noodles/theme';

const bottomRightToaster = '[data-sonner-toaster][data-x-position="right"][data-y-position="bottom"]';

export const toastGlobalStyles = {
  '[data-sonner-toaster]': {
    fontFamily: fontFamilyFallback('body'),
    '--width': '356px',
  },
  [`${bottomRightToaster} [data-sonner-toast]`]: {
    '--y': 'translateX(calc(100% + 16px))',
  },
  [`${bottomRightToaster} [data-sonner-toast][data-mounted="true"]`]: {
    '--y': 'translateX(0)',
  },
  [`${bottomRightToaster} [data-sonner-toast][data-mounted="true"][data-expanded="true"]`]: {
    '--y': 'translateY(calc(var(--lift) * var(--offset)))',
  },
  [`${bottomRightToaster} [data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]`]:
    {
      '--y': 'translateX(calc(100% + 16px))',
    },
  [`${bottomRightToaster} [data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]`]:
    {
      '--y': 'translateX(40%)',
    },
  '[data-sonner-toast].noodles-toast': {
    alignItems: 'center',
    background: colors.surface.elevated,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: `${borderRadius.utility}px`,
    boxShadow: `${cardShadow}, 0 8px 28px rgba(26, 22, 20, 0.12)`,
    color: colors.text.primary,
    gap: '10px',
    padding: '12px 14px',
  },
  '[data-sonner-toast].noodles-toast [data-title]': {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  '[data-sonner-toast].noodles-toast [data-icon]': {
    height: 20,
    width: 20,
  },
  '[data-sonner-toast].noodles-toast [data-close-button]': {
    background: colors.surface.page,
    border: `1px solid ${colors.border.subtle}`,
    color: colors.text.secondary,
    borderRadius: `${borderRadius.utility}px`,
  },
  '[data-sonner-toast][data-type="success"].noodles-toast': {
    borderColor: baseColors.teal,
    '& [data-icon]': {
      color: baseColors.teal,
    },
  },
  '[data-sonner-toast][data-type="error"].noodles-toast': {
    borderColor: baseColors.cherry,
    '& [data-icon]': {
      color: baseColors.cherry,
    },
  },
  '[data-sonner-toast][data-type="info"].noodles-toast': {
    borderColor: baseColors.navy,
    '& [data-icon]': {
      color: baseColors.navy,
    },
  },
  '[data-sonner-toast][data-type="warning"].noodles-toast': {
    borderColor: baseColors.mango,
    '& [data-icon]': {
      color: baseColors.mango,
    },
  },
  '[data-sonner-toast][data-type="loading"].noodles-toast': {
    borderColor: colors.border.strong,
    '& [data-icon]': {
      color: colors.icon.accent,
    },
  },
} as const;
