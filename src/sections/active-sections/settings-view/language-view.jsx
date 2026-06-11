import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Iconify, FlagIcon } from 'src/components/iconify';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales';

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

        {/* Back + title */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e8e8e8', '&:hover': { bgcolor: '#f5f5f5' } }}
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

        {/* Hero banner */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            mb: 3,
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          {[
            { size: 160, top: '-40px', right: '60px',  opacity: 0.12 },
            { size: 100, top: '20px',  right: '-10px', opacity: 0.10 },
            { size: 80,  bottom: '-20px', left: '40%', opacity: 0.08 },
          ].map((c, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: c.size,
                height: c.size,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                top: c.top, right: c.right, bottom: c.bottom, left: c.left,
                opacity: c.opacity,
                pointerEvents: 'none',
              }}
            />
          ))}

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900, color: '#fff', lineHeight: 1.2, mb: 0.75 }}>
                {t('language_view.banner_title')}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.80)', fontSize: 14, lineHeight: 1.6 }}>
                {t('language_view.banner_subtitle')}
              </Typography>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Iconify icon="mingcute:translate-2-line" width={30} sx={{ color: '#fff' }} />
            </Box>
          </Stack>
        </Box>

        {/* Language cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {allLangs.map((lang) => {
            const isSelected = selected === lang.value;
            const isCurrent = currentLang.value === lang.value;

            return (
              <Box
                key={lang.value}
                onClick={() => setSelected(lang.value)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2.5,
                  py: 2.25,
                  bgcolor: '#fff',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  border: isSelected
                    ? '2px solid #4C4EFF'
                    : '2px solid transparent',
                  boxShadow: isSelected
                    ? '0 6px 24px rgba(76,78,255,0.15)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                  bgcolor: isSelected ? 'rgba(76,78,255,0.03)' : '#fff',
                  '&:hover': {
                    boxShadow: isSelected
                      ? '0 6px 24px rgba(76,78,255,0.18)'
                      : '0 6px 20px rgba(0,0,0,0.10)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Current language badge */}
                {isCurrent && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#22C55E',
                      bgcolor: 'rgba(34,197,94,0.10)',
                      borderRadius: 1,
                      px: 0.8,
                      py: 0.25,
                      lineHeight: 1.6,
                      letterSpacing: 0.3,
                    }}
                  >
                    Active
                  </Box>
                )}

                {/* Flag */}
                <Box
                  sx={{
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                    lineHeight: 0,
                  }}
                >
                  <FlagIcon code={lang.countryCode} sx={{ width: 44, height: 32, display: 'block' }} />
                </Box>

                {/* Name */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#4C4EFF' : '#111',
                      lineHeight: 1.3,
                    }}
                  >
                    {lang.label}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.2 }}>
                    {lang.value.toUpperCase()}
                  </Typography>
                </Box>

                {/* Radio indicator */}
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSelected ? '#4C4EFF' : 'transparent',
                    border: isSelected ? 'none' : '1.5px solid #d1d5db',
                    transition: 'all 0.18s',
                  }}
                >
                  {isSelected && (
                    <Iconify icon="mingcute:check-line" width={13} sx={{ color: '#fff' }} />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Update button */}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={selected === currentLang.value}
            onClick={() => onChangeLang(selected)}
            startIcon={<Iconify icon="mingcute:translate-2-line" width={16} />}
            sx={{
              px: 4,
              py: 1.2,
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 2.5,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
              color: '#fff',
              boxShadow: '0 6px 20px rgba(76,78,255,0.30)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
                boxShadow: '0 8px 24px rgba(76,78,255,0.40)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                background: 'rgba(76,78,255,0.25)',
                color: 'rgba(255,255,255,0.6)',
                boxShadow: 'none',
              },
            }}
          >
            {t('language_view.update_btn')}
          </Button>
        </Stack>

      </Box>
    </Box>
  );
}
