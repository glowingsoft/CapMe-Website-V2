import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';

const RAIL_WIDTH = 86;
const ROOMS_WIDTH = 246;
const RIGHT_WIDTH = 316;

const ROOMS = [
  { name: 'Creative Rooms', subtitle: 'Hey, how are you guyz....' },
  { name: 'Friendship Goals', subtitle: 'Hey, how are you guyz....' },
  { name: 'Music Mania', subtitle: 'Hey, how are you guyz....' },
  { name: 'Travel Lovers', subtitle: 'Hey, how are you guyz....' },
  { name: 'Health Tracker', subtitle: 'Hey, how are you guyz....' },
  { name: 'Creative Rooms', subtitle: 'Hey, how are you guyz....' },
  { name: 'Range Rover Lovers', subtitle: 'Hey, how are you guyz....' },
  { name: 'Collegues', subtitle: 'Hey, how are you guyz....' },
  { name: 'Travel Lovers', subtitle: 'Hey, how are you guyz....' },
];

const SUGGESTED = [
  'Creative Rooms',
  'Collegues',
  'Finance Mania',
  'Travel Lovers',
  'Friends Forever',
  'Technology Lover',
];

function RailItem({ icon, label, active = false }) {
  return (
    <Box sx={{ width: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
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
          fontSize: 14,
          lineHeight: '18px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function RoomsRow({ name, subtitle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
        <Avatar sx={{ width: 34, height: 34 }} src={`https://i.pravatar.cc/100?u=${name}`} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: '#F2F2F2', fontSize: 14, lineHeight: '18px' }}>{name}</Typography>
          <Typography sx={{ color: '#6F6F6F', fontSize: 10, lineHeight: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Iconify icon="mdi:star-four-points" width={14} sx={{ color: '#FFD34D', flexShrink: 0 }} />
    </Box>
  );
}

function SuggestedRow({ name }) {
  return (
    <Box
      sx={{
        height: 46,
        bgcolor: '#F1F1F1',
        borderRadius: 2,
        px: 1,
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
          <Typography sx={{ fontSize: 10, color: '#A0A0A0' }}>Traveling Lovers...</Typography>
        </Box>
      </Box>
      <Iconify icon="solar:heart-linear" width={16} sx={{ color: '#9D9D9D' }} />
    </Box>
  );
}

function PostCard({ compact = false }) {
  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
      <Box sx={{ px: 1.2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Avatar sx={{ width: 28, height: 28 }} src="https://i.pravatar.cc/100?u=alexa" />
          <Box>
            <Typography sx={{ fontSize: 13, color: '#2C2C2C', lineHeight: '16px' }}>Alexa Hales</Typography>
            <Typography sx={{ fontSize: 10, color: '#A1A1A1', lineHeight: '14px' }}>@alexa9123</Typography>
          </Box>
        </Box>
        <Iconify icon="solar:menu-dots-linear" width={16} sx={{ color: '#A6A6A6' }} />
      </Box>

      {!compact && (
        <Box
          sx={{
            height: 385,
            backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      <Box sx={{ px: 1.2, py: 1 }}>
        <Box sx={{ display: 'flex', gap: 2.2, color: '#878787' }}>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:heart-bold" width={12} sx={{ color: '#E53935' }} /> 321
          </Typography>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:chat-round-linear" width={12} /> 123
          </Typography>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:repeat-linear" width={12} sx={{ color: '#58AF55' }} /> 21
          </Typography>
        </Box>

        <Typography sx={{ mt: 0.8, fontSize: 10.5, color: '#909090' }}>
          Alexa Hales had an amazing discussion with my team about our daily targets.
        </Typography>
      </Box>
    </Box>
  );
}

export function CapmeHomeView() {
  const [roomsOpen, setRoomsOpen] = useState(true);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', minHeight: 760, display: 'flex', bgcolor: '#DDDDDF' }}>
      <Box
        sx={{
          width: RAIL_WIDTH,
          flexShrink: 0,
          bgcolor: '#131313',
          borderRight: '1px solid rgba(255,255,255,0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 1.6,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.15, alignItems: 'center' }}>
          <RailItem icon="solar:home-2-linear" label="Home" active />
          <RailItem icon="solar:compass-linear" label="Explore" />
          <RailItem icon="solar:chat-round-dots-linear" label="Chat Me" />
          <RailItem icon="solar:bell-linear" label="Notifications" />
          <RailItem icon="solar:user-linear" label="Profile" />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ height: 22, bgcolor: '#FFFFFF', flexShrink: 0 }} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
          <Box
            sx={{
              width: roomsOpen ? ROOMS_WIDTH : 0,
              transition: 'width 220ms ease',
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: '#0E0E10',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ width: ROOMS_WIDTH, p: 1.3 }}>
              <Typography sx={{ color: '#FFFFFF', fontSize: 40, fontFamily: 'Varela, sans-serif', lineHeight: '48px' }}>
                Rooms
              </Typography>
              <Typography sx={{ color: '#838383', fontSize: 10.5, mb: 1.2 }}>
                Discover and manage your rooms.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.2, mb: 1.2 }}>
                <Box sx={{ px: 1.2, py: 0.45, borderRadius: 1, bgcolor: '#5350EB', color: '#FFFFFF', fontSize: 11 }}>All 231</Box>
                <Box sx={{ px: 1.2, py: 0.45, color: '#FFFFFF', fontSize: 11 }}>My Rooms 0</Box>
                <Box sx={{ px: 1.2, py: 0.45, color: '#FFFFFF', fontSize: 11 }}>Following 0</Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'Varela, sans-serif', lineHeight: '30px' }}>
                  Starred Rooms
                </Typography>
                <Typography sx={{ color: '#FFFFFF', fontSize: 11 }}>View All</Typography>
              </Box>

              {ROOMS.map((room) => (
                <RoomsRow key={`${room.name}-${room.subtitle}`} name={room.name} subtitle={room.subtitle} />
              ))}
            </Box>
          </Box>

          <IconButton
            onClick={() => setRoomsOpen((prev) => !prev)}
            sx={{
              position: 'absolute',
              top: 30,
              left: roomsOpen ? ROOMS_WIDTH - 13 : -13,
              width: 26,
              height: 26,
              bgcolor: '#5A57FF',
              color: '#FFFFFF',
              zIndex: 5,
              '&:hover': { bgcolor: '#4B48DE' },
            }}
          >
            <Iconify icon={roomsOpen ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'} width={14} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0, px: 2.2, py: 1.7, overflow: 'auto' }}>
            <Typography sx={{ color: '#171717', fontFamily: 'Varela, sans-serif', fontSize: 44, lineHeight: '54px' }}>
              Creative Rooms
            </Typography>
            <Typography sx={{ color: '#9A9A9A', fontSize: 14, mt: 0.2, mb: 1.4 }}>
              A central place to organize meetups, coffee chats...
            </Typography>

            <Box sx={{ maxWidth: 560 }}>
              <PostCard />

              <Box sx={{ py: 1.3, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ px: 1.3, py: 0.25, borderRadius: 10, bgcolor: '#F0F0F0', color: '#6F6F6F', fontSize: 10 }}>
                  Tuesday, July 20th
                </Box>
              </Box>

              <PostCard compact />

              <Box sx={{ mt: 1.1, bgcolor: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 1.2, height: 28, display: 'flex', alignItems: 'center', px: 1 }}>
                <Box sx={{ flex: 1, color: '#B1B1B1', fontSize: 11 }}>Write a message...</Box>
                <Iconify icon="solar:arrow-right-linear" width={14} sx={{ color: '#5A57FF' }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: RIGHT_WIDTH, flexShrink: 0, px: 1.4, pt: 1.7, pb: 1.2 }}>
            <Box sx={{ bgcolor: '#EFEFEF', borderRadius: 3, p: 1.3 }}>
              <Typography sx={{ fontFamily: 'Varela, sans-serif', fontSize: 42, lineHeight: '52px', color: '#1C1C1C' }}>
                Suggested Rooms
              </Typography>
              <Typography sx={{ color: '#8C8C8C', fontSize: 11, mb: 1.2 }}>
                Discover and manage your rooms.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                {SUGGESTED.map((item) => (
                  <SuggestedRow key={item} name={item} />
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
        </Box>
      </Box>
    </Box>
  );
}
