import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import noDataSvg from 'src/assets/images/noData.svg';

// Brand color used throughout the app
const BRAND_COLOR = '#4C4EFF';

// ----------------------------------------------------------------------

export function EmptyContent({
  sx,
  imgUrl,
  action,
  filled,
  slotProps,
  description,
  title = 'No data',
  ...other
}) {
  return (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 3,
        height: 1,
        ...(filled && {
          borderRadius: 2,
          bgcolor: 'rgba(76, 78, 255, 0.04)',
          border: `dashed 1px rgba(76, 78, 255, 0.15)`,
        }),
        ...sx,
      }}
      {...other}
    >
      <Box
        component="img"
        alt="no data"
        src={imgUrl ?? noDataSvg}
        sx={{ width: 1, maxWidth: 140, opacity: 0.85, ...slotProps?.img }}
      />

      {title && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            mt: 2,
            textAlign: 'center',
            fontWeight: 700,
            color: BRAND_COLOR,
            ...slotProps?.title,
          }}
        >
          {title}
        </Typography>
      )}

      {description && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.75,
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: 280,
            ...slotProps?.description,
          }}
        >
          {description}
        </Typography>
      )}

      {action && action}
    </Stack>
  );
}
