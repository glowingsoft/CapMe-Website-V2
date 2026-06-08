import React, { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  const [fetchInterests, { data: items = [], isFetching, isError, error }] = useLazyGetAiInterestsQuery();
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

  if (isError) {
    const errorMessage = error?.data?.message || error?.message || t('chat_me.interests_empty_title');
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2.5 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{
            width: 148,
            height: 148,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, rgba(76,78,255,0.13) 0%, rgba(255,100,100,0.07) 55%, transparent 75%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box sx={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #eeeeff 0%, #fff0f0 100%)',
              border: '1.5px solid rgba(76,78,255,0.18)',
              boxShadow: '0 8px 28px rgba(76,78,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Iconify icon="solar:stars-bold-duotone" width={46} sx={{ color: '#4C4EFF' }} />
            </Box>
          </Box>
          <Box component="span" sx={{ position: 'absolute', top: 14, right: 14, width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(76,78,255,0.25)' }} />
          <Box component="span" sx={{ position: 'absolute', bottom: 18, left: 12, width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,100,100,0.3)' }} />
          <Box component="span" sx={{ position: 'absolute', top: 38, left: 8, width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(76,78,255,0.18)' }} />
        </Box>

        <Box sx={{ textAlign: 'center', px: 4 }}>
          <Typography fontWeight={700} fontSize={15} color="#111827" sx={{ mb: 0.75 }}>
            Couldn&apos;t load interests
          </Typography>
          <Typography fontSize={13} color="text.secondary" lineHeight={1.65} maxWidth={300}>
            {errorMessage}
          </Typography>
        </Box>

        <Button
          onClick={handleRefresh}
          size="small"
          startIcon={<Iconify icon="solar:refresh-bold" width={15} />}
          sx={{
            borderRadius: 99,
            px: 2.5,
            py: 0.8,
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'none',
            color: '#4C4EFF',
            border: '1.5px solid rgba(76,78,255,0.3)',
            '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
          }}
        >
          Try again
        </Button>
      </Box>
    );
  }

  if (items.length === 0) {
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
