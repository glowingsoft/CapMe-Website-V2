import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';

const CARD_SX = {
  bgcolor: '#fff',
  borderRadius: 4,
  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
};

const CONTACT_CHANNELS = [
  {
    icon: 'mingcute:mail-line',
    label: 'Email Support',
    value: 'support@capme.app',
    sub: 'We reply within 24 hours',
  },
  {
    icon: 'mingcute:chat-2-line',
    label: 'Live Chat',
    value: 'Available in-app',
    sub: 'Mon–Fri, 9 AM – 6 PM',
  },
  {
    icon: 'mingcute:twitter-line',
    label: 'Twitter / X',
    value: '@capmeapp',
    sub: 'Quick questions & updates',
  },
];

export default function ContactUsView() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
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

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
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
              <Box component="span" sx={{ color: '#4C4EFF' }}>Contact</Box>
              {' Us'}
            </Typography>
            <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.3 }}>
              We&apos;re here to help — reach out any time.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

          {/* Left — message form */}
          <Box sx={{ flex: 1, minWidth: 0, ...CARD_SX, overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
              <Typography fontSize={15} fontWeight={700} sx={{ mb: 2 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>Send</Box>
                {' a Message'}
              </Typography>

              <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ mb: 0.8, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Subject
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1,
                  mb: 2,
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid rgba(145,145,145,0.2)',
                }}
              >
                <InputBase
                  fullWidth
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  sx={{ fontSize: 14, '& input': { p: 0 } }}
                />
              </Box>

              <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ mb: 0.8, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Message
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  mb: 2.5,
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid rgba(145,145,145,0.2)',
                  minHeight: 140,
                }}
              >
                <InputBase
                  fullWidth
                  multiline
                  minRows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  sx={{ fontSize: 14, '& textarea': { p: 0 }, alignItems: 'flex-start' }}
                />
              </Box>
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {sent ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#22c55e' }} />
                  <Typography fontSize={14} color="#22c55e" fontWeight={600}>
                    Message sent! We&apos;ll get back to you soon.
                  </Typography>
                </Stack>
              ) : (
                <Box />
              )}
              <Button
                onClick={handleSend}
                disabled={!subject.trim() || !message.trim()}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  bgcolor: '#4C4EFF',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3739b7' },
                  '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.3)' },
                }}
              >
                Send Message
              </Button>
            </Box>
          </Box>

          {/* Right — contact channels */}
          {/* <Box sx={{ flex: '0 0 260px', width: { xs: '100%', md: 260 }, ...CARD_SX, overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
              <Typography fontSize={15} fontWeight={700} sx={{ mb: 2 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>Other</Box>
                {' Ways to Reach Us'}
              </Typography>
            </Box>

            {CONTACT_CHANNELS.map((ch, i) => (
              <Box key={ch.label}>
                <Box sx={{ px: 3, py: 1.8, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: '#4C4EFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={ch.icon} width={20} sx={{ color: '#fff' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontSize={13} fontWeight={700} color="#111">{ch.label}</Typography>
                    <Typography fontSize={13} color="text.secondary" noWrap>{ch.value}</Typography>
                    <Typography fontSize={11} color="text.disabled">{ch.sub}</Typography>
                  </Box>
                </Box>
                {i < CONTACT_CHANNELS.length - 1 && <Divider sx={{ mx: 3 }} />}
              </Box>
            ))}

            <Box sx={{ pb: 2 }} />
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
}
