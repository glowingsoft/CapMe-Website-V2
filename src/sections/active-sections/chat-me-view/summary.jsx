import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SUMMARY } from './mock';

export default function SummaryTab() {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        boxShadow: '0px 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Typography fontSize={16} fontWeight={900} sx={{ mb: 2 }}>
        {SUMMARY.title}
      </Typography>

      <Stack spacing={2.5}>
        {SUMMARY.sections.map((s) => (
          <Box key={s.heading}>
            <Typography fontSize={13} fontWeight={900} sx={{ mb: 1 }}>
              {s.heading}
            </Typography>
            <Typography fontSize={13.5} color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {s.body}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

