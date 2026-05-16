import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales';

const flagUrl = (countryCode) => `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

export default function LanguageView() {
  const navigate = useNavigate();
  const { t, onChangeLang, currentLang } = useTranslate('common');
  const [selected, setSelected] = useState(currentLang.value);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

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

  const handleUpdate = () => {
    onChangeLang(selected);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: '#f4f5f9',
        height: 'calc(100vh - 105px)',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        mr: anyRightDrawerOpen ? { md: '420px' } : 0,
        transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 4 } }}>

        {/* Back header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 2,
              width: 36,
              height: 36,
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            <Iconify icon="mingcute:left-line" width={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>{t('language_view.title').split(' ')[0]}</Box>
              {` ${t('language_view.title').split(' ').slice(1).join(' ')}`}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              {t('language_view.subtitle')}
            </Typography>
          </Box>
        </Stack>

        {/* Language list */}
        <Box sx={{ bgcolor: '#fff', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', mb: 3 }}>
          {allLangs.map((lang, i) => {
            const isSelected = selected === lang.value;
            return (
              <Box key={lang.value}>
                <Box
                  onClick={() => setSelected(lang.value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    py: 1.75,
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                    bgcolor: isSelected ? 'rgba(76,78,255,0.04)' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'rgba(76,78,255,0.06)' : '#f8f8f8' },
                  }}
                >
                  {/* Flag image */}
                  <Box
                    component="img"
                    src={flagUrl(lang.countryCode)}
                    alt={lang.label}
                    sx={{
                      width: 36,
                      height: 26,
                      borderRadius: 1,
                      objectFit: 'cover',
                      flexShrink: 0,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    }}
                  />

                  {/* Labels */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#4C4EFF' : '#111', lineHeight: 1.3 }}>
                      {lang.label}
                    </Typography>
                  </Box>

                  {/* Selection indicator */}
                  {isSelected ? (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#4C4EFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="mingcute:check-line" width={14} style={{ color: '#fff' }} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '1.5px solid #e0e0e0',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
                {i < allLangs.length - 1 && <Divider sx={{ mx: 3 }} />}
              </Box>
            );
          })}
        </Box>

        {/* Update button — right aligned */}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={selected === currentLang.value}
            onClick={handleUpdate}
            sx={{
              bgcolor: '#4C4EFF',
              color: '#fff',
              borderRadius: 2,
              px: 4,
              py: 1.2,
              fontWeight: 700,
              fontSize: 14,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#3739b7', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
            }}
          >
            {t('language_view.update_btn')}
          </Button>
        </Stack>

      </Box>


    </Box>
  );
}
