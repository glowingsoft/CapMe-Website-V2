import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { useLazyGetAiSummaryQuery } from 'src/store/Reducer/ai-api';

function SummarySkeleton() {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2, md: 3 }, boxShadow: '0px 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Stack spacing={2.5}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i}>
            <Skeleton variant="text" width="30%" height={18} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="95%" height={14} />
            <Skeleton variant="text" width="80%" height={14} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default function SummaryTab() {
  const { t } = useTranslate('common');
  const [fetchSummary, { data: overviewHtml = '', isFetching, isError }] = useLazyGetAiSummaryQuery();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary().finally(() => setIsLoading(false));
  }, [fetchSummary]);

  const handleRefresh = () => fetchSummary({ refresh: true });

  if (isLoading || isFetching) return <SummarySkeleton />;

  if (isError || !overviewHtml) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1 }}>
        <Typography fontSize={14} fontWeight={600} color="text.secondary">{t('chat_me.summary_empty_title')}</Typography>
        <Typography fontSize={13} color="text.disabled">{t('chat_me.summary_empty_subtitle')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        <Tooltip title={t('chat_me.refresh_summary_tooltip')}>
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

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          boxShadow: '0px 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
          '& .gpt-response': {
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            lineHeight: 1.65,
            color: '#1a1a1a',
            fontSize: '15px',
          },
          '& .gpt-response h3': { fontSize: '15px', fontWeight: 700, marginBottom: '6px', marginTop: '18px', color: '#111' },
          '& .gpt-response h3:first-of-type': { marginTop: 0 },
          '& .gpt-response p': { marginBottom: '12px', lineHeight: 1.7 },
          '& .gpt-response ul': { paddingLeft: '22px', marginBottom: '12px' },
          '& .gpt-response li': { marginBottom: '6px', lineHeight: 1.6 },
          '& .gpt-response strong': { fontWeight: 600, color: '#0a0a0a' },
          '& .gpt-response style': { display: 'none' },
        }}
        dangerouslySetInnerHTML={{ __html: overviewHtml }}
      />
    </Box>
  );
}
