import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import ViewAllModal from 'src/layouts/components/view-all';

export default function LeftDrawer({ open, onToggle, roomsData, activeRoomId, onRoomSelect, onCreateRoom }) {
  const [tab, setTab] = useState('all');
  const [favourite, setFavourite] = useState(roomsData.favourite);
  const [other, setOther] = useState(roomsData.other);
  const [viewAll, setViewAll] = useState({ open: false, label: '', data: [], search: '' });

  const handleToggleFavourite = (room, isFav) => {
    if (isFav) {
      setFavourite((prev) => prev.filter((r) => r.id !== room.id));
      setOther((prev) => [...prev, room]);

      showToast('Removed from favourites');
    } else {
      setOther((prev) => prev.filter((r) => r.id !== room.id));
      setFavourite((prev) => [...prev, room]);

      showToast('Added to favourites');
    }
  };


  const handleRoomClick = (room) => {
    if (onRoomSelect) onRoomSelect(room);
  };

  const [toast, setToast] = useState({
    open: false,
    message: '',
  });


  const showToast = (message) => {
    setToast({ open: true, message });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
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
          zIndex: 1300,
          boxShadow: 2,
          borderRadius: '50%',
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1)',
          '&:hover': { bgcolor: '#3739b7' },
          display: { xs: 'none', md: 'flex' },

        }}

      >
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={hideToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={hideToast}
            severity="success"
            variant="filled"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

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
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                    <Box component="span" sx={{ color: '#a5b4fc' }}>Rooms</Box>
                  </Typography>
                  <Box
                    onClick={onCreateRoom}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 2,
                      border: '1.5px solid rgba(165,180,252,0.35)',
                      color: '#a5b4fc',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.15)', borderColor: '#a5b4fc' },
                    }}
                  >
                    <Iconify icon="mingcute:add-line" width={14} />
                    New
                  </Box>
                </Stack>
                <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
                  Discover and manage your rooms.
                </Typography>

                {/* Tabs */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  {[
                    { key: 'all', label: `All (${roomsData.allCount})` },
                    { key: 'myRooms', label: `My Rooms (${roomsData.myRoomsCount ?? 0})` },
                    { key: 'following', label: `Following (${roomsData.followingCount ?? 0})` },
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
                      {section.data.length > 0 && (
                        <Button
                          size="small"
                          onClick={() => setViewAll({ open: true, label: section.label, data: section.data, search: '' })}
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#a5b4fc',
                            textTransform: 'none',
                            px: 1,
                            py: 0.3,
                            minWidth: 0,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: 'rgba(165,180,252,0.12)' },
                          }}
                        >
                          See All
                        </Button>
                      )}
                    </Stack>

                    <Stack spacing={0.3} sx={{ mb: 2 }}>
                      {section.data.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3, color: '#bdbdbd', fontSize: 14 }}>
                          No rooms found.
                        </Box>
                      ) : (
                        section.data.map((room) => {
                          const isFavourite = section.isFav || favourite.some((favRoom) => favRoom.id === room.id);

                          return (
                            <Stack
                              key={room.id}
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                              sx={{
                                p: 1.2,
                                cursor: 'pointer',
                                borderRadius: 3,
                                bgcolor: activeRoomId === room.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                                border: activeRoomId === room.id ? '2px solid #4C4EFF' : '2px solid transparent',
                                transition: 'all 0.18s',
                                '&:hover': {
                                  bgcolor: activeRoomId === room.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.06)',
                                },
                              }}
                              onClick={() => handleRoomClick(room)}
                            >
                              <Avatar
                                src={room.icon || undefined}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  mr: 1,
                                  bgcolor: '#4C4EFF',
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
                              {isFavourite ? (
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
                          );
                        })
                      )}
                    </Stack>
                  </React.Fragment>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <ViewAllModal
        open={viewAll.open}
        onClose={() => setViewAll((prev) => ({ ...prev, open: false }))}
        title={viewAll.label}
        type="rooms"
        data={viewAll.data}
        search={viewAll.search}
        setSearch={(s) => setViewAll((prev) => ({ ...prev, search: s }))}
      />
    </>
  );
}
