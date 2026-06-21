import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';

type PageContainerProps = BoxProps;

export function PageContainer({ children, sx, ...props }: PageContainerProps) {
  return (
    <Box
      component="main"
      sx={{
        width: '100%',
        maxWidth: 'lg',
        mx: 'auto',
        px: 2,
        py: 3,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
