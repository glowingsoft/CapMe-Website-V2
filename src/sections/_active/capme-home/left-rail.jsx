import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export const RAIL_WIDTH = 112;

const ITEMS = [
  { icon: 'solar:home-2-linear', label: 'Home', active: true },
  { icon: 'solar:compass-linear', label: 'Explore' },
  { icon: 'solar:chat-round-dots-linear', label: 'Chat Me' },
  { icon: 'solar:bell-linear', label: 'Notifications' },
  { icon: 'solar:user-linear', label: 'Profile' },
];

function RailItem({ icon, label, active = false }) {
  return (
    <Box sx={{ width: 86, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.9 }}>
      <IconButton
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: active ? '#5350EB' : 'transparent',
          border: active ? 'none' : '1px solid rgba(255,255,255,0.22)',
          color: '#FFFFFF',
          '&:hover': {
            bgcolor: active ? '#5350EB' : 'rgba(255,255,255,0.08)',
          },
        }}
      >
        <Iconify icon={icon} width={20} />
      </IconButton>

      <Typography
        sx={{
          color: active ? '#FFFFFF' : '#7A7A7A',
          fontFamily: 'Varela, sans-serif',
          fontSize: 12,
          lineHeight: '16px',
          width: 86,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function LeftRail() {
  return (
    <Box
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        bgcolor: '#131313',
        borderRight: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 1.8,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, alignItems: 'center' }}>
        {ITEMS.map((item) => (
          <RailItem key={item.label} icon={item.icon} label={item.label} active={item.active} />
        ))}
      </Box>
    </Box>
  );
}
