import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { logout } from 'src/store/slices/userSlice';

const GENERAL_ITEMS = [
  { label: 'App Language', icon: 'mingcute:translate-2-line', subtitle: 'English', path: paths.dashboard.settings.language },
  { label: 'Subscription', icon: 'solar:crown-bold', subtitle: 'Free plan', path: paths.dashboard.settings.subscription },
  { label: 'Knowledge Graph', icon: 'solar:graph-bold', subtitle: 'View your interest graph', path: paths.dashboard.settings.knowledgeGraph },
];

const SUPPORT_ITEMS = [
  { label: 'Contact Us', icon: 'mingcute:mail-line', subtitle: 'Get help from our team', path: paths.dashboard.settings.contact },
  { label: 'Terms & Conditions', icon: 'solar:document-text-bold', subtitle: 'Read our terms', path: paths.dashboard.settings.terms },
  { label: 'Privacy Policy', icon: 'solar:shield-bold', subtitle: 'How we handle your data', path: paths.dashboard.settings.privacy },
];

function SettingsGroup({ title, items }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography
          sx={{ fontSize: 12, fontWeight: 700, color: 'text.disabled', mb: 1.5, px: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
        >
          {title}
        </Typography>
      )}

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        }}
      >
        {items.map((item, i) => (
          <Box key={item.label}>
            <Box
              onClick={() => item.path && navigate(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                px: 3,
                py: 2,
                cursor: item.path ? 'pointer' : 'default',
                transition: 'background 0.12s',
                '&:hover': { bgcolor: item.path ? '#f8f8ff' : 'transparent' },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: '#4C4EFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={22} sx={{ color: '#fff' }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.3 }}>
                  {item.label}
                </Typography>
                {item.subtitle && (
                  <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: 0.3 }}>
                    {item.subtitle}
                  </Typography>
                )}
              </Box>

              <Iconify icon="mingcute:right-line" width={20} sx={{ color: '#bdbdbd', flexShrink: 0 }} />
            </Box>

            {i < items.length - 1 && <Divider sx={{ mx: 3 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function LogoutConfirmModal({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3.5, pb: 3, textAlign: 'center' }}>
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(229,57,53,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon="solar:logout-2-bold" width={30} style={{ color: '#e53935' }} />
          </Box>

          <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.75 }}>
            Log Out
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
            Are you sure you want to log out? You will need to sign in again to access your account.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: 'rgba(0,0,0,0.15)',
                color: 'text.primary',
                borderRadius: 2,
                py: 0.95,
                px: 2.75,
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 100,
                '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onConfirm}
              sx={{
                bgcolor: '#e53935',
                color: '#fff',
                borderRadius: 2,
                py: 0.95,
                px: 2.75,
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 100,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#c62828', boxShadow: 'none' },
              }}
            >
              Log Out
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsView() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkUserSession } = useAuthContext();

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

  const handleLogout = async () => {
    await signOut();
    dispatch(logout());
    await checkUserSession?.();
    navigate(paths.auth.jwt.signIn, { replace: true });
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: '100%', mr: anyRightDrawerOpen ? { md: '420px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 4 } }}>
        <Stack spacing={0.5} sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
            <Box component="span" sx={{ color: '#4C4EFF' }}>App</Box>
            {' Settings'}
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Manage your preferences and account options.
          </Typography>
        </Stack>

        <SettingsGroup title="General" items={GENERAL_ITEMS} />
        <SettingsGroup title="Support & Legal" items={SUPPORT_ITEMS} />

        {/* Log Out */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 12, fontWeight: 700, color: 'text.disabled', mb: 1.5, px: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            Account
          </Typography>
          <Box sx={{ bgcolor: '#fff', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
            <Box
              onClick={() => setLogoutOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                px: 3,
                py: 2,
                cursor: 'pointer',
                transition: 'background 0.12s',
                '&:hover': { bgcolor: '#fff5f5' },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(229,57,53,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:logout-2-bold" width={22} style={{ color: '#e53935' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#e53935', lineHeight: 1.3 }}>
                  Log Out
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: 0.3 }}>
                  Sign out of your account
                </Typography>
              </Box>

              <Iconify icon="mingcute:right-line" width={20} sx={{ color: '#bdbdbd', flexShrink: 0 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </Box>
  );
}
