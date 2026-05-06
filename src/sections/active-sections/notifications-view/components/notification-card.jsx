import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const ICON_BY_TYPE = {
  comment: 'mingcute:chat-3-line',
  like: 'ic:round-favorite-border',
  mention: 'mingcute:at-line',
  invite: 'solar:user-plus-bold',
  message: 'solar:chat-round-dots-bold',
  system: 'solar:shield-check-bold',
};

export default function NotificationCard({ notification, onClick }) {
  const icon = ICON_BY_TYPE[notification.type] ?? 'solar:bell-bold';
  const isUnread = notification.read === false;

  const handleClick = () => {
    onClick?.();
    if (notification.user) {
      window.dispatchEvent(new CustomEvent('openUserProfile', { detail: notification.user }));
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      sx={{
        bgcolor: isUnread ? 'rgba(76,78,255,0.06)' : '#fff',
        borderRadius: 3,
        px: 2,
        py: 1.8,
        boxShadow: '0px 10px 24px rgba(0,0,0,0.06)',
        border: isUnread ? '1px solid rgba(76,78,255,0.25)' : '1px solid rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s, background-color 0.12s',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0px 14px 30px rgba(0,0,0,0.08)',
        },
        '&:focus-visible': {
          outline: '2px solid rgba(76,78,255,0.45)',
          outlineOffset: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.6} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            bgcolor: isUnread ? 'rgba(76,78,255,0.14)' : 'rgba(76,78,255,0.10)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} sx={{ color: '#4C4EFF' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="baseline">
            <Typography fontSize={14.5} fontWeight={800} sx={{ pr: 1 }} noWrap>
              {notification.title}
            </Typography>
            <Typography fontSize={11.5} color="text.disabled" sx={{ flexShrink: 0 }}>
              {notification.timeAgo}
            </Typography>
          </Stack>

          <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }} noWrap>
            {notification.message}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
