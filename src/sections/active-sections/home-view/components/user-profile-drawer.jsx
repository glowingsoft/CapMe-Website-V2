import { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import InputBase from '@mui/material/InputBase';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { Scrollbar } from 'src/components/scrollbar';
import { selectUser } from 'src/store/slices/userSlice';
import {
  useFollowUnfollowUserMutation,
  useOtherUserProfileQuery,
  useOtherUserRoomsQuery,
} from 'src/store/Reducer/auth';
import { useCancelRoomRequestMutation, useToggleRoomFollowMutation } from 'src/store/Reducer/rooms-api';
import DrawerHeader from './drawer-header';
import ImagePreviewDialog from './image-preview-dialog';
import {
  UserProfileHeaderSkeleton,
  UserProfileListSkeleton,
  UserProfileStatsSkeleton,
} from './user-profile-drawer-skeletons';

const getRealAvatar = (url) => (url && !url.includes('noImg') ? url : undefined);

export default function UserProfileDrawer({ open, onClose, user }) {
  const { t } = useTranslate('common');
  const currentUser = useSelector(selectUser);
  const currentUserId = String(currentUser?._id ?? currentUser?.id ?? currentUser?.basicInfo?._id ?? '');
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [createdPage, setCreatedPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [createdRooms, setCreatedRooms] = useState([]);
  const [followingRooms, setFollowingRooms] = useState([]);
  const [isFollowerOverride, setIsFollowerOverride] = useState(undefined);
  const [followerCountOverride, setFollowerCountOverride] = useState(undefined);
  const profileUserId = user?._id || user?.id;
  const [followUnfollowUser, { isLoading: isFollowActionLoading }] = useFollowUnfollowUserMutation();

  const {
    data: otherUserProfileResponse,
    isLoading: isOtherUserProfileLoading,
    isFetching: isOtherUserProfileFetching,
  } = useOtherUserProfileQuery(
    { userId: profileUserId },
    { skip: !open || !profileUserId, refetchOnMountOrArgChange: true }
  );
  const isProfileLoading = !!profileUserId && (isOtherUserProfileLoading || isOtherUserProfileFetching);

  const apiProfile = otherUserProfileResponse?.body;
  const profileUser = {
    ...user,
    ...apiProfile,
    _id: apiProfile?._id ?? user?._id ?? user?.id,
    name: apiProfile?.name ?? user?.name,
    email: apiProfile?.email ?? user?.email,
    avatar: apiProfile?.image ?? user?.avatar,
    username: apiProfile?.email ? `@${apiProfile.email.split('@')[0]}` : user?.username,
  };

  const {
    data: createdRoomsResponse,
    isLoading: isCreatedRoomsLoading,
    isFetching: isCreatedRoomsFetching,
  } = useOtherUserRoomsQuery(
    { userId: profileUserId, type: 'created', pageno: createdPage },
    { skip: !open || !profileUserId, refetchOnMountOrArgChange: true }
  );

  const {
    data: followingRoomsResponse,
    isLoading: isFollowingRoomsLoading,
    isFetching: isFollowingRoomsFetching,
  } = useOtherUserRoomsQuery(
    { userId: profileUserId, type: 'following', pageno: followingPage },
    { skip: !open || !profileUserId, refetchOnMountOrArgChange: true }
  );

  const mapRooms = (rooms = []) =>
    rooms.map((room) => ({
      _id: room._id,
      id: room._id,
      name: room.name || 'Untitled Room',
      icon: room.image || undefined,
      image: room.image || undefined,
      is_following: !!room.is_following,
      is_requested: !!room.is_requested,
      visibility: room.visibility,
      createdby: room.createdby,
    }));

  const mergeRooms = (previous, incoming) => {
    const map = new Map(previous.map((room) => [room._id, room]));
    incoming.forEach((room) => map.set(room._id, room));
    return Array.from(map.values());
  };

  useEffect(() => {
    if (!open || !profileUserId) return;
    setCreatedPage(1);
    setFollowingPage(1);
    setCreatedRooms([]);
    setFollowingRooms([]);
    setIsFollowerOverride(undefined);
    setFollowerCountOverride(undefined);
    setRoomFollowStates({});
    setRoomFollowLoadingIds(new Set());
  }, [open, profileUserId]);

  useEffect(() => {
    if (!open || !Array.isArray(createdRoomsResponse?.body)) return;
    const incoming = mapRooms(createdRoomsResponse.body);
    setCreatedRooms((prev) => (createdPage === 1 ? incoming : mergeRooms(prev, incoming)));
  }, [createdRoomsResponse, createdPage, open]);

  useEffect(() => {
    if (!open || !Array.isArray(followingRoomsResponse?.body)) return;
    const incoming = mapRooms(followingRoomsResponse.body);
    setFollowingRooms((prev) => (followingPage === 1 ? incoming : mergeRooms(prev, incoming)));
  }, [followingRoomsResponse, followingPage, open]);

  const createdTotalPages = createdRoomsResponse?.total_pages ?? 1;
  const followingTotalPages = followingRoomsResponse?.total_pages ?? 1;
  const hasMoreCreated = createdPage < createdTotalPages;
  const hasMoreFollowing = followingPage < followingTotalPages;
  const hasMoreForActiveTab = tab === 0 ? hasMoreCreated : hasMoreFollowing;

  const isRoomsLoading =
    !!profileUserId &&
    (isCreatedRoomsLoading || isCreatedRoomsFetching || isFollowingRoomsLoading || isFollowingRoomsFetching);

  const isFollower = typeof isFollowerOverride === 'boolean' ? isFollowerOverride : !!apiProfile?.isFollower;
  const followerCount = followerCountOverride ?? apiProfile?.followerCount ?? 0;
  const friendLabel = isFollower ? t('user_profile.btn_friends') : t('user_profile.btn_add_friend');

  // Only two lists: Created rooms and followings
  const lists = [createdRooms, followingRooms];
  const filtered = lists[tab].filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoomClick = (room) => {
    window.dispatchEvent(new CustomEvent('openRoom', { detail: room }));
    onClose();
  };

  const handleFollowToggle = async () => {
    if (!profileUserId || isFollowActionLoading) return;

    const nextIsFollower = !isFollower;
    setIsFollowerOverride(nextIsFollower);
    setFollowerCountOverride((current) => {
      const baseCount = current ?? apiProfile?.followerCount ?? 0;
      return Math.max(0, baseCount + (nextIsFollower ? 1 : -1));
    });

    try {
      await followUnfollowUser({ userId: profileUserId }).unwrap();
    } catch {
      setIsFollowerOverride(isFollower);
      setFollowerCountOverride(apiProfile?.followerCount ?? 0);
    }
  };

  const [roomFollowStates, setRoomFollowStates] = useState({});
  const [roomFollowLoadingIds, setRoomFollowLoadingIds] = useState(new Set());
  const [toggleRoomFollow] = useToggleRoomFollowMutation();
  const [cancelRoomRequest] = useCancelRoomRequestMutation();

  // Derive display state: 'follow' | 'requested' | 'following'
  const getFollowState = (item) => {
    const override = roomFollowStates[item._id];
    if (override !== undefined) return override;
    if (item.is_following) return 'following';
    if (item.is_requested) return 'requested';
    return 'follow';
  };

  const handleRoomFollowClick = async (e, item) => {
    e.stopPropagation();
    const roomId = item._id;
    if (roomFollowLoadingIds.has(roomId)) return;
    const current = getFollowState(item);
    setRoomFollowLoadingIds((prev) => new Set([...prev, roomId]));
    try {
      if (current === 'requested') {
        await cancelRoomRequest(roomId).unwrap();
        setRoomFollowStates((prev) => ({ ...prev, [roomId]: 'follow' }));
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: false, isCancelledRequest: true } }));
      } else if (current === 'follow') {
        await toggleRoomFollow(roomId).unwrap();
        setRoomFollowStates((prev) => ({ ...prev, [roomId]: 'requested' }));
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
      } else {
        // 'following' → unfollow
        await toggleRoomFollow(roomId).unwrap();
        setRoomFollowStates((prev) => ({ ...prev, [roomId]: 'follow' }));
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false } }));
      }
    } catch {
      setRoomFollowStates((prev) => ({ ...prev, [roomId]: current }));
    } finally {
      setRoomFollowLoadingIds((prev) => { const s = new Set(prev); s.delete(roomId); return s; });
    }
  };

  const tabLabels = [t('user_profile.tab_created_rooms'), t('user_profile.tab_followings')];

  if (!user) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        disableScrollLock
        ModalProps={{ sx: { pointerEvents: 'none' } }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: '100%',
            borderTopLeftRadius: 20,
            overflow: 'hidden',
            bgcolor: '#fff',
            mt: '105px',
            height: 'calc(100vh - 105px)',
            pointerEvents: 'auto',
          },
        }}
      >
        <DrawerHeader title={profileUser.name || 'Profile'} onBack={onClose} showEdit={false} showShare={false} />

        <Scrollbar>
          {/* Avatar */}
          {isProfileLoading ? (
            <UserProfileHeaderSkeleton />
          ) : (
            <Stack alignItems="center" sx={{ pt: 4, pb: 2 }}>
              <Avatar
                src={getRealAvatar(profileUser.avatar)}
                onClick={getRealAvatar(profileUser.avatar) ? () => setAvatarPreviewOpen(true) : undefined}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: 4,
                  bgcolor: '#4C4EFF',
                  fontSize: 64,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: getRealAvatar(profileUser.avatar) ? 'pointer' : 'default',
                }}
              >
                {profileUser.name?.charAt(0).toUpperCase()}
              </Avatar>

              <ImagePreviewDialog
                open={avatarPreviewOpen}
                src={getRealAvatar(profileUser.avatar)}
                alt={`${profileUser.name || 'User'} avatar`}
                onClose={() => setAvatarPreviewOpen(false)}
              />

              <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                {profileUser.name}
              </Typography>

              {profileUser.email && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  {profileUser.email}
                </Typography>
              )}
            </Stack>
          )}

          {/* Add Friend button */}
          <Stack sx={{ px: 3, pb: 3 }}>
            {isProfileLoading ? (
              <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 2 }} />
            ) : (
              isFollower ? (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleFollowToggle}
                  disabled={isFollowActionLoading}
                  sx={{
                    height: 40,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'none',
                    boxShadow: 'none',
                    borderColor: '#4C4EFF',
                    color: '#4C4EFF',
                    bgcolor: 'rgba(76,78,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  {t('user_profile.btn_friends')}
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleFollowToggle}
                  disabled={isFollowActionLoading}
                  sx={{
                    height: 40,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'none',
                    boxShadow: 'none',
                    bgcolor: '#4C4EFF',
                    color: '#fff',
                    border: '1px solid #4C4EFF',
                    '&:hover': { bgcolor: '#3739b7' },
                  }}
                >
                  {friendLabel}
                </Button>
              )
            )}
          </Stack>

          {/* Stats */}
          {isProfileLoading ? (
            <UserProfileStatsSkeleton />
          ) : (
            <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ px: 2, pb: 3 }}>
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#4C4EFF">{apiProfile?.roomCount ?? createdRooms.length}</Typography>
                <Typography variant="body2" color="text.secondary">{t('user_profile.stat_rooms')}</Typography>
              </Stack>
              <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#4C4EFF">{followerCount}</Typography>
                <Typography variant="body2" color="text.secondary">{t('user_profile.stat_followers')}</Typography>
              </Stack>
              <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#4C4EFF">{apiProfile?.followingCount ?? followingRooms.length}</Typography>
                <Typography variant="body2" color="text.secondary">{t('user_profile.stat_following')}</Typography>
              </Stack>
            </Stack>
          )}

          {/* Search */}
          <Box sx={{ px: 2, pb: 2 }}>
            <InputBase
              fullWidth
              placeholder={t('user_profile.search_placeholder')}
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

          {/* Tabs */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, px: 2 }}>
            {tabLabels.map((label, i) => (
              <Button
                key={label}
                size="small"
                onClick={() => { setTab(i); setSearch(''); }}
                sx={{
                  borderRadius: 10,
                  fontWeight: tab === i ? 700 : 500,
                  fontSize: 13,
                  px: 2.5,
                  py: 0.8,
                  bgcolor: tab === i ? '#4C4EFF' : 'transparent',
                  color: tab === i ? '#fff' : 'text.secondary',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: tab === i ? '#3b3bd6' : 'rgba(0,0,0,0.04)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          {/* List */}
          <Box sx={{ px: 2, pb: 3 }}>
            {isProfileLoading || isRoomsLoading ? (
              <UserProfileListSkeleton showAction={true} />
            ) : (
              <Stack spacing={1}>
                {filtered.length === 0 ? (
                  <Typography color="text.secondary" fontSize={14} sx={{ textAlign: 'center', py: 3 }}>
                    {t('user_profile.no_results')}
                  </Typography>
                ) : (
                  filtered.map((item, i) => {
                    const followState = getFollowState(item);
                    const isOwnRoom = currentUserId && String(item.createdby) === currentUserId;

                    return (
                      <Stack
                        key={item._id || i}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        onClick={() => handleRoomClick(item)}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' },
                          '&:hover .item-name': { color: '#4C4EFF' },
                        }}
                      >
                        <Avatar
                          src={item.icon || undefined}
                          sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700, color: '#fff' }}
                        >
                          {item.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ transition: 'color 0.15s' }}>
                            {item.name}
                          </Typography>
                          <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.2 }}>
                            {item.visibility === 'private' ? t('search.visibility_private') : t('search.visibility_public')}
                          </Typography>
                        </Box>

                        {/* Follow state button — hidden for rooms the current user owns */}
                        {!isOwnRoom && followState === 'follow' && (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={roomFollowLoadingIds.has(item._id)}
                            onClick={(e) => handleRoomFollowClick(e, item)}
                            sx={{
                              minWidth: 100, height: 30, borderRadius: 2, fontSize: 12, fontWeight: 700,
                              textTransform: 'none', flexShrink: 0, boxShadow: 'none',
                              bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF',
                              '&:hover': { bgcolor: '#3739b7' },
                              '&.Mui-disabled': { opacity: 0.6 },
                            }}
                          >
                            {t('user_profile.btn_follow')}
                          </Button>
                        )}
                        {!isOwnRoom && followState === 'requested' && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={roomFollowLoadingIds.has(item._id)}
                            onClick={(e) => handleRoomFollowClick(e, item)}
                            sx={{
                              minWidth: 100, height: 30, borderRadius: 2, fontSize: 11, fontWeight: 700,
                              textTransform: 'none', flexShrink: 0, boxShadow: 'none',
                              borderColor: 'rgba(76,175,80,0.6)', color: '#43A047', bgcolor: 'transparent',
                              '&:hover': { bgcolor: 'rgba(76,175,80,0.08)', borderColor: 'rgba(76,175,80,0.6)' },
                              '&.Mui-disabled': { opacity: 0.6 },
                            }}
                          >
                            {t('user_profile.btn_request_sent')}
                          </Button>
                        )}
                        {!isOwnRoom && followState === 'following' && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={roomFollowLoadingIds.has(item._id)}
                            onClick={(e) => handleRoomFollowClick(e, item)}
                            sx={{
                              minWidth: 100, height: 30, borderRadius: 2, fontSize: 12, fontWeight: 700,
                              textTransform: 'none', flexShrink: 0, boxShadow: 'none',
                              borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'rgba(76,78,255,0.06)',
                              '&:hover': { bgcolor: 'rgba(76,78,255,0.12)' },
                              '&.Mui-disabled': { opacity: 0.6 },
                            }}
                          >
                            {t('user_profile.btn_following')}
                          </Button>
                        )}
                      </Stack>
                    );
                  })
                )}
              </Stack>
            )}
            {!isProfileLoading && !isRoomsLoading && lists[tab].length > 0 && (
              <>
                {hasMoreForActiveTab && (
                  <Button
                    fullWidth
                    onClick={() => {
                      if (tab === 0) setCreatedPage((prev) => prev + 1);
                      else setFollowingPage((prev) => prev + 1);
                    }}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(76,78,255,0.4)',
                      color: '#4C4EFF',
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
                    }}
                  >
                    {t('user_profile.load_more')}
                  </Button>
                )}
              </>
            )}
          </Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}
