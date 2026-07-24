import Box from '@mui/material/Box';
import { layoutDisplay } from '@my-noodles/theme';

import { ADMIN_HEADER_HEIGHT, ADMIN_SIDEBAR_WIDTH } from './admin-nav-config';
import { AdminNavPanel } from './admin-nav-panel';

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: ADMIN_SIDEBAR_WIDTH,
        height: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Box sx={{ flex: '1 1 auto', overflow: 'auto', alignSelf: 'stretch' }}>
        <AdminNavPanel onNavigate={onNavigate} />
      </Box>
    </Box>
  );
}

/** Permanent desktop sidebar rail. */
export function AdminDesktopSidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: layoutDisplay.desktopOnlyFlex,
        flexDirection: 'column',
        flexShrink: 0,
        width: ADMIN_SIDEBAR_WIDTH,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
        position: 'sticky',
        top: ADMIN_HEADER_HEIGHT,
        alignSelf: 'flex-start',
        height: `calc(100dvh - ${ADMIN_HEADER_HEIGHT}px)`,
      }}
    >
      <AdminSidebar />
    </Box>
  );
}
