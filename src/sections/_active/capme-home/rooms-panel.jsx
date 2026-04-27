import { useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export const ROOMS_WIDTH = 420;

const ROOMS = [
  { name: 'Creative Rooms', subtitle: 'Hey, how are you guyz....', isMine: true, isFollowing: true },
  { name: 'Friendship Goals', subtitle: 'Hey, how are you guyz....', isMine: false, isFollowing: true },
  { name: 'Music Mania', subtitle: 'Hey, how are you guyz....', isMine: true, isFollowing: false },
  { name: 'Travel Lovers', subtitle: 'Hey, how are you guyz....', isMine: false, isFollowing: true },
  { name: 'Health Tracker', subtitle: 'Hey, how are you guyz....', isMine: true, isFollowing: true },
  { name: 'Creative Rooms', subtitle: 'Hey, how are you guyz....', isMine: false, isFollowing: true },
  { name: 'Range Rover Lovers', subtitle: 'Hey, how are you guyz....', isMine: false, isFollowing: true },
  { name: 'Collegues', subtitle: 'Hey, how are you guyz....', isMine: false, isFollowing: false },
  { name: 'Travel Lovers', subtitle: 'Hey, how are you guyz....', isMine: true, isFollowing: true },
  { name: 'Design Circle', subtitle: 'UI critique and inspirations....', isMine: false, isFollowing: true },
  { name: 'Startup Hub', subtitle: 'Daily founders standup....', isMine: true, isFollowing: false },
  { name: 'Book Club', subtitle: 'This week: Atomic Habits....', isMine: false, isFollowing: true },
];

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
      <Iconify icon="mdi:star-four-points" width={14} sx={{ color: '#FFD34D', flexShrink: 0, outline: 'none', display: 'block' }} />
    </Box>
  );
}

function FilterTabs({ activeTab, onChange, counts }) {
  return (
    <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', mb: 1.2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.5, flexWrap: 'nowrap' }}>
        <Box
          onClick={() => onChange('all')}
          sx={{
            width: '94.31300894794215px',
            height: '36.85000523553387px',
            borderTopLeftRadius: '12.47px',
            borderTopRightRadius: '12.47px',
            bgcolor: activeTab === 'all' ? '#5350EB' : 'rgba(255,255,255,0.10)',
            transform: activeTab === 'all' ? 'rotate(-0.19deg)' : 'none',
            transformOrigin: 'center',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            pt: '9px',
            cursor: 'pointer',
          }}
        >
          <Typography
            sx={{
              width: '53.99999872805951px',
              height: '18.999999552465383px',
              color: '#FFFFFF',
              fontFamily: 'Varela, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '18.3px',
              letterSpacing: 0,
              transform: activeTab === 'all' ? 'rotate(-0.19deg)' : 'none',
              transformOrigin: 'center',
            }}
          >
            {`All ${counts.all}`}
          </Typography>
        </Box>

        <Box
          onClick={() => onChange('mine')}
          sx={{
            color: activeTab === 'mine' ? '#FFFFFF' : '#B8B8B8',
            fontFamily: 'Varela, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '18.3px',
            letterSpacing: 0,
            px: 0.6,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {`My Rooms ${counts.mine}`}
        </Box>
        <Box
          onClick={() => onChange('following')}
          sx={{
            color: activeTab === 'following' ? '#FFFFFF' : '#B8B8B8',
            fontFamily: 'Varela, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '18.3px',
            letterSpacing: 0,
            px: 0.6,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {`Following ${counts.following}`}
        </Box>
      </Box>
    </Box>
  );
}

export function RoomsPanel({ open, onToggle }) {
  const [activeTab, setActiveTab] = useState('all');

  const counts = useMemo(() => ({
    all: ROOMS.length,
    mine: ROOMS.filter((room) => room.isMine).length,
    following: ROOMS.filter((room) => room.isFollowing).length,
  }), []);

  const visibleRooms = useMemo(() => {
    if (activeTab === 'mine') return ROOMS.filter((room) => room.isMine);
    if (activeTab === 'following') return ROOMS.filter((room) => room.isFollowing);
    return ROOMS;
  }, [activeTab]);

  return (
    <>
      <Box
        sx={{
          width: open ? ROOMS_WIDTH : 0,
          transition: 'width 220ms ease',
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: '#131313',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          height: 1312,
          alignSelf: 'flex-start',
          borderTopRightRadius: 40,
          borderBottomRightRadius: 26,
        }}
      >
        <Box
          sx={{
            width: ROOMS_WIDTH,
            height: 1312,
            p: 1.25,
            borderTopRightRadius: 40,
            borderBottomRightRadius: 26,
            bgcolor: '#131313',
            overflow: 'auto',
          }}
        >
          <Typography sx={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'Varela, sans-serif', lineHeight: '28px', mb: 0.3 }}>
            Rooms
          </Typography>
          <Typography sx={{ color: '#838383', fontSize: 10.5, mb: 1.2 }}>
            Discover and manage your rooms.
          </Typography>

          <FilterTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
            <Typography sx={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Varela, sans-serif', lineHeight: '20px' }}>
              Starred Rooms
            </Typography>
            <Typography sx={{ color: '#FFFFFF', fontSize: 11 }}>View All</Typography>
          </Box>

          {visibleRooms.map((room, index) => (
            <RoomsRow key={`${room.name}-${index}`} name={room.name} subtitle={room.subtitle} />
          ))}
        </Box>
      </Box>

      <IconButton
        onClick={onToggle}
        sx={{
          position: 'absolute',
          top: 24,
          left: open ? ROOMS_WIDTH - 14 : -14,
          width: 26,
          height: 26,
          bgcolor: '#5A57FF',
          color: '#FFFFFF',
          zIndex: 5,
          '&:hover': { bgcolor: '#4B48DE' },
        }}
      >
        <Iconify icon={open ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'} width={14} />
      </IconButton>
    </>
  );
}
