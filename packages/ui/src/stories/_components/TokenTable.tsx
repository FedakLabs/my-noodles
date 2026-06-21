import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type TokenTableColumn<T> = {
  id: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
};

export function ColorSwatch({
  value,
  size = 28,
  rounded = 1,
}: {
  value: string;
  size?: number;
  rounded?: number;
}) {
  const isHue = /^\d+$/.test(value) && Number(value) <= 360;
  const bgcolor = isHue ? `hsl(${value}, 75%, 55%)` : value;

  return (
    <Box
      sx={{
        bgcolor,
        border: 1,
        borderColor: 'divider',
        borderRadius: rounded,
        flexShrink: 0,
        height: size,
        width: size,
      }}
    />
  );
}

export function TokenTableSection<T>({
  title,
  description,
  columns,
  rows,
  getRowKey,
}: {
  title: string;
  description?: string;
  columns: TokenTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ bgcolor: 'background.paper', overflowX: 'auto' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  width={column.width}
                  align={column.align ?? 'left'}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                sx={{
                  '&:nth-of-type(even)': { bgcolor: 'grey.50' },
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align ?? 'left'} sx={{ verticalAlign: 'middle' }}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export function MonoValue({ children }: { children: string }) {
  return (
    <Typography variant="caption" component="code" sx={{ wordBreak: 'break-all' }}>
      {children}
    </Typography>
  );
}
