import { useCallback, useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { stats, following, friends, roomsData } from './account-mockdata';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { closeOverlayDrawers } from 'src/utils/drawer-events';

import { _mock } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { AnimateAvatar } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { useMockedUser } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { UpgradeBlock } from './nav-upgrade';
import AccountEditModal from './account-edit-modal';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import ViewAllModal from './view-all';
import ImagePreviewDialog from 'src/sections/active-sections/home-view/components/image-preview-dialog';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], sx, ...other }) {
  const theme = useTheme();

  const router = useRouter();

  const pathname = usePathname();

  const { user } = useMockedUser();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0: Rooms, 1: Friends, 2: Following
  const [search, setSearch] = useState('');
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  // Mock data is now imported from account-mockdata.js
  const [editOpen, setEditOpen] = useState(false);

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleEditSave = (form) => {
    // TODO: Save logic here
    // e.g., update user profile
  };

  // 3-state cycle: undefined → 'requested' → 'active' → undefined
  const [followedItems, setFollowedItems] = useState({});
  const cycleFollow = (key) =>
    setFollowedItems((prev) => {
      const cur = prev[key];
      const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
      return { ...prev, [key]: next };
    });

  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [viewType, setViewType] = useState('rooms');
  const [viewSearch, setViewSearch] = useState('');
  const handleOpenViewAll = (type) => {
    setViewType(type);
    setViewAllOpen(true);
    setViewSearch(''); // reset search
  };

  const handleCloseViewAll = () => {
    setViewAllOpen(false);
  };


  useEffect(() => {
    const handler = () => {
      setOpen(false);
      window.dispatchEvent(new CustomEvent('accountDrawerChange', { detail: false }));
    };
    window.addEventListener('closeAccountDrawer', handler);
    return () => window.removeEventListener('closeAccountDrawer', handler);
  }, []);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
    window.dispatchEvent(new CustomEvent('accountDrawerChange', { detail: true }));
    window.dispatchEvent(new Event('accountDrawerOpened'));
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('accountDrawerChange', { detail: false }));
  }, []);

  const handleClickItem = useCallback(
    (path) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );


  const renderAvatar = (
    <AnimateAvatar
      width={120}
      slotProps={{
        avatar: { src: user?.photoURL, alt: user?.displayName },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {user?.basicInfo.name?.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  return (
    <>
      <AccountButton open={open} onClick={handleOpenDrawer} photoURL={user?.photoURL} displayName={user?.displayName} sx={sx} {...other} />

      <Drawer open={open} onClose={handleCloseDrawer} anchor="right" hideBackdrop disableEnforceFocus disableAutoFocus disableScrollLock ModalProps={{ sx: { pointerEvents: 'none' } }} PaperProps={{ sx: { width: 420, borderTopLeftRadius: 20, mt: '105px', height: 'calc(100vh - 105px)', pointerEvents: 'auto' } }}>
        <DrawerHeader
          title="Profile"
          onBack={handleCloseDrawer}
          onEdit={handleEditOpen}
          editIcon="fluent:edit-20-regular"
          showShare={false}
        />
        <Scrollbar>
          {/* Avatar */}
          <Stack alignItems="center" sx={{ pt: 4, pb: 2 }}>
            {user?.photoURL ? (
              <Box
                component="img"
                src={user?.photoURL}
                alt={user?.displayName}
                onClick={() => setAvatarPreviewOpen(true)}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: 4,
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: 4,
                  bgcolor: '#4C4EFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 72, fontWeight: 700, color: '#fff' }}>
                  {(user?.displayName || user?.basicInfo?.name || 'A').charAt(0).toUpperCase()}
                </Typography>
              </Box>
            )}

            <ImagePreviewDialog
              open={avatarPreviewOpen}
              src={user?.photoURL}
              alt={`${user?.displayName || user?.basicInfo?.name || 'User'} avatar`}
              onClose={() => setAvatarPreviewOpen(false)}
            />

            <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
              {user?.displayName || 'Alexa Hales'}
            </Typography>

            {/* Email + Phone on same row */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Iconify icon="ic:round-email" width={18} sx={{ color: 'text.primary' }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.basicInfo?.email || 'alexahales943@gmail.com'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Iconify icon="ic:round-phone" width={18} sx={{ color: 'text.primary' }} />
                <Typography variant="body2" color="text.secondary">
                  +44 (123) 4512 5623
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Stats row with dashed dividers */}
          <Stack
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            sx={{ px: 2, pb: 3 }}
          >
            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{stats.rooms}</Typography>
              <Typography variant="body2" color="text.secondary">Rooms</Typography>
            </Stack>

            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {stats.friends.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body2" color="text.secondary">Friends</Typography>
            </Stack>

            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {stats.following.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body2" color="text.secondary">Following</Typography>
            </Stack>
          </Stack>

          {/* Search bar */}
          <Box sx={{ px: 2, pb: 2 }}>
            <InputBase
              fullWidth
              placeholder="Search here.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                bgcolor: '#f4f6f8',
                borderRadius: 10,
                px: 2,
                py: 1,
                fontSize: 15,
                border: '1px solid #e0e0e0',
              }}
              startAdornment={
                <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled', mr: 1 }} />
              }
            />
          </Box>

          {/* Pill tabs */}


          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, px: 2 }}>

            <Button
              size="small"
              onClick={() => setTab(0)}
              sx={{
                borderRadius: 10,
                fontWeight: tab === 0 ? 700 : 500,
                fontSize: 13,
                px: 2.5,
                py: 0.8,
                bgcolor: tab === 0 ? '#4C4EFF' : 'transparent',
                color: tab === 0 ? '#fff' : 'text.secondary',
                boxShadow: 'none',
                '&:hover': { bgcolor: tab === 0 ? '#3b3bd6' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Rooms ({stats.rooms.toString().padStart(2, '0')})
            </Button>

            <Button
              size="small"
              onClick={() => setTab(1)}
              sx={{
                borderRadius: 10,
                fontWeight: tab === 1 ? 700 : 500,
                fontSize: 13,
                px: 2.5,
                py: 0.8,
                bgcolor: tab === 1 ? '#4C4EFF' : 'transparent',
                color: tab === 1 ? '#fff' : 'text.secondary',
                boxShadow: 'none',
                '&:hover': { bgcolor: tab === 1 ? '#3b3bd6' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Friends ({stats.friends.toString().padStart(2, '0')})
            </Button>
            <Button
              size="small"
              onClick={() => setTab(2)}
              sx={{
                borderRadius: 10,
                fontWeight: tab === 2 ? 700 : 500,
                fontSize: 13,
                px: 2.5,
                py: 0.8,
                bgcolor: tab === 2 ? '#4C4EFF' : 'transparent',
                color: tab === 2 ? '#fff' : 'text.secondary',
                boxShadow: 'none',
                '&:hover': { bgcolor: tab === 2 ? '#3b3bd6' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Following ({stats.following.toString().padStart(2, '0')})
            </Button>
          </Stack>

          {/* Tab content */}
          <Box sx={{ px: 2, pb: 2 }}>
            {tab === 0 && (
              <>
                <Stack spacing={1}>
                  {following
                    .filter((room) => room.name.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 3)
                    .map((room, i) => {
                      const key = `room-${i}`;
                      const state = followedItems[key]; // undefined | 'requested' | 'active'
                      const label = state === 'active' ? 'Following' : state === 'requested' ? 'Cancel request' : 'Follow';
                      const isActive = state === 'active';
                      const isRequested = state === 'requested';
                      return (
                        <Stack
                          key={i}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          onClick={() => { window.dispatchEvent(new CustomEvent('openRoom', { detail: room })); closeOverlayDrawers(); }}
                          sx={{ p: 1, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' }, '&:hover .item-name': { color: '#4C4EFF' } }}
                        >
                          <Avatar
                            src={room.icon || undefined}
                            sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700, color: '#fff' }}
                          >
                            {room.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ flexGrow: 1, transition: 'color 0.15s' }}>
                            {room.name}
                          </Typography>
                          <Button
                            size="small"
                            variant={state ? 'outlined' : 'contained'}
                            onClick={(e) => { e.stopPropagation(); cycleFollow(key); }}
                            sx={{
                              minWidth: 100,
                              height: 30,
                              borderRadius: 2,
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: 'none',
                              flexShrink: 0,
                              boxShadow: 'none',
                              ...(isActive
                                ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                                : isRequested
                                  ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                  : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                            }}
                          >
                            {label}
                          </Button>
                        </Stack>
                      );
                    })}
                </Stack>
                {following.length > 3 && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => handleOpenViewAll('rooms')}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      border: '1px dashed rgba(76,78,255,0.4)',
                      color: '#4C4EFF',
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
                    }}
                  >
                    See All Rooms ({following.length})
                  </Button>
                )}
              </>
            )}
            {tab === 1 && (
              <>
                <Stack spacing={1}>
                  {friends
                    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 3)
                    .map((f, i) => {
                      const key = `friend-${i}`;
                      const state = followedItems[key];
                      const label = state === 'active' ? 'Friends' : state === 'requested' ? 'Cancel request' : 'Add';
                      const isActive = state === 'active';
                      const isRequested = state === 'requested';
                      return (
                        <Stack
                          key={i}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          onClick={() => window.dispatchEvent(new CustomEvent('openUserProfile', { detail: { name: f.name, avatar: f.icon } }))}
                          sx={{ p: 1, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' }, '&:hover .item-name': { color: '#4C4EFF' } }}
                        >
                          <Avatar
                            src={f.icon || undefined}
                            sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700, color: '#fff' }}
                          >
                            {f.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ flexGrow: 1, transition: 'color 0.15s' }}>
                            {f.name}
                          </Typography>
                          <Button
                            size="small"
                            variant={state ? 'outlined' : 'contained'}
                            onClick={(e) => { e.stopPropagation(); cycleFollow(key); }}
                            sx={{
                              minWidth: 100,
                              height: 30,
                              borderRadius: 2,
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: 'none',
                              flexShrink: 0,
                              boxShadow: 'none',
                              ...(isActive
                                ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                                : isRequested
                                  ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                  : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                            }}
                          >
                            {label}
                          </Button>
                        </Stack>
                      );
                    })}
                </Stack>
                {friends.length > 3 && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => handleOpenViewAll('friends')}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      border: '1px dashed rgba(76,78,255,0.4)',
                      color: '#4C4EFF',
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
                    }}
                  >
                    See All Friends ({friends.length})
                  </Button>
                )}
              </>
            )}
            {tab === 2 && (
              <>
                <Stack spacing={1}>
                  {following
                    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 3)
                    .map((f, i) => {
                      const key = `following-${i}`;
                      const state = followedItems[key];
                      const label = state === 'active' ? 'Following' : state === 'requested' ? 'Cancel request' : 'Follow';
                      const isActive = state === 'active';
                      const isRequested = state === 'requested';
                      return (
                        <Stack
                          key={i}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          onClick={() => { window.dispatchEvent(new CustomEvent('openRoom', { detail: f })); closeOverlayDrawers(); }}
                          sx={{ p: 1, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' }, '&:hover .item-name': { color: '#4C4EFF' } }}
                        >
                          <Avatar
                            src={f.icon || undefined}
                            sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700, color: '#fff' }}
                          >
                            {f.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ flexGrow: 1, transition: 'color 0.15s' }}>
                            {f.name}
                          </Typography>
                          <Button
                            size="small"
                            variant={state ? 'outlined' : 'contained'}
                            onClick={(e) => { e.stopPropagation(); cycleFollow(key); }}
                            sx={{
                              minWidth: 100,
                              height: 30,
                              borderRadius: 2,
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: 'none',
                              flexShrink: 0,
                              boxShadow: 'none',
                              ...(isActive
                                ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                                : isRequested
                                  ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                  : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                            }}
                          >
                            {label}
                          </Button>
                        </Stack>
                      );
                    })}
                </Stack>
                {following.length > 3 && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => handleOpenViewAll('following')}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      border: '1px dashed rgba(76,78,255,0.4)',
                      color: '#4C4EFF',
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
                    }}
                  >
                    See All Following ({following.length})
                  </Button>
                )}
              </>
            )}
          </Box>


          <AccountEditModal open={editOpen} onClose={handleEditClose} user={user} onSave={handleEditSave} />
        </Scrollbar>
      </Drawer>

      <ViewAllModal
        open={viewAllOpen}
        onClose={handleCloseViewAll}
        title={
          viewType === 'rooms' ? 'All Rooms' :
            viewType === 'friends' ? 'All Friends' :
              'All Following'
        }
        type={viewType}
        data={viewType === 'friends' ? friends : following}
        search={viewSearch}
        setSearch={setViewSearch}
      />
    </>
  );
}
