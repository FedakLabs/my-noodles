import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { CustomColors } from '@my-noodles/theme';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

import type { SvgIconProps } from '../../types';
import CartIcon from '../icons/cart.svg';

type IconCatalogEntry = {
  name: string;
  Icon: FC<SvgIconProps>;
};

type IconColorToken = keyof CustomColors['icon'];

type IconGalleryControls = {
  size: number;
  iconColor: IconColorToken;
};

const iconColorOptions = ['primary', 'secondary', 'accent'] as const satisfies readonly IconColorToken[];

const iconModules = import.meta.glob<{ default: FC<SvgIconProps> }>('../icons/*.svg', {
  eager: true,
});

function iconNameFromPath(path: string): string {
  const match = path.match(/([^/\\]+)\.svg$/);
  return match?.[1] ?? path;
}

const iconCatalog: IconCatalogEntry[] = Object.entries(iconModules)
  .map(([path, module]) => ({
    name: iconNameFromPath(path),
    Icon: module.default,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type IconPreviewProps = {
  Icon: FC<SvgIconProps>;
  size: number;
  iconColor: IconColorToken;
};

function IconPreview({ Icon, size, iconColor }: IconPreviewProps) {
  const theme = useTheme();

  return <Icon aria-hidden size={size} color={theme.colors.icon[iconColor]} />;
}

const meta = {
  title: 'Icons/All',
  args: {
    size: 28,
    iconColor: 'primary' satisfies IconColorToken,
  },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    iconColor: {
      control: 'select',
      options: iconColorOptions,
      description: 'theme.colors.icon',
    },
  },
} satisfies Meta<IconGalleryControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: (props) => {
    const { size, iconColor } = props as IconGalleryControls;
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        {iconCatalog.map(({ name, Icon }) => (
          <Stack key={name} spacing={1} sx={{ alignItems: 'center', width: 96, flexShrink: 0 }}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                height: Math.max(size + 28, 56),
                justifyContent: 'center',
                width: Math.max(size + 28, 56),
              }}
            >
              <IconPreview Icon={Icon} size={size} iconColor={iconColor} />
            </Box>
            <Typography variant="caption" sx={{ textAlign: 'center', wordBreak: 'break-word' }}>
              {name}
            </Typography>
          </Stack>
        ))}
      </Box>
    );
  },
};

export const DirectImport: Story = {
  render: function DirectImportStory(props) {
    const { size, iconColor } = props as IconGalleryControls;
    const theme = useTheme();
    const color = theme.colors.icon[iconColor as IconColorToken];
    const sizes = [size * 0.57, size, size * 1.14, size * 1.57];

    return (
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Per-icon import — only bundled when this file is imported:
        </Typography>
        <Typography variant="caption" component="code">
          {`import CartIcon from '@my-noodles/ui/icons/cart.svg';`}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {sizes.map((iconSize) => (
            <CartIcon key={iconSize} aria-hidden size={iconSize} color={color} />
          ))}
        </Stack>
      </Stack>
    );
  },
};
