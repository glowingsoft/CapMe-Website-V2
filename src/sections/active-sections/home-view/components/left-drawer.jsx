import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';

export default function LeftDrawer({ open, onToggle, roomsData, activeRoomId, onRoomSelect }) {
  const [tab, setTab] = useState('all');
  const [favourite, setFavourite] = useState(roomsData.favourite);
  const [other, setOther] = useState(roomsData.other);

  const handleToggleFavourite = (room, isFav) => {
    if (isFav) {
      setFavourite((prev) => prev.filter((r) => r.id !== room.id));
      setOther((prev) => [...prev, room]);
    } else {
      setOther((prev) => prev.filter((r) => r.id !== room.id));
      setFavourite((prev) => [...prev, room]);
    }
  };

  const handleRoomClick = (room) => {
    if (onRoomSelect) onRoomSelect(room);
  };

  const drawerWidth = open ? 420 : 0;

  let roomList = [];
  if (tab === 'all') {
    roomList = [
      { label: 'Starred Rooms', data: favourite, isFav: true },
      { label: 'Rooms', data: other, isFav: false },
    ];
  } else if (tab === 'myRooms') {
    roomList = [
      { label: 'My Rooms', data: roomsData.myRooms || [], isFav: false },
    ];
  } else if (tab === 'following') {
    roomList = [
      { label: 'Following', data: roomsData.following || [], isFav: false },
    ];
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: 120,
          left: open ? 88 + drawerWidth - 24 : 70,
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
          transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
          bgcolor: '#18181B',
          color: '#fff',
          height: 'calc(100vh - 105px)',  // ← exact height, no overflow onto page
          position: 'fixed',
          top: 105,
          left: 88,
          zIndex: 1200,
          boxShadow: open ? '2px 0 16px 0 rgba(0,0,0,0.10)' : 'none',
          borderTopRightRadius: 32,
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {open && (
            <>
              {/* Fixed header */}
              <Box sx={{ p: 3, pt: 4, flexShrink: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Rooms
                </Typography>
                <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
                  Discover and manage your rooms.
                </Typography>

                {/* Tabs */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  {[
                    { key: 'all', label: `All ${roomsData.allCount}` },
                    { key: 'myRooms', label: `My Rooms ${roomsData.myRoomsCount ?? 0}` },
                    { key: 'following', label: `Following ${roomsData.followingCount ?? 0}` },
                  ].map((t) => (
                    <Button
                      key={t.key}
                      variant={tab === t.key ? 'contained' : 'text'}
                      size="small"
                      onClick={() => setTab(t.key)}
                      sx={{
                        bgcolor: tab === t.key ? '#4C4EFF' : 'transparent',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: tab === t.key ? 700 : 500,
                        fontSize: 13,
                        px: 2,
                        py: 0.5,
                        minWidth: 0,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: tab === t.key ? '#3b3bd6' : 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      {t.label}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Scrollable room list */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  px: 3,
                  pb: 3,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                  '&::-webkit-scrollbar': { width: '3px' },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                  },
                }}
              >
                {roomList.map((section) => (
                  <React.Fragment key={section.label}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1, mt: 2 }}
                    >
                      <Typography fontWeight={600} fontSize={15}>
                        {section.label}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.3} sx={{ mb: 2 }}>
                      {section.data.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3, color: '#bdbdbd', fontSize: 14 }}>
                          No rooms found.
                        </Box>
                      ) : (
                        section.data.map((room) => (
                          <Stack
                            key={room.id}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{
                              p: 1.2,
                              cursor: 'pointer',
                              borderRadius: 2,
                              bgcolor: activeRoomId === room.id ? '#4C4EFF' : 'transparent',
                              border: activeRoomId === room.id ? '1px solid #4C4EFF' : '1px solid transparent',
                              transition: 'all 0.15s',
                              '&:hover': {
                                bgcolor: activeRoomId === room.id ? '#4C4EFF' : 'rgba(255,255,255,0.06)',
                              },
                            }}
                            onClick={() => handleRoomClick(room)}
                          >
                            <Avatar
                              src={room.icon || undefined}   // ← undefined forces fallback, empty string doesn't
                              sx={{
                                width: 38,
                                height: 38,
                                mr: 1,
                                bgcolor: activeRoomId === room.id ? 'rgba(255,255,255,0.2)' : '#3f3f46',
                                fontSize: 15,
                                fontWeight: 700,
                                color: '#fff',
                              }}
                            >
                              {room.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                fontWeight={600}
                                fontSize={15}
                                color={activeRoomId === room.id ? '#fff' : 'inherit'}
                                noWrap
                              >
                                {room.name}
                              </Typography>
                              <Typography
                                fontSize={12}
                                color={activeRoomId === room.id ? '#e0e0e0' : '#bdbdbd'}
                                noWrap
                              >
                                {room.desc}
                              </Typography>
                            </Box>
                            {section.isFav ? (
                              <IconButton
                                onClick={(e) => { e.stopPropagation(); handleToggleFavourite(room, true); }}
                                sx={{ p: 0.5 }}
                              >
                                <Iconify icon="meteocons:star-fill" width={28} style={{ color: '#e53935' }} />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={(e) => { e.stopPropagation(); handleToggleFavourite(room, false); }}
                                sx={{ p: 0.5 }}
                              >
                                <Iconify icon="meteocons:star" width={28} style={{ color: '#bdbdbd' }} />
                              </IconButton>
                            )}
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </React.Fragment>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}