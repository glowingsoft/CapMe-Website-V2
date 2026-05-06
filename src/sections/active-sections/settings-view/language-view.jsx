import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', country: 'gb' },
  { code: 'es', label: 'Spanish', native: 'Español', country: 'es' },
  { code: 'fr', label: 'French', native: 'Français', country: 'fr' },
  { code: 'de', label: 'German', native: 'Deutsch', country: 'de' },
  { code: 'it', label: 'Italian', native: 'Italiano', country: 'it' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', country: 'id' },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu', country: 'my' },
  { code: 'ur', label: 'Urdu', native: 'اردو', country: 'pk' },
];

const flagUrl = (country) => `https://flagcdn.com/w40/${country}.png`;

export default function LanguageView() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('en');
  const [saved, setSaved] = useState('en');
  const [toast, setToast] = useState(false);
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
    setSaved(selected);
    setToast(true);
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
              <Box component="span" sx={{ color: '#4C4EFF' }}>App</Box>
              {' Language'}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Choose your preferred display language.
            </Typography>
          </Box>
        </Stack>

        {/* Language list */}
        <Box sx={{ bgcolor: '#fff', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', mb: 3 }}>
          {LANGUAGES.map((lang, i) => {
            const isSelected = selected === lang.code;
            return (
              <Box key={lang.code}>
                <Box
                  onClick={() => setSelected(lang.code)}
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
                    src={flagUrl(lang.country)}
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
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.2 }}>
                      {lang.native}
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
                {i < LANGUAGES.length - 1 && <Divider sx={{ mx: 3 }} />}
              </Box>
            );
          })}
        </Box>

        {/* Update button — right aligned */}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={selected === saved}
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
            Update Language
          </Button>
        </Stack>

      </Box>

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(false)} severity="success" variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          Language updated successfully.
        </Alert>
      </Snackbar>

    </Box>
  );
}
