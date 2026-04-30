import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import UnfollowModal from './unfollow-modal';
import RoomInformation from './room-information';

// Placeholder members — swap with real room.members when API is ready
const MOCK_MEMBERS = [
  { avatar: 'https://i.pravatar.cc/40?img=1' },
  { avatar: 'https://i.pravatar.cc/40?img=2' },
  { avatar: 'https://i.pravatar.cc/40?img=3' },
];

export default function RoomChannelHeader({ room, memberCount = 12, members = MOCK_MEMBERS, onRoomInfoOpenChange }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [unfollowOpen, setUnfollowOpen] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const [roomInfoOpen, setRoomInfoOpen] = useState(false);

  const setRoomInfoOpenNotify = (val) => {
    setRoomInfoOpen(val);
    onRoomInfoOpenChange?.(val);
  };

  const menuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenRoomInformation = () => {
    handleCloseMenu();
    setRoomInfoOpenNotify(true);
  };

  const handleCloseRoomInformation = () => {
    setRoomInfoOpenNotify(false);
  };

  const handleOpenUnfollowModal = () => {
    handleCloseMenu();
    setUnfollowOpen(true);
  };

  const handleCloseUnfollowModal = () => {
    if (unfollowLoading) return;
    setUnfollowOpen(false);
  };

  const handleConfirmUnfollow = async () => {
    try {
      setUnfollowLoading(true);

      // TODO: Call your unfollow API here
      console.log('Unfollow room:', room?._id);

      setUnfollowOpen(false);
    } catch (error) {
      console.error('Failed to unfollow room:', error);
    } finally {
      setUnfollowLoading(false);
    }
  };

  const menuItems = [
    {
      label: 'Room Information',
      icon: 'material-symbols:info-rounded',
      onClick: handleOpenRoomInformation,
    },
    {
      label: 'Following',
      icon: 'mdi:account-star',
      onClick: handleOpenUnfollowModal,
    },
    {
      label: 'Share',
      icon: 'mingcute:share-forward-fill',
      onClick: () => {
        handleCloseMenu();
        console.log('Share');
      },
    },
    {
      label: 'Report',
      icon: 'material-symbols:report-rounded',
      onClick: () => {
        handleCloseMenu();
        console.log('Report');
      },
    },
  ];

  return (
    <>
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1,
          mb: 2,
          bgcolor: '#18181B',
          borderRadius: 2.5,
        }}
      >
        {/* Left: room name */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontWeight={700} fontSize={15} color="#fff" sx={{ letterSpacing: 0.1 }}>
            {room?.name}
          </Typography>
        </Stack>

        {/* Right: stacked avatars + count + divider + action icons */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
            {members.slice(0, 3).map((m, i) => (
              <Avatar
                key={i}
                src={m.avatar}
                sx={{
                  width: 26,
                  height: 26,
                  ml: i === 0 ? 0 : '-8px',
                  border: '2px solid #18181B',
                  zIndex: 3 - i,
                }}
              />
            ))}
          </Box>

          <Typography fontSize={13} fontWeight={600} color="#fff" sx={{ mr: 1 }}>
            {memberCount}
          </Typography>

          <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

          <IconButton size="small" sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}>
            <Iconify icon="mingcute:down-line" width={16} />
          </IconButton>

          <IconButton size="small" sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}>
            <Iconify icon="meteocons:star-fill" width={22} />
          </IconButton>

          <IconButton size="small" sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}>
            <Iconify icon="eva:search-fill" width={19} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleOpenMenu}
            sx={{
              color: menuOpen ? '#fff' : '#bdbdbd',
              '&:hover': { color: '#fff' },
            }}
          >
            <Iconify icon="ph:dots-three-vertical-bold" width={18} />
          </IconButton>
        </Stack>
      </Box>

      <Popover
        open={menuOpen}
        anchorEl={menuAnchor}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 230,
            borderRadius: 2.5,
            overflow: 'visible',
            boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              right: 18,
              width: 18,
              height: 18,
              bgcolor: '#fff',
              transform: 'rotate(45deg)',
              boxShadow: '-3px -3px 5px rgba(0,0,0,0.03)',
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, position: 'relative', zIndex: 1, bgcolor: '#fff', borderRadius: 2.5 }}>
          {menuItems.map((item, index) => (
            <Box key={item.label}>
              <Box
                onClick={item.onClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.08)',
                  },
                }}
              >
                <Iconify icon={item.icon} width={22} sx={{ color: '#4F46E5' }} />

                <Typography fontSize={15} fontWeight={500} color="#111827">
                  {item.label}
                </Typography>
              </Box>

              {index !== menuItems.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      </Popover>

      <UnfollowModal
        open={unfollowOpen}
        onClose={handleCloseUnfollowModal}
        onConfirm={handleConfirmUnfollow}
        roomName={room?.name || 'this room'}
        loading={unfollowLoading}
      />

      <RoomInformation
        open={roomInfoOpen}
        onClose={handleCloseRoomInformation}
        room={room}
      />
    </>
  );
}