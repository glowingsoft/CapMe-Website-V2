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

import { _mock } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { AnimateAvatar } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { useMockedUser } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { UpgradeBlock } from './nav-upgrade';
import { SignOutButton } from './sign-out-button';
import AccountEditModal from './account-edit-modal';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], sx, ...other }) {
  const theme = useTheme();

  const router = useRouter();

  const pathname = usePathname();

  const { user } = useMockedUser();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  // Mock data is now imported from account-mockdata.js
  const [editOpen, setEditOpen] = useState(false);

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleEditSave = (form) => {
    // TODO: Save logic here
    // e.g., update user profile
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
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: 4,
                  objectFit: 'cover',
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
              Friends ({stats.friends.toString().padStart(2, '0')})
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
              Following ({stats.following.toString().padStart(2, '0')})
            </Button>
          </Stack>

          {/* Tab content */}
          <Box sx={{ px: 2, pb: 2 }}>
            {[friends, following][tab] && (
              <Stack spacing={1.5}>
                {[friends, following][tab]
                  .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                  .map((f, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      <Avatar
                        src={f.icon || undefined}
                        sx={{
                          width: 46,
                          height: 46,
                          flexShrink: 0,
                          bgcolor: '#4C4EFF',
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {f.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography fontSize={15} fontWeight={600} color="text.primary" noWrap>
                        {f.name}
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 2.5 }}>
            <SignOutButton onClose={handleCloseDrawer} />
          </Box>
          <AccountEditModal open={editOpen} onClose={handleEditClose} user={user} onSave={handleEditSave} />
        </Scrollbar>
      </Drawer>
    </>
  );
}
