import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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

// ── Field components ──────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary', mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.6 }}>
      {children}
    </Typography>
  );
}

function FieldBox({ children, disabled, multiline }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        px: 2,
        py: multiline ? 1.25 : 1.25,
        mb: 2.5,
        bgcolor: disabled ? 'rgba(0,0,0,0.025)' : '#f8f9fb',
        borderRadius: 2,
        border: `1.5px solid ${disabled ? '#f0f0f0' : '#e5e7eb'}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:focus-within': {
          borderColor: '#4C4EFF',
          boxShadow: '0 0 0 3px rgba(76,78,255,0.10)',
          bgcolor: '#fff',
        },
      }}
    >
      {children}
    </Box>
  );
}

// ── Info card on the right ─────────────────────────────────────────────────────

function InfoCard({ icon, color, bg, title, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 2,
        bgcolor: '#fff',
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} sx={{ color }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.disabled', mb: 0.25 }}>{title}</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ContactUsView() {
  const { t } = useTranslate('common');
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const [contactSupport, { isLoading }] = useContactSupportMutation();

  const userName = currentUser?.name ?? currentUser?.displayName ?? currentUser?.basicInfo?.name ?? '';
  const userEmail = currentUser?.email ?? currentUser?.basicInfo?.email ?? '';

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
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
              <Box component="span" sx={{ color: '#4C4EFF' }}>{t('contact_us.title').split(' ')[0]}</Box>
              {` ${t('contact_us.title').split(' ').slice(1).join(' ')}`}
            </Typography>
            <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.3 }}>
              {t('contact_us.subtitle')}
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
          {/* decorative circles */}
          {[
            { size: 160, top: '-40px', right: '60px',  opacity: 0.12 },
            { size: 100, top: '20px',  right: '-10px',  opacity: 0.10 },
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
                top: c.top,
                right: c.right,
                bottom: c.bottom,
                left: c.left,
                opacity: c.opacity,
                pointerEvents: 'none',
              }}
            />
          ))}

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 900, color: '#fff', lineHeight: 1.2, mb: 0.75 }}>
                {t('contact_us.banner_title')}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.80)', fontSize: 14, lineHeight: 1.6 }}>
                {t('contact_us.banner_subtitle')}
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
              <Iconify icon="solar:headphones-round-sound-bold" width={30} sx={{ color: '#fff' }} />
            </Box>
          </Stack>
        </Box>

        {/* Two-column layout */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

          {/* ── Form card ── */}
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              bgcolor: '#fff',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Card header strip */}
            <Box
              sx={{
                px: 3,
                py: 2.25,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="mingcute:mail-send-line" width={18} sx={{ color: '#fff' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                  {t('contact_us.section_title')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.2 }}>
                  {t('contact_us.section_subtitle')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
              {/* Name — read-only info row */}
              <Stack direction="row" alignItems="center" spacing={1.5}
                sx={{ bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1.25, mb: 2.5 }}
              >
                <Iconify icon="mingcute:user-2-line" width={16} sx={{ color: '#4C4EFF', flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{t('contact_us.name_label')}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111' }} noWrap>{userName || '—'}</Typography>
                </Box>
              </Stack>

              {/* Email — read-only info row */}
              <Stack direction="row" alignItems="center" spacing={1.5}
                sx={{ bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1.25, mb: 2.5 }}
              >
                <Iconify icon="mingcute:mail-line" width={16} sx={{ color: '#4C4EFF', flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{t('contact_us.email_label')}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111' }} noWrap>{userEmail || '—'}</Typography>
                </Box>
              </Stack>

              {/* Subject */}
              <FieldLabel>{t('contact_us.subject_label')}</FieldLabel>
              <FieldBox>
                <Iconify icon="solar:tag-bold" width={16} sx={{ mr: 1.25, color: '#4C4EFF', flexShrink: 0 }} />
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
              <FieldBox multiline>
                <InputBase
                  fullWidth
                  multiline
                  minRows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('contact_us.message_placeholder')}
                  sx={{ fontSize: 14, pt: 0.5, '& textarea': { p: 0, color: '#111' }, alignItems: 'flex-start' }}
                />
              </FieldBox>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: { xs: 1.5, sm: 0 },
              }}
            >
              {/* Status message */}
              <Box sx={{ minHeight: 24 }}>
                {status === 'success' && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#22c55e' }} />
                    <Typography fontSize={13.5} color="#22c55e" fontWeight={600}>{t('contact_us.toast_success')}</Typography>
                  </Stack>
                )}
                {status === 'error' && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Iconify icon="solar:danger-circle-bold" width={18} sx={{ color: '#ef4444' }} />
                    <Typography fontSize={13.5} color="#ef4444" fontWeight={600}>{t('contact_us.toast_error')}</Typography>
                  </Stack>
                )}
              </Box>

              <Button
                onClick={handleSend}
                disabled={isLoading || !subject.trim() || !message.trim()}
                startIcon={!isLoading && <Iconify icon="mingcute:send-plane-fill" width={16} />}
                sx={{
                  px: 3.5,
                  py: 1.1,
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 20px rgba(76,78,255,0.30)',
                  minWidth: { xs: 'unset', sm: 140 },
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
                    boxShadow: '0 8px 24px rgba(76,78,255,0.40)',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(0,0,0,0.08)',
                    color: 'rgba(0,0,0,0.30)',
                    boxShadow: 'none',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : t('contact_us.submit')}
              </Button>
            </Box>
          </Box>

          {/* ── Right sidebar ── */}
          <Stack spacing={2} sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>

            {/* Info cards */}
            <InfoCard
              icon="solar:clock-circle-bold"
              color="#4C4EFF"
              bg="rgba(76,78,255,0.08)"
              title={t('contact_us.info_response_title')}
              value={t('contact_us.info_response_value')}
            />
            <InfoCard
              icon="mingcute:mail-line"
              color="#7B5EA7"
              bg="rgba(123,94,167,0.08)"
              title={t('contact_us.info_email_title')}
              value={t('contact_us.info_email_value')}
            />
            <InfoCard
              icon="solar:calendar-bold"
              color="#22C55E"
              bg="rgba(34,197,94,0.08)"
              title={t('contact_us.info_hours_title')}
              value={t('contact_us.info_hours_value')}
            />

            {/* Tips card */}
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:lightbulb-bold" width={18} sx={{ color: '#F59E0B' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t('contact_us.tips_title')}</Typography>
              </Box>
              <Stack spacing={1.25} sx={{ px: 2.5, py: 2 }}>
                {[
                  t('contact_us.tip_1'),
                  t('contact_us.tip_2'),
                  t('contact_us.tip_3'),
                ].map((tip, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#4C4EFF', mt: 0.75, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.55 }}>{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>

        </Box>
      </Box>
    </Box>
  );
}
