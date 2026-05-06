import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

function InterestCard({ title, score, confidence, description, tags = [] }) {
  const safeScore = Math.max(0, Math.min(100, Number(score ?? 0)));

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        p: { xs: 2, md: 2.5 },
        boxShadow: '0px 6px 22px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={16} fontWeight={800} noWrap>
            {title}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexShrink: 0 }}>
          <Typography fontSize={12} fontWeight={800} color="#4C4EFF">
            {safeScore}
          </Typography>
          <IconButton size="small" sx={{ p: 0.3, color: '#4C4EFF' }}>
            <Iconify icon="ph:dots-three-horizontal-bold" width={18} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Score bar */}
      <Box
        sx={{
          mt: 1,
          height: 2,
          width: '100%',
          borderRadius: 2,
          bgcolor: 'rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ height: '100%', width: `${safeScore}%`, bgcolor: '#4C4EFF' }} />
      </Box>

      {/* Confidence */}
      <Box sx={{ mt: 1.3 }}>
        <Chip
          icon={<Iconify icon="solar:heart-bold" width={16} />}
          label={`Confidence: ${confidence}%`}
          sx={{
            height: 26,
            borderRadius: 999,
            bgcolor: '#4C4EFF',
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            '& .MuiChip-icon': { color: '#fff', ml: 0.8 },
            '& .MuiChip-label': { px: 1.2 },
          }}
        />
      </Box>

      {/* Description */}
      <Typography fontSize={13.5} color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
        {description}
      </Typography>

      {/* Tags */}
      <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ mt: 2 }}>
        {tags.map((t) => (
          <Box
            key={t}
            sx={{
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              bgcolor: '#f3f3f4',
              fontWeight: 800,
              fontSize: 12.5,
              minWidth: 120,
              textAlign: 'center',
            }}
          >
            {t}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default memo(InterestCard);
