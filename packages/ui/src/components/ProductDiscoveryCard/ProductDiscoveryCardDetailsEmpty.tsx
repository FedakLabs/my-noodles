import Typography from '@mui/material/Typography';

export type ProductDiscoveryCardDetailsEmptyProps = {
  message: string;
};

export function ProductDiscoveryCardDetailsEmpty({ message }: ProductDiscoveryCardDetailsEmptyProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        lineHeight: 1.55,
        fontWeight: 500,
        textAlign: 'center',
        py: 1,
        px: 0.5,
      }}
    >
      {message}
    </Typography>
  );
}
