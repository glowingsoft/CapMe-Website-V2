import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NotificationCard from './components/notification-card';
import { NOTIFICATIONS } from './mock';

export default function NotificationsView() {
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  React.useEffect(() => {
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

  const unreadCount = items.filter((n) => n.read === false).length;

  const markAllRead = React.useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = React.useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', overflow: 'hidden', mr: anyRightDrawerOpen ? { md: '420px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 2, md: 4 },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1120, mx: 'auto' }}>
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>My</Box>
                {' Notifications'}
              </Typography>
              <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                Your real-time activity, all in one place.
              </Typography>
            </Box>

            <Button
              disabled={unreadCount === 0}
              onClick={markAllRead}
              sx={{
                height: 36,
                px: 2,
                borderRadius: 2,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: unreadCount === 0 ? 'rgba(0,0,0,0.06)' : '#4C4EFF',
                color: unreadCount === 0 ? 'text.disabled' : '#fff',
                '&:hover': { bgcolor: unreadCount === 0 ? 'rgba(0,0,0,0.06)' : '#3b3bd6' },
              }}
            >
              Mark all as read
            </Button>
          </Stack>

          <Stack spacing={1.7} sx={{ width: '100%' }}>
            {items.map((n) => (
              <NotificationCard key={n.id} notification={n} onClick={() => markRead(n.id)} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
