import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { selectUser } from 'src/store/slices/userSlice';
import { useContactSupportMutation } from 'src/store/Reducer/auth';


const CARD_SX = {
  bgcolor: '#fff',
  borderRadius: 4,
  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
};

const FieldLabel = ({ children }) => (
  <Typography fontSize={12} fontWeight={700} color="text.secondary" sx={{ mb: 0.8, textTransform: 'uppercase', letterSpacing: 0.6 }}>
    {children}
  </Typography>
);

const FieldBox = ({ children, disabled }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 1.5,
      py: 1,
      mb: 2,
      bgcolor: disabled ? 'rgba(0,0,0,0.03)' : '#fafafa',
      borderRadius: 2,
      border: '1px solid rgba(145,145,145,0.2)',
      transition: 'border-color 0.2s',
      '&:focus-within': { borderColor: '#4C4EFF' },
    }}
  >
    {children}
  </Box>
);

export default function ContactUsView() {
  const { t } = useTranslate('common');
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const [contactSupport, { isLoading }] = useContactSupportMutation();

  const userName = currentUser?.name ?? currentUser?.displayName ?? currentUser?.basicInfo?.name ?? '';
  const userEmail = currentUser?.email ?? currentUser?.basicInfo?.email ?? '';

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
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

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      await contactSupport({
        name: userName,
        email: userEmail,
        subject: subject.trim(),
        message: message.trim(),
      }).unwrap();
      setStatus('success');
      setSubject('');
      setMessage('');
      setTimeout(() => setStatus(null), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 4000);
    }
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
              <Box component="span" sx={{ color: '#4C4EFF' }}>{t('contact_us.title').split(' ')[0]}</Box>
              {` ${t('contact_us.title').split(' ').slice(1).join(' ')}`}
            </Typography>
            <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.3 }}>
              {t('contact_us.subtitle')}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'flex-start' } }}>

          {/* Form card */}
          <Box sx={{ flex: 1, minWidth: 0, ...CARD_SX, overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
              <Typography fontSize={15} fontWeight={700} sx={{ mb: 2 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>{t('contact_us.section_title').split(' ')[0]}</Box>
                {` ${t('contact_us.section_title').split(' ').slice(1).join(' ')}`}
              </Typography>

              {/* Name — auto-filled, disabled */}
              <FieldLabel>{t('contact_us.name_label')}</FieldLabel>
              <FieldBox disabled>
                <Iconify icon="mingcute:user-2-line" width={16} sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }} />
                <InputBase
                  fullWidth
                  value={userName}
                  disabled
                  sx={{ fontSize: 14, '& input': { p: 0, color: '#111', WebkitTextFillColor: '#111' } }}
                />
              </FieldBox>

              {/* Email — auto-filled, disabled */}
              <FieldLabel>{t('contact_us.email_label')}</FieldLabel>
              <FieldBox disabled>
                <Iconify icon="mingcute:mail-line" width={16} sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }} />
                <InputBase
                  fullWidth
                  value={userEmail}
                  disabled
                  sx={{ fontSize: 14, '& input': { p: 0, color: '#111', WebkitTextFillColor: '#111' } }}
                />
              </FieldBox>

              {/* Subject */}
              <FieldLabel>{t('contact_us.subject_label')}</FieldLabel>
              <FieldBox>
                <InputBase
                  fullWidth
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('contact_us.subject_placeholder')}
                  sx={{ fontSize: 14, '& input': { p: 0, color: '#111' } }}
                />
              </FieldBox>

              {/* Message */}
              <FieldLabel>{t('contact_us.message_label')}</FieldLabel>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  mb: 2.5,
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid rgba(145,145,145,0.2)',
                  minHeight: 140,
                  transition: 'border-color 0.2s',
                  '&:focus-within': { borderColor: '#4C4EFF' },
                }}
              >
                <InputBase
                  fullWidth
                  multiline
                  minRows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('contact_us.message_placeholder')}
                  sx={{ fontSize: 14, '& textarea': { p: 0, color: '#111' }, alignItems: 'flex-start' }}
                />
              </Box>
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 } }}>
              {status === 'success' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#22c55e' }} />
                  <Typography fontSize={14} color="#22c55e" fontWeight={600}>
                    {t('contact_us.toast_success')}
                  </Typography>
                </Stack>
              )}
              {status === 'error' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:danger-circle-bold" width={20} sx={{ color: '#ef4444' }} />
                  <Typography fontSize={14} color="#ef4444" fontWeight={600}>
                    {t('contact_us.toast_error')}
                  </Typography>
                </Stack>
              )}
              {!status && <Box />}

              <Button
                onClick={handleSend}
                disabled={isLoading || !subject.trim() || !message.trim()}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  bgcolor: '#4C4EFF',
                  color: '#fff',
                  minWidth: { xs: 'unset', sm: 140 },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: '#3739b7' },
                  '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.3)' },
                }}
              >
                {isLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : t('contact_us.submit')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
