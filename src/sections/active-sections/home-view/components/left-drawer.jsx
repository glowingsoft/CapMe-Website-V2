import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { toast } from 'src/components/snackbar';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import ViewAllModal from 'src/layouts/components/view-all';
import { selectUser } from 'src/store/slices/userSlice';
import { useGetHomeRoomsQuery, useToggleFavouriteRoomMutation } from 'src/store/Reducer/rooms-api';
import { useTranslate } from 'src/locales';
import LeftDrawerSkeleton from './left-drawer-skeleton';
import RoomAvatar from 'src/components/room-avatar';


const LIMIT = 10;
const DRAWER_PREVIEW = 10;

function getLastMessageDesc(lastMessage) {
  const text = lastMessage?.text_representation ?? lastMessage?.content ?? '';
  if (text) return { text, isFile: false };
  const att = lastMessage?.attachments?.[0];
  if (!att) return { text: '', isFile: false };
  const ft = att.fileType ?? '';
  const name = att.originalFileName ?? att.originalName ?? att.fileName ?? 'File';
  if (ft === 'image' || ft.startsWith('image/')) return { text: name, isFile: true, icon: 'solar:gallery-bold' };
  if (ft === 'video' || ft.startsWith('video/')) return { text: name, isFile: true, icon: 'solar:video-frame-bold' };
  if (ft === 'audio' || ft.startsWith('audio/')) return { text: name, isFile: true, icon: 'solar:music-note-bold' };
  return { text: name, isFile: true, icon: 'solar:paperclip-bold' };
}

// Handles both { body: { rooms: [...] } } and { body: [...] } API shapes
function extractRooms(data) {
  if (Array.isArray(data?.body?.rooms)) return data.body.rooms;
  if (Array.isArray(data?.body)) return data.body;
  return [];
}

function normalizeRoom(room) {
  const roomSource = room?.room && typeof room.room === 'object' ? room.room : room;
  const actualRoomId =
    (typeof room?.roomId === 'object' ? room.roomId?._id : room?.roomId)
    ?? roomSource?._id
    ?? roomSource?.id
    ?? room?._id;
  const descData = getLastMessageDesc(room?.last_message);
  return {
    id: actualRoomId,
    roomId: actualRoomId,
    membershipId: room?._id,
    name: roomSource?.name ?? room?.name ?? 'Untitled Room',
    desc: descData.text,
    descIsFile: descData.isFile,
    descIcon: descData.icon ?? null,
    icon: roomSource?.image ?? room?.image ?? '',
    unread: room?.unreadCount ?? 0,
    favorite: !!(room?.isFavorite ?? room?.is_favorite),
    is_following: (room?.is_following ?? roomSource?.is_following) === true ? true : undefined,
    is_requested: !!(room?.is_requested ?? roomSource?.is_requested),
    createdby: room?.createdby ?? roomSource?.createdby ?? '',
    visibility: roomSource?.visibility?.toLowerCase() ?? room?.visibility?.toLowerCase() ?? null,
    lastMessage: room?.last_message ?? null,
    lastMessageAt: room?.last_message?.createdAt ?? roomSource?.updatedAt ?? room?.updatedAt ?? roomSource?.createdAt ?? room?.createdAt ?? '',
  };
}

const sortByLastMessage = (list) =>
  [...list].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });

export default function LeftDrawer({ open, onToggle, activeRoomId, onRoomSelect, onCreateRoom }) {
  const { t } = useTranslate('common');
  const currentUser = useSelector(selectUser);
  const currentUserId = String(currentUser?._id ?? currentUser?.id ?? currentUser?.basicInfo?._id ?? '');
  const [tab, setTab] = useState('all');
  const [visitedTabs, setVisitedTabs] = useState({ myRooms: false, following: false });
  const [pages, setPages] = useState({ all: 1, myRooms: 1, following: 1 });
  const [accRooms, setAccRooms] = useState({ all: [], myRooms: [], following: [] });
  // 'all' starts true — it fetches immediately on mount
  const [loadingTabs, setLoadingTabs] = useState({ all: true, myRooms: false, following: false });
  // section: 'favourite' | 'other' | 'myRooms' | 'following'
  const [viewAll, setViewAll] = useState({ open: false, label: '', section: null, tabKey: 'all', search: '' });
  const [toggleFavouriteRoom] = useToggleFavouriteRoomMutation();

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

  // Accumulate pages — replace on page 1, append on subsequent pages, always sort
  useEffect(() => {
    if (allQuery.isSuccess && !allQuery.isFetching) {
      const rooms = extractRooms(allQuery.data).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        all: sortByLastMessage(pages.all === 1 ? rooms : [...prev.all, ...rooms]),
      }));
      if (pages.all === 1) setLoadingTabs((prev) => ({ ...prev, all: false }));
    }
  }, [allQuery.data, allQuery.isSuccess, allQuery.isFetching, pages.all]);

  useEffect(() => {
    if (myRoomsQuery.isSuccess && !myRoomsQuery.isFetching) {
      const rooms = extractRooms(myRoomsQuery.data).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        myRooms: sortByLastMessage(pages.myRooms === 1 ? rooms : [...prev.myRooms, ...rooms]),
      }));
      if (pages.myRooms === 1) setLoadingTabs((prev) => ({ ...prev, myRooms: false }));
    }
  }, [myRoomsQuery.data, myRoomsQuery.isSuccess, myRoomsQuery.isFetching, pages.myRooms]);

  useEffect(() => {
    if (followingQuery.isSuccess && !followingQuery.isFetching) {
      const rooms = extractRooms(followingQuery.data).map(normalizeRoom);
      setAccRooms((prev) => ({
        ...prev,
        following: sortByLastMessage(pages.following === 1 ? rooms : [...prev.following, ...rooms]),
      }));
      if (pages.following === 1) setLoadingTabs((prev) => ({ ...prev, following: false }));
    }
  }, [followingQuery.data, followingQuery.isSuccess, followingQuery.isFetching, pages.following]);

  useEffect(() => {
    const onFavouriteUpdate = (e) => {
      const { roomId, isFavourite } = e.detail ?? {};
      if (!roomId) return;
      const setFav = (list) =>
        list.map((r) => ((r.id ?? r._id) === roomId ? { ...r, favorite: isFavourite } : r));
      setAccRooms((prev) => ({
        all: setFav(prev.all),
        myRooms: setFav(prev.myRooms),
        following: setFav(prev.following),
      }));
    };
    window.addEventListener('roomFavouriteUpdate', onFavouriteUpdate);
    return () => window.removeEventListener('roomFavouriteUpdate', onFavouriteUpdate);
  }, []);

  useEffect(() => {
    const onFollowUpdate = (e) => {
      const { roomId, isFollowing, isCancelledRequest } = e.detail ?? {};
      if (!roomId || isFollowing !== false || isCancelledRequest) return;

      const removeRoom = (list) => list.filter((room) => String(room.id ?? room._id) !== String(roomId));
      setAccRooms((prev) => ({
        all: removeRoom(prev.all),
        myRooms: prev.myRooms,
        following: removeRoom(prev.following),
      }));
    };

    window.addEventListener('roomFollowUpdate', onFollowUpdate);
    return () => window.removeEventListener('roomFollowUpdate', onFollowUpdate);
  }, []);

  useEffect(() => {
    const onRoomDeleted = (e) => {
      const { roomId } = e.detail ?? {};
      if (!roomId) return;
      const removeRoom = (list) => list.filter((r) => String(r.id ?? r._id) !== String(roomId));
      setAccRooms((prev) => ({
        all: removeRoom(prev.all),
        myRooms: removeRoom(prev.myRooms),
        following: removeRoom(prev.following),
      }));
    };
    window.addEventListener('roomDeleted', onRoomDeleted);
    return () => window.removeEventListener('roomDeleted', onRoomDeleted);
  }, []);

  useEffect(() => {
    const onRoomCreated = (e) => {
      const room = e.detail;
      if (!room?._id) return;
      const normalized = {
        id: room._id,
        name: room.name ?? 'Untitled Room',
        desc: '',
        descIsFile: false,
        descIcon: null,
        icon: room.image ?? '',
        unread: 0,
        favorite: false,
        visibility: room.visibility ?? 'public',
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
      };
      setAccRooms((prev) => ({
        all: sortByLastMessage([normalized, ...prev.all.filter((r) => r.id !== normalized.id)]),
        myRooms: sortByLastMessage([normalized, ...prev.myRooms.filter((r) => r.id !== normalized.id)]),
        following: prev.following,
      }));
    };
    window.addEventListener('roomCreated', onRoomCreated);
    return () => window.removeEventListener('roomCreated', onRoomCreated);
  }, []);

  useEffect(() => {
    const onLastMessageUpdate = (e) => {
      const { roomId, message } = e.detail || {};
      if (!roomId || !message) return;
      const lastMessage = {
        text_representation: message.content ?? '',
        content: message.content ?? '',
        attachments: message.attachments ?? [],
      };
      const descData = getLastMessageDesc(lastMessage);
      const now = new Date().toISOString();
      const updateRooms = (list) => {
        const updated = list.map((r) =>
          String(r.id) === String(roomId)
            ? { ...r, desc: descData.text, descIsFile: descData.isFile, descIcon: descData.icon ?? null, lastMessageAt: now }
            : r
        );
        return sortByLastMessage(updated);
      };
      setAccRooms((prev) => ({
        all: updateRooms(prev.all),
        myRooms: updateRooms(prev.myRooms),
        following: updateRooms(prev.following),
      }));
    };
    window.addEventListener('roomLastMessageUpdate', onLastMessageUpdate);
    return () => window.removeEventListener('roomLastMessageUpdate', onLastMessageUpdate);
  }, []);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'myRooms' && !visitedTabs.myRooms) {
      setVisitedTabs((prev) => ({ ...prev, myRooms: true }));
      setLoadingTabs((prev) => ({ ...prev, myRooms: true }));
    }
    if (newTab === 'following' && !visitedTabs.following) {
      setVisitedTabs((prev) => ({ ...prev, following: true }));
      setLoadingTabs((prev) => ({ ...prev, following: true }));
    }
  };

  const handleToggleFavourite = async (room, isFav) => {
    const roomId = room.id ?? room._id;
    const next = !isFav;
    const setFav = (val) => (list) =>
      list.map((r) => ((r.id ?? r._id) === roomId ? { ...r, favorite: val } : r));
    // Optimistic update
    setAccRooms((prev) => ({
      all: setFav(next)(prev.all),
      myRooms: setFav(next)(prev.myRooms),
      following: setFav(next)(prev.following),
    }));
    try {
      await toggleFavouriteRoom(roomId).unwrap();
      window.dispatchEvent(new CustomEvent('roomFavouriteUpdate', { detail: { roomId, isFavourite: next } }));
      toast.success(next ? t('left_drawer.toast_added_fav') : t('left_drawer.toast_removed_fav'));
    } catch {
      setAccRooms((prev) => ({
        all: setFav(isFav)(prev.all),
        myRooms: setFav(isFav)(prev.myRooms),
        following: setFav(isFav)(prev.following),
      }));
      toast.error(t('left_drawer.toast_fav_error'));
    }
  };

  const handleRoomClick = (room) => {
    const clearUnread = (list) =>
      list.map((r) => (r.id === room.id ? { ...r, unread: 0 } : r));
    setAccRooms((prev) => ({
      all: clearUnread(prev.all),
      myRooms: clearUnread(prev.myRooms),
      following: clearUnread(prev.following),
    }));
    if (onRoomSelect) onRoomSelect(room);
  };


  // Derive favourite/other split for the "all" tab (already sorted by last message)
  const favourite = accRooms.all.filter((r) => r.favorite);
  const other = accRooms.all.filter((r) => !r.favorite);

  // Cross-reference sets for enriching "all" tab data
  const followingIdSet = React.useMemo(() => new Set(accRooms.following.map((r) => String(r.id))), [accRooms.following]);
  const myRoomIdSet = React.useMemo(() => new Set(accRooms.myRooms.map((r) => String(r.id))), [accRooms.myRooms]);

  // Live-derived data for the modal — enriched with follow state from cross-referencing
  const viewAllData = React.useMemo(() => {
    switch (viewAll.section) {
      case 'following':
        return accRooms.following.map((r) => ({ ...r, is_following: true }));
      case 'following_favourite':
        return accRooms.following.filter((r) => r.favorite).map((r) => ({ ...r, is_following: true }));
      case 'following_other':
        return accRooms.following.filter((r) => !r.favorite).map((r) => ({ ...r, is_following: true }));
      case 'myRooms':
        return accRooms.myRooms.map((r) => ({ ...r, createdby: r.createdby || currentUserId }));
      case 'myRooms_favourite':
        return accRooms.myRooms.filter((r) => r.favorite).map((r) => ({ ...r, createdby: r.createdby || currentUserId }));
      case 'myRooms_other':
        return accRooms.myRooms.filter((r) => !r.favorite).map((r) => ({ ...r, createdby: r.createdby || currentUserId }));
      case 'favourite':
      case 'other': {
        const list = viewAll.section === 'favourite' ? favourite : other;
        return list.map((r) => {
          const id = String(r.id);
          return {
            ...r,
            is_following: followingIdSet.has(id) ? true : r.is_following,
            createdby: myRoomIdSet.has(id) ? currentUserId : r.createdby,
          };
        });
      }
      default: return [];
    }
  }, [viewAll.section, favourite, other, accRooms.myRooms, accRooms.following, followingIdSet, myRoomIdSet, currentUserId]);

  // Pre-load following + myRooms tabs so cross-referencing works immediately
  const handleViewAll = (label, section, tabKey) => {
    setViewAll({ open: true, label, section, tabKey, search: '' });
    if (!visitedTabs.following) {
      setVisitedTabs((prev) => ({ ...prev, following: true }));
      setLoadingTabs((prev) => ({ ...prev, following: true }));
    }
    if (!visitedTabs.myRooms) {
      setVisitedTabs((prev) => ({ ...prev, myRooms: true }));
      setLoadingTabs((prev) => ({ ...prev, myRooms: true }));
    }
  };

  const handleModalLoadMore = () => {
    setPages((prev) => ({ ...prev, [viewAll.tabKey]: prev[viewAll.tabKey] + 1 }));
  };

  // Tab counts — prefer API total if available, fall back to accumulated length
  const totalCount = allQuery.data?.body?.total ?? accRooms.all.length;
  const myRoomsCount = myRoomsQuery.data?.body?.total ?? accRooms.myRooms.length;
  const followingCount = followingQuery.data?.body?.total ?? accRooms.following.length;

  // If the last fetched page returned a full batch, there may be more
  const hasMore = {
    all: extractRooms(allQuery.data).length >= LIMIT,
    myRooms: extractRooms(myRoomsQuery.data).length >= LIMIT,
    following: extractRooms(followingQuery.data).length >= LIMIT,
  };

  const isFetching = {
    all: allQuery.isFetching,
    myRooms: myRoomsQuery.isFetching,
    following: followingQuery.isFetching,
  };

  const isInitialLoad = loadingTabs[tab];

  let roomSections = [];
  if (tab === 'all') {
    roomSections = [
      { label: t('left_drawer.section_starred'), data: favourite, isFav: true, sectionKey: 'favourite', tabKey: 'all' },
      { label: t('left_drawer.section_rooms'), data: other, isFav: false, sectionKey: 'other', tabKey: 'all' },
    ];
  } else if (tab === 'myRooms') {
    const myFav = accRooms.myRooms.filter((r) => r.favorite);
    const myOther = accRooms.myRooms.filter((r) => !r.favorite);
    roomSections = [
      { label: t('left_drawer.section_starred'), data: myFav, isFav: true, sectionKey: 'myRooms_favourite', tabKey: 'myRooms' },
      { label: t('left_drawer.section_rooms'), data: myOther, isFav: false, sectionKey: 'myRooms_other', tabKey: 'myRooms' },
    ];
  } else if (tab === 'following') {
    const followFav = accRooms.following.filter((r) => r.favorite);
    const followOther = accRooms.following.filter((r) => !r.favorite);
    roomSections = [
      { label: t('left_drawer.section_starred'), data: followFav, isFav: true, sectionKey: 'following_favourite', tabKey: 'following' },
      { label: t('left_drawer.section_rooms'), data: followOther, isFav: false, sectionKey: 'following_other', tabKey: 'following' },
    ];
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
                    <Box component="span" sx={{ color: '#a5b4fc' }}>{t('left_drawer.title')}</Box>
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
                    {t('left_drawer.new')}
                  </Box>
                </Stack>
                <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
                  {t('left_drawer.subtitle')}
                </Typography>

                {/* Tabs */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  {[
                    { key: 'all', label: t('left_drawer.tab_all', { count: totalCount }) },
                    { key: 'myRooms', label: t('left_drawer.tab_my_rooms', { count: myRoomsCount }) },
                    { key: 'following', label: t('left_drawer.tab_following', { count: followingCount }) },
                  ].map((tabItem) => (
                    <Button
                      key={tabItem.key}
                      variant={tab === tabItem.key ? 'contained' : 'text'}
                      size="small"
                      onClick={() => handleTabChange(tabItem.key)}
                      sx={{
                        bgcolor: tab === tabItem.key ? '#4C4EFF' : 'transparent',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: tab === tabItem.key ? 700 : 500,
                        fontSize: 13,
                        px: 2,
                        py: 0.5,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: tab === tabItem.key ? '#3b3bd6' : 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      {tabItem.label}
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
                  <LeftDrawerSkeleton />
                ) : (
                  <>
                    {roomSections.map((section) => {
                      const activeInSection = activeRoomId
                        ? section.data.find((r) => r.id === activeRoomId)
                        : null;
                      const preview = activeInSection && !section.data.slice(0, DRAWER_PREVIEW).find((r) => r.id === activeRoomId)
                        ? [activeInSection, ...section.data.filter((r) => r.id !== activeRoomId)].slice(0, DRAWER_PREVIEW)
                        : section.data.slice(0, DRAWER_PREVIEW);

                      return (
                      <React.Fragment key={section.label}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1, mt: 2 }}
                        >
                          <Typography fontWeight={600} fontSize={15}>{section.label}</Typography>
                          {section.data.length > DRAWER_PREVIEW && (
                            <Button
                              size="small"
                              onClick={() => handleViewAll(section.label, section.sectionKey, section.tabKey ?? tab)}
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
                              {t('left_drawer.see_all')}
                            </Button>
                          )}
                        </Stack>

                        <Stack spacing={0.3} sx={{ mb: 2 }}>
                          {preview.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 3, color: '#bdbdbd', fontSize: 14 }}>
                              {t('left_drawer.no_rooms')}
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
                                  <RoomAvatar image={room.icon} name={room.name} size={38} />
                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography
                                      fontWeight={600}
                                      fontSize={15}
                                      color={activeRoomId === roomId ? '#fff' : 'inherit'}
                                      noWrap
                                    >
                                      {room.name}
                                    </Typography>
                                    {room.desc ? (
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        {room.descIsFile && room.descIcon && (
                                          <Iconify icon={room.descIcon} width={12} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                                        )}
                                        <Typography
                                          fontSize={12}
                                          color={activeRoomId === roomId ? '#e0e0e0' : '#bdbdbd'}
                                          noWrap
                                        >
                                          {room.desc}
                                        </Typography>
                                      </Stack>
                                    ) : (
                                      <Typography fontSize={12} color="#616161" noWrap>{t('left_drawer.no_messages')}</Typography>
                                    )}
                                  </Box>
                                  {room.unread > 0 && activeRoomId !== roomId && (
                                    <Box
                                      sx={{
                                        minWidth: 20,
                                        height: 20,
                                        bgcolor: '#4C4EFF',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        px: 0.7,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Typography fontSize={10} fontWeight={700} color="#fff" lineHeight={1}>
                                        {room.unread > 99 ? '99+' : room.unread}
                                      </Typography>
                                    </Box>
                                  )}
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
        currentUserId={currentUserId}
        search={viewAll.search}
        setSearch={(s) => setViewAll((prev) => ({ ...prev, search: s }))}
        hasMore={hasMore[viewAll.tabKey]}
        isLoading={isFetching[viewAll.tabKey]}
        onLoadMore={handleModalLoadMore}
      />
    </>
  );
}
