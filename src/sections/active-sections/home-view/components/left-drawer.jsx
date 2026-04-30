import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';

export default function LeftDrawer({ open, onToggle, roomsData }) {
  // Responsive width
  const drawerWidth = open ? 420 : 0;

  return (
    <>
      {/* Floating Toggle Button (always visible, position depends on open state) */}
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: 120, // 105 + 24 (matches old top + button offset)
          left: open ? 88 + (open ? drawerWidth || 420 : 0) - 24 : 70, // When open, place at drawer edge; when closed, at left edge
          bgcolor: '#4C4EFF',
          color: '#fff',
          width: 35,
          height: 35,
          zIndex: 1301,
          boxShadow: 2,
          borderRadius: '50%',
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1)',
          '&:hover': { bgcolor: '#3739b7' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Iconify icon={open ? 'mingcute:left-line' : 'mingcute:right-line'} width={24} />
      </IconButton>

      {/* Drawer */}
      <Box
        sx={{
          width: drawerWidth,
          minWidth: open ? 420 : 0,
          maxWidth: 340,
          transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
          bgcolor: '#18181B',
          color: '#fff',
          height: '100vh',
          position: 'fixed',
          top: 105,
          left: 88,
          zIndex: 1200,
          boxShadow: open ? '2px 0 16px 0 rgba(0,0,0,0.10)' : 'none',
          borderTopRightRadius: 32,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' },
        }}
      >
        {/* Drawer Content */}
        {open && (
          <Box sx={{ p: 3, pt: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Rooms
            </Typography>
            <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
              Discover and manage your rooms.
            </Typography>
            {/* Tabs */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Button variant="contained" size="small" sx={{ bgcolor: '#4C4EFF', borderRadius: 2, fontWeight: 700, fontSize: 13, px: 2, py: 0.5, minWidth: 0 }}>
                All {roomsData.allCount}
              </Button>
              <Button variant="text" size="small" sx={{ color: '#fff', fontWeight: 500, fontSize: 13, px: 1, minWidth: 0 }}>
                My Rooms {roomsData.myRooms}
              </Button>
              <Button variant="text" size="small" sx={{ color: '#fff', fontWeight: 500, fontSize: 13, px: 1, minWidth: 0 }}>
                Following {roomsData.following}
              </Button>
            </Stack>
            {/* Favourite Rooms */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, mt: 2 }}>
              <Typography fontWeight={600} fontSize={15}>
                Favourite Rooms
              </Typography>
              <Button variant="text" size="small" sx={{ color: '#bdbdbd', fontSize: 12, fontWeight: 500, minWidth: 0, p: 0 }}>
                View All
              </Button>
            </Stack>

            <Stack spacing={0.3} sx={{ mb: 2 }}>
              {roomsData.favourite.map((room) => (
                <Stack key={room.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.2 }}>
                  <Avatar src={room.icon} sx={{ width: 38, height: 38, mr: 1 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600} fontSize={15}>
                      {room.name}
                    </Typography>
                    <Typography fontSize={12} color="#bdbdbd">
                      {room.desc}
                    </Typography>
                  </Box>
                  <Iconify icon="ph:heart-fill" width={18} style={{ color: '#e53935' }} />
                </Stack>
              ))}
            </Stack>
            {/* Other Rooms */}
            <Typography fontWeight={600} fontSize={15} sx={{ mb: 1, mt: 2 }}>
              Other Rooms
            </Typography>
            <Stack spacing={0.3}>
              {roomsData.other.map((room) => (
                <Stack key={room.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.2 }}>
                  <Avatar src={room.icon} sx={{ width: 38, height: 38, mr: 1 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600} fontSize={15}>
                      {room.name}
                    </Typography>
                    <Typography fontSize={12} color="#bdbdbd">
                      {room.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </>
  );
}
