
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';
import { getHashtagQuery } from './hashtag-utils';

export default function HashtagSuggestions({ value, hashtags = [], onPick }) {
  const q = React.useMemo(() => getHashtagQuery(value), [value]);
  const query = q?.query ?? null;

  const items = React.useMemo(() => {
    if (query === null) return [];
    const normalized = query.toLowerCase();
    return hashtags
      .filter((h) => h.toLowerCase().startsWith(normalized))
      .slice(0, 6);
  }, [hashtags, query]);

  if (query === null || items.length === 0) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        mt: 0.8,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid #4C4EFF22',
      }}
    >
      <Stack>
        {items.map((h) => (
          <Box
            key={h}
            onMouseDown={(e) => {
              // Prevent input blur before click handler
              e.preventDefault();
              onPick?.(h);
            }}
            sx={{
              px: 1.5,
              py: 1.1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#e8edff' },
            }}
          >
            <Chip
              icon={<Iconify icon="mdi:tag" width={16} style={{ color: '#4C4EFF' }} />}
              label={`#${h}`}
              size="small"
              sx={{
                bgcolor: '#4C4EFF',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13.5,
                px: 1.5,
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

