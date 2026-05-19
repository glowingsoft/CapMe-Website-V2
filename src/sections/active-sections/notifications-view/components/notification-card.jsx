import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const TYPE_CONFIG = {
  room: {
    label: 'Room',
    icon: 'solar:users-group-rounded-bold',
    iconColor: '#4C4EFF',
    iconBg: 'rgba(76,78,255,0.10)',
    badgeBg: 'rgba(76,78,255,0.08)',
    badgeColor: '#4C4EFF',
  },
  profile: {
    label: 'Profile',
    icon: 'solar:user-bold',
    iconColor: '#10b981',
    iconBg: 'rgba(16,185,129,0.10)',
    badgeBg: 'rgba(16,185,129,0.08)',
    badgeColor: '#059669',
  },
  admin: {
    label: 'Admin',
    icon: 'solar:shield-check-bold',
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.10)',
    badgeBg: 'rgba(245,158,11,0.08)',
    badgeColor: '#d97706',
  },
  comment: {
    label: 'Comment',
    icon: 'solar:chat-round-bold',
    iconColor: '#4C4EFF',
    iconBg: 'rgba(76,78,255,0.10)',
    badgeBg: 'rgba(76,78,255,0.08)',
    badgeColor: '#4C4EFF',
  },
  like: {
    label: 'Like',
    icon: 'solar:like-bold',
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.10)',
    badgeBg: 'rgba(239,68,68,0.08)',
    badgeColor: '#dc2626',
  },
  mention: {
    label: 'Mention',
    icon: 'mingcute:at-line',
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.10)',
    badgeBg: 'rgba(139,92,246,0.08)',
    badgeColor: '#7c3aed',
  },
  message: {
    label: 'Message',
    icon: 'solar:chat-round-dots-bold',
    iconColor: '#4C4EFF',
    iconBg: 'rgba(76,78,255,0.10)',
    badgeBg: 'rgba(76,78,255,0.08)',
    badgeColor: '#4C4EFF',
  },
};

const FALLBACK_CONFIG = {
  label: 'Notification',
  icon: 'solar:bell-bold',
  iconColor: '#64748b',
  iconBg: 'rgba(100,116,139,0.10)',
  badgeBg: 'rgba(100,116,139,0.08)',
  badgeColor: '#475569',
};

export default function NotificationCard({ notification }) {
  const cfg = TYPE_CONFIG[notification.type] ?? FALLBACK_CONFIG;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        px: 2,
        py: 1.8,
        boxShadow: '0px 10px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'transform 0.12s, box-shadow 0.12s',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0px 14px 30px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Stack direction="row" spacing={1.6} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            bgcolor: cfg.iconBg,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={cfg.icon} width={20} sx={{ color: cfg.iconColor }} />
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

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                px: 0.9,
                py: 0.3,
                borderRadius: 1,
                bgcolor: cfg.badgeBg,
              }}
            >
              <Iconify icon={cfg.icon} width={11} sx={{ color: cfg.badgeColor }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: cfg.badgeColor, lineHeight: 1 }}>
                {cfg.label}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
