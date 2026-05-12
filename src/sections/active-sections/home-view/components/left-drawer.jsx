import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import ViewAllModal from 'src/layouts/components/view-all';
import { useGetHomeRoomsQuery } from 'src/store/Reducer/rooms-api';

const LIMIT = 10;
const DRAWER_PREVIEW = 5;

function normalizeRoom(room) {
  return {
    id: room?._id,
    name: room?.name ?? 'Untitled Room',
    desc: room?.last_message?.text_representation ?? room?.last_message?.content ?? '',
    icon: room?.image ?? '',
    unread: room?.unreadCount ?? 0,
    favorite: !!room?.is_favorite,
    lastMessage: room?.last_message ?? null,
  };
}

export default function LeftDrawer({ open, onToggle, activeRoomId, onRoomSelect, onCreateRoom }) {
  const [tab, setTab] = useState('all');
  const [visitedTabs, setVisitedTabs] = useState({ myRooms: false, following: false });
  const [pages, setPages] = useState({ all: 1, myRooms: 1, following: 1 });
  const [accRooms, setAccRooms] = useState({ all: [], myRooms: [], following: [] });
  // section: 'favourite' | 'other' | 'myRooms' | 'following'
  const [viewAll, setViewAll] = useState({ open: false, label: '', section: null, tabKey: 'all', search: '' });
  const [toast, setToast] = useState({ open: false, message: '' });

  // "all" always active; myRooms/following are lazy — only fire once the tab is first visited
  const allQuery = useGetHomeRoomsQuery({ page: pages.all, limit: LIMIT, type: 'all' });
  const myRoomsQuery = useGetHomeRoomsQuery(
    { page: pages.myRooms, limit: LIMIT, type: 'myrooms' },
    { skip: !visitedTabs.myRooms }
  );
  const followingQuery = useGetHomeRoomsQuery(
    { page: pages.following, limit: LIMIT, type: 'following' },
    { skip: !visitedTabs.following }
  );

  // Accumulate pages — replace on page 1, append on subsequent pages
  useEffect(() => {
    if (allQuery.isSuccess && !allQuery.isFetching) {
      const rooms = (allQuery.data?.body?.rooms ?? []).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        all: pages.all === 1 ? rooms : [...prev.all, ...rooms],
      }));
    }
  }, [allQuery.data, allQuery.isSuccess, allQuery.isFetching, pages.all]);

  useEffect(() => {
    if (myRoomsQuery.isSuccess && !myRoomsQuery.isFetching) {
      const rooms = (myRoomsQuery.data?.body?.rooms ?? []).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        myRooms: pages.myRooms === 1 ? rooms : [...prev.myRooms, ...rooms],
      }));
    }
  }, [myRoomsQuery.data, myRoomsQuery.isSuccess, myRoomsQuery.isFetching, pages.myRooms]);

  useEffect(() => {
    if (followingQuery.isSuccess && !followingQuery.isFetching) {
      const rooms = (followingQuery.data?.body?.rooms ?? []).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        following: pages.following === 1 ? rooms : [...prev.following, ...rooms],
      }));
    }
  }, [followingQuery.data, followingQuery.isSuccess, followingQuery.isFetching, pages.following]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'myRooms') setVisitedTabs((prev) => ({ ...prev, myRooms: true }));
    if (newTab === 'following') setVisitedTabs((prev) => ({ ...prev, following: true }));
  };

  const handleToggleFavourite = (room, isFav) => {
    const toggle = (list) =>
      list.map((r) =>
        (r.id ?? r._id) === (room.id ?? room._id) ? { ...r, favorite: !isFav } : r
      );
    setAccRooms((prev) => ({
      all: toggle(prev.all),
      myRooms: toggle(prev.myRooms),
      following: toggle(prev.following),
    }));
    showToast(isFav ? 'Removed from favourites' : 'Added to favourites');
  };

  const handleRoomClick = (room) => {
    if (onRoomSelect) onRoomSelect(room);
  };

  const showToast = (msg) => setToast({ open: true, message: msg });
  const hideToast = () => setToast((prev) => ({ ...prev, open: false }));

  // Derive favourite/other split for the "all" tab
  const favourite = accRooms.all.filter((r) => r.favorite);
  const other = accRooms.all.filter((r) => !r.favorite);

  // Live-derived data for the modal — updates as more pages load
  const viewAllData = React.useMemo(() => {
    switch (viewAll.section) {
      case 'favourite': return favourite;
      case 'other': return other;
      case 'myRooms': return accRooms.myRooms;
      case 'following': return accRooms.following;
      default: return [];
    }
  }, [viewAll.section, favourite, other, accRooms.myRooms, accRooms.following]);

  const handleModalLoadMore = () => {
    setPages((prev) => ({ ...prev, [viewAll.tabKey]: prev[viewAll.tabKey] + 1 }));
  };

  // Tab counts — prefer API total if available, fall back to accumulated length
  const totalCount = allQuery.data?.body?.total ?? accRooms.all.length;
  const myRoomsCount = myRoomsQuery.data?.body?.total ?? accRooms.myRooms.length;
  const followingCount = followingQuery.data?.body?.total ?? accRooms.following.length;

  // If the last fetched page returned a full batch, there may be more
  const hasMore = {
    all: (allQuery.data?.body?.rooms?.length ?? 0) >= LIMIT,
    myRooms: (myRoomsQuery.data?.body?.rooms?.length ?? 0) >= LIMIT,
    following: (followingQuery.data?.body?.rooms?.length ?? 0) >= LIMIT,
  };

  const isFetching = {
    all: allQuery.isFetching,
    myRooms: myRoomsQuery.isFetching,
    following: followingQuery.isFetching,
  };

  // Is this the very first load (no data yet + currently fetching)?
  const isInitialLoad = isFetching[tab] && accRooms[tab]?.length === 0;

  let roomSections = [];
  if (tab === 'all') {
    roomSections = [
      { label: 'Starred Rooms', data: favourite, isFav: true },
      { label: 'Rooms', data: other, isFav: false },
    ];
  } else if (tab === 'myRooms') {
    roomSections = [{ label: 'My Rooms', data: accRooms.myRooms, isFav: false }];
  } else if (tab === 'following') {
    roomSections = [{ label: 'Following', data: accRooms.following, isFav: false }];
  }

  const drawerWidth = open ? 420 : 0;

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
          height: 'calc(100vh - 105px)',
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
                    { key: 'all', label: `All (${totalCount})` },
                    { key: 'myRooms', label: `My Rooms (${myRoomsCount})` },
                    { key: 'following', label: `Following (${followingCount})` },
                  ].map((t) => (
                    <Button
                      key={t.key}
                      variant={tab === t.key ? 'contained' : 'text'}
                      size="small"
                      onClick={() => handleTabChange(t.key)}
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
                {isInitialLoad ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={28} sx={{ color: '#a5b4fc' }} />
                  </Box>
                ) : (
                  <>
                    {roomSections.map((section) => {
                      const sectionKey = section.isFav ? 'favourite' : tab === 'all' ? 'other' : tab;
                      const activeInSection = activeRoomId
                        ? section.data.find((r) => (r.id ?? r._id) === activeRoomId)
                        : null;
                      const preview = activeInSection
                        ? [activeInSection, ...section.data.filter((r) => (r.id ?? r._id) !== activeRoomId)].slice(0, DRAWER_PREVIEW)
                        : section.data.slice(0, DRAWER_PREVIEW);

                      return (
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
                              onClick={() =>
                                setViewAll({ open: true, label: section.label, section: sectionKey, tabKey: tab, search: '' })
                              }
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
                          {preview.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 3, color: '#bdbdbd', fontSize: 14 }}>
                              No rooms found.
                            </Box>
                          ) : (
                            preview.map((room) => {
                              const roomId = room.id ?? room._id;
                              const isFavourite = section.isFav || room.favorite;

                              return (
                                <Stack
                                  key={roomId}
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.5}
                                  sx={{
                                    p: 1.2,
                                    cursor: 'pointer',
                                    borderRadius: 3,
                                    bgcolor: activeRoomId === roomId ? 'rgba(255,255,255,0.06)' : 'transparent',
                                    border: activeRoomId === roomId ? '2px solid #4C4EFF' : '2px solid transparent',
                                    transition: 'all 0.18s',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.06)',
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
                                      color={activeRoomId === roomId ? '#fff' : 'inherit'}
                                      noWrap
                                    >
                                      {room.name}
                                    </Typography>
                                    <Typography
                                      fontSize={12}
                                      color={activeRoomId === roomId ? '#e0e0e0' : '#bdbdbd'}
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
                      );
                    })}
                  </>
                )}
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
        data={viewAllData}
        search={viewAll.search}
        setSearch={(s) => setViewAll((prev) => ({ ...prev, search: s }))}
        hasMore={hasMore[viewAll.tabKey]}
        isLoading={isFetching[viewAll.tabKey]}
        onLoadMore={handleModalLoadMore}
      />
    </>
  );
}
