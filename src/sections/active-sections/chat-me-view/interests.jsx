import React, { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { useLazyGetAiInterestsQuery } from 'src/store/Reducer/ai-api';
import InterestCard from './components/interest-card';

function InterestSkeleton() {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2, md: 2.5 }, boxShadow: '0px 6px 22px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Skeleton variant="text" width="45%" height={22} />
        <Skeleton variant="text" width={30} height={22} />
      </Stack>
      <Skeleton variant="rectangular" width="100%" height={2} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton variant="rounded" width={120} height={26} sx={{ borderRadius: 999, mb: 1.5 }} />
      <Skeleton variant="text" width="90%" height={14} />
      <Skeleton variant="text" width="70%" height={14} sx={{ mb: 1.5 }} />
      <Stack direction="row" spacing={1.2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width={90} height={36} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    </Box>
  );
}

function InterestsTab() {
  const { t } = useTranslate('common');
  const [fetchInterests, { data: items = [], isFetching, isError }] = useLazyGetAiInterestsQuery();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterests().finally(() => setIsLoading(false));
  }, [fetchInterests]);

  const handleRefresh = () => fetchInterests({ refresh: true });

  if (isLoading || isFetching) {
    return (
      <Stack spacing={2.5}>
        {[1, 2, 3].map((i) => <InterestSkeleton key={i} />)}
      </Stack>
    );
  }

  if (isError || items.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 1 }}>
        <Typography fontSize={14} fontWeight={600} color="text.secondary">{t('chat_me.interests_empty_title')}</Typography>
        <Typography fontSize={13} color="text.disabled">{t('chat_me.interests_empty_subtitle')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        <Tooltip title={t('chat_me.refresh_tooltip')}>
          <IconButton
            size="small"
            onClick={handleRefresh}
            sx={{
              color: '#4C4EFF',
              bgcolor: 'rgba(76,78,255,0.08)',
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(76,78,255,0.16)' },
            }}
          >
            <Iconify icon="solar:refresh-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack spacing={2.5}>
        {items.map((it) => (
          <InterestCard
            key={it.title}
            title={it.title}
            score={it.score}
            confidence={it.confidence}
            description={it.description}
            tags={it.tags}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default memo(InterestsTab);
