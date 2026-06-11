import Box from '@mui/material/Box';

import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

export function Main({ children, sx, ...other }) {
  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: '#0A0C12',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}