import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { usePrivacyPolicyQuery } from 'src/store/Reducer/auth';

export default function PrivacyPolicyView() {
  const { t } = useTranslate('common');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  const { data: content, isFetching } = usePrivacyPolicyQuery();

  useEffect(() => {
    if (!isFetching) setIsLoading(false);
  }, [isFetching]);

  useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('notificationsDrawerChange', onNotificationsChange);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
    };
  }, []);

  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
  const isHtml = typeof content === 'string' && /<[a-z][\s\S]*>/i.test(content);

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 0,
        bgcolor: '#f4f5f9',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        mr: anyRightDrawerOpen ? { md: '420px' } : 0,
        transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>

        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', '&:hover': { bgcolor: '#f0f0f0' } }}
          >
            <Iconify icon="mingcute:left-line" width={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>{t('settings.privacy_label').split(' ')[0]}</Box>
              {` ${t('settings.privacy_label').split(' ').slice(1).join(' ')}`}
            </Typography>
          </Box>
        </Stack>

        {/* Card */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
              <Divider sx={{ my: 2 }} />
              {[...Array(6)].map((_, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
              {isHtml ? (
                <Box
                  sx={{
                    fontSize: 14,
                    color: 'text.secondary',
                    lineHeight: 1.85,
                    '& h1, & h2, & h3': { color: 'text.primary', fontWeight: 700, mt: 2, mb: 1 },
                    '& p': { mb: 1.5 },
                    '& ul, & ol': { pl: 3, mb: 1.5 },
                    '& li': { mb: 0.5 },
                    '& a': { color: '#4C4EFF' },
                  }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <Typography fontSize={14} color="text.secondary" lineHeight={1.85} whiteSpace="pre-wrap">
                  {content || ''}
                </Typography>
              )}
            </Box>
          )}
          <Box sx={{ pb: 3 }} />
        </Box>
      </Box>
    </Box>
  );
}
