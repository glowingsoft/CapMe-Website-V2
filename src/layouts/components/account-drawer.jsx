import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { stats, friends as mockFriends, following as mockFollowing } from './account-mockdata';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { closeOverlayDrawers } from 'src/utils/drawer-events';
import { stripDoubleS3Prefix } from 'src/utils/message-utils';

import { _mock } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { AnimateAvatar } from 'src/components/animate';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { useTranslate } from 'src/locales';

import { useMockedUser } from 'src/auth/hooks';
import { useUserProfileQuery, useConnectionsQuery, useUpdateProfileMutation, useUploadFileMutation } from 'src/store/Reducer/auth';
import { toast } from 'src/components/snackbar';
import { setUser } from 'src/store/slices/userSlice';

import { AccountButton } from './account-button';
import { UpgradeBlock } from './nav-upgrade';
import AccountEditModal from './account-edit-modal';
import ChangePasswordModal from './change-password-modal';
import {
  AccountConnectionListSkeleton,
  AccountProfileHeaderSkeleton,
  AccountStatsSkeleton,
  AccountTabsSkeleton,
} from './account-drawer-skeletons';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import ViewAllModal from './view-all';
import ImagePreviewDialog from 'src/sections/active-sections/home-view/components/image-preview-dialog';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], sx, ...other }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const router = useRouter();

  const pathname = usePathname();

  // Initialize state early for use in queries
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0: Friends, 1: Following
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [followedItems, setFollowedItems] = useState({});
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [viewType, setViewType] = useState('rooms');
  const [viewSearch, setViewSearch] = useState('');

  const { t } = useTranslate('common');
  const { user } = useMockedUser();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useUserProfileQuery(undefined, {
    skip: !user?.token || !open,
    refetchOnMountOrArgChange: true,
  });

  // Fetch followings and followers (friends)
  const {
    data: followingsData,
    isLoading: isFollowingsLoading,
    isFetching: isFollowingsFetching,
  } = useConnectionsQuery(
    { type: 'followings', page: 1, search },
    { skip: !user?.token || !open, refetchOnMountOrArgChange: true }
  );

  const {
    data: followersData,
    isLoading: isFollowersLoading,
    isFetching: isFollowersFetching,
  } = useConnectionsQuery(
    { type: 'followers', page: 1, search },
    { skip: !user?.token || !open, refetchOnMountOrArgChange: true }
  );

  const isProfileDataLoading = isProfileLoading || isProfileFetching;

  // useState(true) prevents empty-state flash while RTK Query transitions from
  // skipped → loading → resolved on drawer open.
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  useEffect(() => {
    if (!open) {
      setConnectionsLoading(true);
      return;
    }
    if (!isFollowersLoading && !isFollowersFetching && !isFollowingsLoading && !isFollowingsFetching) {
      setConnectionsLoading(false);
    }
  }, [open, isFollowersLoading, isFollowersFetching, isFollowingsLoading, isFollowingsFetching]);

  // Map API responses to drawer data shape
  // API returns body as array directly, not nested in .data
  const apiFollowings = Array.isArray(followingsData?.body) ? followingsData.body : [];
  const apiFollowers = Array.isArray(followersData?.body) ? followersData.body : [];

  // Transform connection data to drawer format, preserving _id and email for navigation
  const transformedFollowings = apiFollowings.map((item) => ({
    _id: item._id,
    name: item.name || item.displayName || 'Unknown',
    email: item.email || '',
    icon: item.image || item.photoURL || undefined,
  }));

  const transformedFollowers = apiFollowers.map((item) => ({
    _id: item._id,
    name: item.name || item.displayName || 'Unknown',
    email: item.email || '',
    icon: item.image || item.photoURL || undefined,
  }));

  // ViewAllModal data — no mock fallback so empty state shows correctly
  const friends = transformedFollowers;
  const following = transformedFollowings;

  useEffect(() => {
    const profileBody = profileResponse?.body;
    if (!profileBody || !user?.token) return;

    const storedImage = stripDoubleS3Prefix(profileBody?.image);
    const effectiveProfileImage = storedImage?.includes('noImg') ? null : storedImage;

    const alreadySynced =
      user?._id === profileBody?._id &&
      user?.email === profileBody?.email &&
      (!effectiveProfileImage || user?.photoURL === effectiveProfileImage) &&
      user?.mobile === profileBody?.mobile &&
      user?.updatedAt === profileBody?.updatedAt;

    if (alreadySynced) return;

    const mergedUser = {
      ...user,
      ...profileBody,
      id: profileBody?._id ?? user?.id,
      email: profileBody?.email ?? user?.email,

      photoURL: effectiveProfileImage ?? user?.photoURL,
      basicInfo: {
        ...(user?.basicInfo ?? {}),
        name: profileBody?.name ?? user?.basicInfo?.name,
        email: profileBody?.email ?? user?.basicInfo?.email,
      },
      token: user?.token,
    };

    dispatch(setUser(mergedUser));
  }, [dispatch, profileResponse, user]);

  const profileStats = {
    rooms: profileResponse?.body?.roomCount ?? stats.rooms,
    friends: profileResponse?.body?.followerCount ?? stats.friends,
    following: profileResponse?.body?.followingCount ?? stats.following,
  };

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleEditSave = async (form) => {
    try {
      let imageUrl = user?.photoURL ?? '';
      if (form.photo instanceof File) {
        const uploadRes = await uploadFile(form.photo).unwrap();
        const rawBody = uploadRes?.body;
        imageUrl =
          (typeof rawBody === 'string' ? rawBody : null) ??
          rawBody?.url ??
          rawBody?.fileUrl ??
          rawBody?.imageUrl ??
          rawBody?.path ??
          rawBody?.location ??
          rawBody?.link ??
          uploadRes?.url ??
          uploadRes?.fileUrl ??
          uploadRes?.imageUrl ??
          uploadRes?.path ??
          uploadRes?.location ??
          imageUrl;
      }

      const imageName = imageUrl ? imageUrl.split('/').pop() : '';
      const payload = {
        name: form.name,
        mobile: form.phone,
        image: imageName,
      };
      const res = await updateProfile(payload).unwrap();
      const profileBody = res?.body ?? res;
      const newPhotoURL = profileBody?.image ?? imageUrl;
      dispatch(setUser({
        ...user,
        photoURL: newPhotoURL,
        mobile: profileBody?.mobile ?? form.phone,
        basicInfo: {
          ...(user?.basicInfo ?? {}),
          name: profileBody?.name ?? form.name ?? user?.basicInfo?.name,
          email: profileBody?.email ?? user?.basicInfo?.email,
        },
      }));
      toast.success(t('account_drawer.toast_updated'));
      handleEditClose();
    } catch (err) {
      toast.error(err?.data?.message || t('account_drawer.toast_update_error'));
    }
  };

  // 3-state cycle: undefined → 'requested' → 'active' → undefined
  const cycleFollow = (key) =>
    setFollowedItems((prev) => {
      const cur = prev[key];
      const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
      return { ...prev, [key]: next };
    });
  const handleOpenViewAll = (type) => {
    setViewType(type);
    setViewAllOpen(true);
    setViewSearch(''); // reset search
  };

  const handleCloseViewAll = () => {
    setViewAllOpen(false);
  };

  const handleOpenUserProfileDrawer = useCallback((profile) => {
    setViewAllOpen(false);
    window.dispatchEvent(
      new CustomEvent('openUserProfile', {
        detail: {
          ...profile,
          avatar: profile?.icon || profile?.avatar,
          username: profile?.email ? `@${profile.email.split('@')[0]}` : profile?.username,
        },
      })
    );
  }, []);


  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
    window.dispatchEvent(new CustomEvent('accountDrawerChange', { detail: true }));
    window.dispatchEvent(new Event('accountDrawerOpened'));
  }, []);

  useEffect(() => {
    const closeHandler = () => {
      setOpen(false);
      window.dispatchEvent(new CustomEvent('accountDrawerChange', { detail: false }));
    };
    const openHandler = () => handleOpenDrawer();
    window.addEventListener('closeAccountDrawer', closeHandler);
    window.addEventListener('openAccountDrawer', openHandler);
    return () => {
      window.removeEventListener('closeAccountDrawer', closeHandler);
      window.removeEventListener('openAccountDrawer', openHandler);
    };
  }, [handleOpenDrawer]);

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

  const renderFollowingViewAllItem = useCallback(
    (item, i) => (
      <Stack
        key={i}
        direction="row"
        spacing={1.5}
        alignItems="center"
        onClick={() => handleOpenUserProfileDrawer(item)}
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 2.5,
          cursor: 'pointer',
          transition: 'background 0.12s',
          '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' },
          '&:hover .item-name': { color: '#4C4EFF' },
        }}
      >
        <Avatar
          src={item.icon || item.avatar || undefined}
          sx={{ width: 42, height: 42, bgcolor: '#4C4EFF', flexShrink: 0, fontSize: 15, fontWeight: 700 }}
        >
          {item.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography className="item-name" fontWeight={600} fontSize={14} noWrap sx={{ transition: 'color 0.15s' }}>
            {item.name}
          </Typography>
          <Typography fontSize={12} color="text.secondary" noWrap>
            {item.email}
          </Typography>
        </Stack>
      </Stack>
    ),
    [handleOpenUserProfileDrawer]
  );

  const renderAvatar = (
    <AnimateAvatar
      width={120}
      slotProps={{
        avatar: { src: user?.photoURL?.includes('noImg') ? undefined : user?.photoURL, alt: user?.displayName },
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
          title={t('account_drawer.title')}
          onBack={handleCloseDrawer}
          onEdit={handleEditOpen}
          onChangePassword={user?.loginMethod === 'social' ? undefined : () => setChangePasswordOpen(true)}
          editIcon="fluent:edit-20-regular"
          showShare={false}
        />
        <Scrollbar>
          {/* Avatar */}
          <Stack alignItems="center" sx={{ pt: 4, pb: 2 }}>
            {isProfileDataLoading ? (
              <AccountProfileHeaderSkeleton />
            ) : user?.photoURL ? (
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

            {!isProfileDataLoading && (
              <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                {user?.displayName || 'Alexa Hales'}
              </Typography>
            )}

            {/* Email + Phone on same row */}
            {!isProfileDataLoading && (
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
                    {user?.mobile || 'null'}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>

          {/* Stats row with dashed dividers */}
          {isProfileDataLoading ? (
            <AccountStatsSkeleton />
          ) : (
            <Stack
              direction="row"
              justifyContent="space-around"
              alignItems="center"
              sx={{ px: 2, pb: 3 }}
            >
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4C4EFF' }}>{profileStats.rooms}</Typography>
                <Typography variant="body2" color="text.secondary">{t('account_drawer.stat_rooms')}</Typography>
              </Stack>

              <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4C4EFF' }}>
                  {profileStats.friends}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('account_drawer.stat_friends')}</Typography>
              </Stack>

              <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4C4EFF' }}>
                  {profileStats.following}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('account_drawer.stat_following')}</Typography>
              </Stack>
            </Stack>
          )}

          {/* Search bar */}
          <Box sx={{ px: 2, pb: 2 }}>
            <InputBase
              fullWidth
              placeholder={t('account_drawer.search_placeholder')}
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
          {isProfileDataLoading ? (
            <AccountTabsSkeleton />
          ) : (
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
                {search ? t('account_drawer.stat_friends') : t('account_drawer.tab_friends', { count: profileStats.friends })}
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
                {search ? t('account_drawer.stat_following') : t('account_drawer.tab_following', { count: profileStats.following })}
              </Button>
            </Stack>
          )}

          {/* Tab content */}
          <Box sx={{ px: 2, pb: 2 }}>
            {tab === 0 && (
              connectionsLoading ? (
                <AccountConnectionListSkeleton showButton />
              ) : (() => {
                const filteredFriends = transformedFollowers.filter((f) =>
                  f.name.toLowerCase().includes(search.toLowerCase())
                );
                if (transformedFollowers.length === 0) {
                  return (
                    <EmptyContent
                      title={t('account_drawer.empty_friends_title')}
                      description={t('account_drawer.empty_friends_desc')}
                      sx={{ py: 6 }}
                    />
                  );
                }
                if (filteredFriends.length === 0) {
                  return (
                    <EmptyContent
                      title={t('account_drawer.empty_search_title')}
                      description={t('account_drawer.empty_search_desc')}
                      sx={{ py: 6 }}
                    />
                  );
                }
                return (
                  <>
                    <Stack spacing={1}>
                      {filteredFriends.slice(0, 3).map((f, i) => {
                        const key = `friend-${i}`;
                        const state = followedItems[key];
                        const label = state === 'active' ? t('account_drawer.btn_friends') : state === 'requested' ? t('account_drawer.btn_cancel_request') : t('account_drawer.btn_add');
                        const isActive = state === 'active';
                        const isRequested = state === 'requested';
                        return (
                          <Stack
                            key={i}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            onClick={() => handleOpenUserProfileDrawer(f)}
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
                    {transformedFollowers.length > 3 && (
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
                        {t('account_drawer.see_all_friends', { count: transformedFollowers.length })}
                      </Button>
                    )}
                  </>
                );
              })()
            )}
            {tab === 1 && (
              connectionsLoading ? (
                <AccountConnectionListSkeleton showButton={false} />
              ) : (() => {
                const filteredFollowings = transformedFollowings.filter((f) =>
                  f.name.toLowerCase().includes(search.toLowerCase())
                );
                if (transformedFollowings.length === 0) {
                  return (
                    <EmptyContent
                      title={t('account_drawer.empty_following_title')}
                      description={t('account_drawer.empty_following_desc')}
                      sx={{ py: 6 }}
                    />
                  );
                }
                if (filteredFollowings.length === 0) {
                  return (
                    <EmptyContent
                      title={t('account_drawer.empty_search_title')}
                      description={t('account_drawer.empty_search_desc')}
                      sx={{ py: 6 }}
                    />
                  );
                }
                return (
                  <>
                    <Stack spacing={1}>
                      {filteredFollowings.slice(0, 3).map((f, i) => (
                        <Stack
                          key={i}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          onClick={() => handleOpenUserProfileDrawer(f)}
                          sx={{ p: 1, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' }, '&:hover .item-name': { color: '#4C4EFF' } }}
                        >
                          <Avatar
                            src={f.icon || undefined}
                            sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700, color: '#fff' }}
                          >
                            {f.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ transition: 'color 0.15s' }}>
                              {f.name}
                            </Typography>
                            <Typography fontSize={12} color="text.secondary" noWrap>
                              {f.email}
                            </Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                    {transformedFollowings.length > 3 && (
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
                        {t('account_drawer.see_all_following', { count: transformedFollowings.length })}
                      </Button>
                    )}
                  </>
                );
              })()
            )}
          </Box>


          <AccountEditModal open={editOpen} onClose={handleEditClose} user={user} onSave={handleEditSave} isLoading={isUploading || isUpdating} />
          <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        </Scrollbar>
      </Drawer>

      <ViewAllModal
        open={viewAllOpen}
        onClose={handleCloseViewAll}
        title={
          viewType === 'rooms' ? t('account_drawer.view_all_rooms') :
            viewType === 'friends' ? t('account_drawer.view_all_friends') :
              t('account_drawer.view_all_following')
        }
        type={viewType}
        data={viewType === 'friends' ? friends : following}
        search={viewSearch}
        setSearch={setViewSearch}
        renderItem={viewType === 'following' ? renderFollowingViewAllItem : undefined}
      />
    </>
  );
}
