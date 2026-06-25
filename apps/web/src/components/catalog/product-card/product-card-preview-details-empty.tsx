import Typography from '@mui/material/Typography';

type ProductCardPreviewDetailsEmptyProps = {
  message: string;
};

export function ProductCardPreviewDetailsEmpty({ message }: ProductCardPreviewDetailsEmptyProps) {
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
