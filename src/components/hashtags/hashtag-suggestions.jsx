
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
  const [activeIndex, setActiveIndex] = React.useState(0);

  const items = React.useMemo(() => {
    if (query === null) return [];
    const normalized = query.toLowerCase();
    return hashtags
      .map((h) => String(h).replace(/^#+/, ''))
      .filter((h) => h.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [hashtags, query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query, items.length]);

  React.useEffect(() => {
    if (query === null || items.length === 0) return undefined;

    const onKeyDown = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      if (event.key === 'ArrowDown') {
        setActiveIndex((prev) => (prev + 1) % items.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        return;
      }

      onPick?.(items[activeIndex]);
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [activeIndex, items, onPick, query]);

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
        {items.map((h, index) => {
          const isActive = index === activeIndex;
          return (
          <Box
            key={h}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(e) => {
              // Prevent input blur before click handler
              e.preventDefault();
              onPick?.(h);
            }}
            sx={{
              px: 1.5,
              py: 1.1,
              cursor: 'pointer',
              bgcolor: isActive ? '#e8edff' : 'transparent',
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
        );
        })}
      </Stack>
    </Paper>
  );
}

