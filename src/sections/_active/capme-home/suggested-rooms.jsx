import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export const SUGGESTED_WIDTH = 316;

const SUGGESTED = [
  { name: 'Creative Rooms', subtitle: 'Hey Creative Rooms...' },
  { name: 'Collegues', subtitle: 'Office Colleagues!!!' },
  { name: 'Finance Mania', subtitle: 'Finance Makers...' },
  { name: 'Travel Lovers', subtitle: 'Traveling Lovers...' },
  { name: 'Friends Forever', subtitle: 'Friends Zone...' },
  { name: 'Technology Lover', subtitle: 'IT Technology Lovers...' },
];

function SuggestedRow({ name, subtitle }) {
  return (
    <Box
      sx={{
        minHeight: 56,
        bgcolor: '#EFEFEF',
        borderRadius: 2.2,
        border: '1px solid #E7E7E7',
        boxShadow: '0px 2px 8px rgba(17, 17, 17, 0.04)',
        px: 1.1,
        py: 0.6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Avatar sx={{ width: 30, height: 30 }} src={`https://i.pravatar.cc/100?u=s-${name}`} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, color: '#1B1B1B', lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#A0A0A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Iconify icon="solar:heart-linear" width={16} sx={{ color: '#9D9D9D' }} />
    </Box>
  );
}

export function SuggestedRooms() {
  return (
    <Box sx={{ width: SUGGESTED_WIDTH, flexShrink: 0, px: 1.4, pt: 1.7, pb: 1.2 }}>
      <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 3, p: 1.3 }}>
        <Typography sx={{ fontFamily: 'Varela, sans-serif', fontSize: 20, lineHeight: '26px', color: '#1C1C1C' }}>
          Suggested Rooms
        </Typography>
        <Typography sx={{ color: '#8C8C8C', fontSize: 10.5, mb: 1.2 }}>
          Discover and manage your rooms.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
          {SUGGESTED.map((item) => (
            <SuggestedRow key={item.name} name={item.name} subtitle={item.subtitle} />
          ))}
        </Box>

        <Button
          variant="contained"
          sx={{
            mt: 1.4,
            height: 34,
            borderRadius: 1.5,
            width: '100%',
            bgcolor: '#5350EB',
            textTransform: 'none',
            fontSize: 13,
            '&:hover': { bgcolor: '#4744D2' },
          }}
        >
          See More
        </Button>
      </Box>
    </Box>
  );
}
