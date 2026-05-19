import { useState, useEffect } from 'react';
import React from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import RoomAvatar from 'src/components/room-avatar';
import { DRAWER_EVENTS } from 'src/utils/drawer-events';
import { useTranslate } from 'src/locales';
import { toast } from 'src/components/snackbar';

import UnfollowModal from './unfollow-modal';
import RoomInformation from './room-information';
import RoomRequestDrawer from './room-request-drawer';
import HashtagModal from './hashtag-modal';
import CreateRoomModal from './create-room-modal';
import { useCancelRoomRequestMutation, useGetRoomByIdQuery, useLazyGetRoomByIdQuery, useToggleFavouriteRoomMutation, useToggleRoomFollowMutation, useSubmitRoomReportMutation } from 'src/store/Reducer/rooms-api';
const RoomHashtagList = React.lazy(() => import('./room-hashtag-list'));

const getId = (value) => {
  if (!value) return undefined;
  if (typeof value === 'object') return value._id ?? value.id;
  return value;
};

function RoomChannelHeader({ room, messagesRoom = null, onRoomInfoOpenChange, onRoomUnfollow, onDeleteRoom, onSearchChange, onFollowToggle, isFollowing, isPending, messages = [], onMessageSelect, isGarage = false, enrichedMembers = null, isRoomAdmin = false, isLoading = false }) {
  const { t } = useTranslate('common');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [unfollowOpen, setUnfollowOpen] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const [roomInfoOpen, setRoomInfoOpen] = useState(false);
  const [roomRequestOpen, setRoomRequestOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [showHashtagList, setShowHashtagList] = useState(false);
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [roomInfoRefreshKey, setRoomInfoRefreshKey] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [memberPermissionOverrides, setMemberPermissionOverrides] = useState({});
  useEffect(() => { onSearchChange?.(searchValue); }, [searchValue]);

  const messageRoomId = messages.find((message) => message?.roomId)?.roomId;

  const roomId = getId(messagesRoom?._id ?? messagesRoom?.id) ?? getId(room?.roomId) ?? messageRoomId ?? room?.lastMessage?.roomId ?? room?._id ?? room?.id;
  const { data: roomDetail } = useGetRoomByIdQuery(roomId, { skip: !roomId });
  const [fetchRoomById, { isFetching: isRoomDetailFetching }] = useLazyGetRoomByIdQuery();
  const [toggleFavourite] = useToggleFavouriteRoomMutation();
  const [toggleRoomFollow] = useToggleRoomFollowMutation();
  const [cancelRoomRequest] = useCancelRoomRequestMutation();
  const [submitRoomReport, { isLoading: isSubmittingReport }] = useSubmitRoomReportMutation();
  const [followLoading, setFollowLoading] = useState(false);
  const [roomApiMembers, setRoomApiMembers] = useState(null);

  const handleFollowClick = async () => {
    const roomId = actualRoomId;
    if (!roomId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isPending) {
        await cancelRoomRequest(roomId).unwrap();
        toast.success(t('room_channel_header.toast_request_cancelled'));
        onFollowToggle?.(roomId, { cancelled: true });
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: false, isCancelledRequest: true } }));
      } else {
        const result = await toggleRoomFollow(roomId).unwrap();
        const msg = result?.message ?? '';
        const isRequestSent = msg.toLowerCase().includes('request') || msg.toLowerCase().includes('sent');
        if (isRequestSent && !isFollowing) {
          toast.success(t('room_channel_header.toast_request_sent'));
          onFollowToggle?.(roomId, { isPending: true });
          window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
        } else {
          if (msg) toast.success(msg);
          onFollowToggle?.(roomId);
          window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: !isFollowing, isPending: false } }));
        }
      }
    } catch (err) {
      const msg = err?.data?.message ?? '';
      if (msg.toLowerCase().includes('already sent')) {
        onFollowToggle?.(roomId, { isPending: true });
      } else {
        toast.error(t('room_channel_header.toast_follow_error'));
      }
    } finally {
      setFollowLoading(false);
    }
  };
  const resolvedRoomDetail = roomDetail?.body?.room ?? roomDetail?.room ?? roomDetail?.body ?? roomDetail;
  const actualRoomId =
    getId(messagesRoom?._id ?? messagesRoom?.id)
    ?? getId(messagesRoom?.roomId)
    ?? getId(messagesRoom?.room)
    ?? getId(room?.roomId)
    ?? messageRoomId
    ?? room?.lastMessage?.roomId
    ?? getId(resolvedRoomDetail?.roomId)
    ?? getId(resolvedRoomDetail?.room)
    ?? resolvedRoomDetail?._id
    ?? resolvedRoomDetail?.id
    ?? getId(room?.room)
    ?? room?._id
    ?? room?.id;

  const roomForDrawers = React.useMemo(() => ({
    ...(room ?? {}),
    ...(messagesRoom ?? {}),
    ...(resolvedRoomDetail ?? {}),
    roomId: actualRoomId,
    _id: actualRoomId,
    id: actualRoomId,
  }), [room, resolvedRoomDetail, messagesRoom, actualRoomId]);

  const [isFavourite, setIsFavourite] = useState(false);
  React.useEffect(() => {
    setIsFavourite(resolvedRoomDetail?.isFavorite ?? resolvedRoomDetail?.is_favorite ?? room?.favorite ?? false);
  }, [resolvedRoomDetail?.isFavorite, resolvedRoomDetail?.is_favorite, room?.favorite]);

  const setRoomInfoOpenNotify = (val) => {
    setRoomInfoOpen(val);
    onRoomInfoOpenChange?.(val);
  };

  const setRoomRequestOpenNotify = (val) => {
    setRoomRequestOpen(val);
    onRoomInfoOpenChange?.(val);
  };

  useEffect(() => {
    const close = () => {
      setRoomInfoOpenNotify(false);
      setRoomRequestOpenNotify(false);
    };
    window.addEventListener('accountDrawerOpened', close);
    window.addEventListener('openUserProfile', close);
    window.addEventListener('closeRoomInfo', close);
    window.addEventListener(DRAWER_EVENTS.roomRequestClose, close);
    return () => {
      window.removeEventListener('accountDrawerOpened', close);
      window.removeEventListener('openUserProfile', close);
      window.removeEventListener('closeRoomInfo', close);
      window.removeEventListener(DRAWER_EVENTS.roomRequestClose, close);
    };
  }, []);

  const menuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenRoomInformation = () => {
    handleCloseMenu();
    setRoomRequestOpenNotify(false);
    setRoomInfoOpenNotify(true);
    if (roomId) fetchRoomById(roomId, true);
  };

  const handleOpenRoomRequests = () => {
    handleCloseMenu();
    setRoomInfoOpenNotify(false);
    setRoomRequestOpenNotify(true);
  };

  const handleCloseRoomInformation = () => {
    setRoomInfoOpenNotify(false);
  };

  const handleCloseRoomRequest = () => {
    setRoomRequestOpenNotify(false);
  };

  const handleOpenUnfollowModal = () => {
    handleCloseMenu();
    setUnfollowOpen(true);
  };

  const handleCloseUnfollowModal = () => {
    if (unfollowLoading) return;
    setUnfollowOpen(false);
  };

  const handleToggleFavourite = async () => {
    if (!roomId) return;
    const next = !isFavourite;
    setIsFavourite(next);
    try {
      await toggleFavourite(roomId).unwrap();
      window.dispatchEvent(new CustomEvent('roomFavouriteUpdate', { detail: { roomId, isFavourite: next } }));
      toast.success(next ? t('room_channel_header.toast_added_fav') : t('room_channel_header.toast_removed_fav'));
    } catch {
      setIsFavourite(!next);
      toast.error(t('room_channel_header.toast_fav_error'));
    }
  };

  React.useEffect(() => {
    const onFavouriteUpdate = (e) => {
      const { roomId: updatedId, isFavourite: val } = e.detail ?? {};
      if (String(updatedId) === String(roomId)) setIsFavourite(val);
    };
    window.addEventListener('roomFavouriteUpdate', onFavouriteUpdate);
    return () => window.removeEventListener('roomFavouriteUpdate', onFavouriteUpdate);
  }, [roomId]);

  const handleConfirmUnfollow = async () => {
    if (!actualRoomId) return;
    try {
      setUnfollowLoading(true);
      await toggleRoomFollow(actualRoomId).unwrap();
      setUnfollowOpen(false);
      toast.success(t('room_channel_header.toast_unfollowed'));
      window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId: actualRoomId, isFollowing: false } }));
      onRoomUnfollow?.(actualRoomId);
    } catch (error) {
      console.error('Failed to unfollow room:', error);
      toast.error(t('room_channel_header.toast_unfollow_error'));
    } finally {
      setUnfollowLoading(false);
    }
  };

  const handleMemberPermissionUpdate = ({ userId, permission }) => {
    if (!userId || !permission) return;
    setMemberPermissionOverrides((prev) => ({
      ...prev,
      [String(userId)]: permission,
    }));
  };

  const menuItems = [
    {
      label: t('room_channel_header.menu_room_info'),
      icon: 'material-symbols:info-rounded',
      onClick: handleOpenRoomInformation,
    },
    ...(isRoomAdmin ? [{
      label: t('room_channel_header.menu_room_requests'),
      icon: 'solar:users-group-rounded-bold',
      onClick: handleOpenRoomRequests,
    }] : []),
    ...(!isRoomAdmin ? [{
      label: t('room_channel_header.menu_following'),
      icon: 'mdi:account-star',
      onClick: handleOpenUnfollowModal,
    }] : []),
    {
      label: t('room_channel_header.menu_share'),
      icon: 'mingcute:share-forward-fill',
      onClick: () => {
        handleCloseMenu();
        console.log('Share');
      },
    },
    {
      label: t('room_channel_header.menu_report'),
      icon: 'material-symbols:report-rounded',
      onClick: () => {
        handleCloseMenu();
        setReportOpen(true);
      },
    },
  ];

  const getMessagesWithHashtag = (tag) => {
    const tagNoHash = tag.startsWith('#') ? tag : `#${tag}`;
    return messages.filter(
      (msg) =>
        (msg.content && msg.content.includes(tagNoHash)) ||
        (msg.hashtags && msg.hashtags.includes(tagNoHash))
    );
  };

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
        {/* Left: avatar + room name */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          ) : (
            <RoomAvatar
              image={resolvedRoomDetail?.image ?? room?.icon ?? room?.image}
              name={room?.name}
              size={32}
              bgcolor={room?.color || '#4C4EFF'}
            />
          )}
          {isLoading ? (
            <Skeleton variant="text" width={120} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
          ) : (
            <Typography fontWeight={700} fontSize={15} color="#fff" lineHeight={1.2}>
              {room?.name}
            </Typography>
          )}
        </Stack>

        {/* Right: actions */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {isLoading ? (
            <>
              <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
            </>
          ) : null}
          {!isLoading && !isGarage && (
            <>
              {isFollowing !== false && (
                <IconButton size="small" sx={{ color: '#4C4EFF', '&:hover': { color: '#fff' } }} onClick={() => setShowHashtagList(true)}>
                  <Iconify icon="mdi:tag" width={20} />
                </IconButton>
              )}

              <IconButton
                size="small"
                onClick={handleToggleFavourite}
                sx={{ color: isFavourite ? '#FFD700' : '#bdbdbd', '&:hover': { color: '#fff' } }}
              >
                <Iconify
                  icon={isFavourite ? 'meteocons:star-fill' : 'meteocons:star'}
                  width={22}
                />
              </IconButton>
            </>
          )}

          {!isLoading && isGarage && (
            <Typography fontSize={12} color="#6B7280" sx={{ mr: 0.5, textTransform: 'capitalize' }}>
              {room?.visibility ?? t('search.visibility_personal')} · {t('room_channel_header.only_you')}
            </Typography>
          )}

          {/* Search */}
          {!isLoading && <Stack direction="row" spacing={0.5} alignItems="center">
            {showSearch ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#27272A',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  width: 220,
                }}
              >
                <Iconify icon="eva:search-fill" width={18} style={{ color: '#9CA3AF' }} />

                <input
                  autoFocus
                  placeholder={t('room_channel_header.search_placeholder')}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    marginLeft: 8,
                    width: '100%',
                    fontSize: 14,
                  }}
                />

                <IconButton size="small" onClick={() => { setShowSearch(false); setSearchValue(''); }}>
                  <Iconify icon="mdi:close" width={16} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                size="small"
                onClick={() => setShowSearch(true)}
                sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}
              >
                <Iconify icon="eva:search-fill" width={19} />
              </IconButton>
            )}
          </Stack>}

          {/* Follow / Request Sent button — only when user is not yet a member */}
          {!isLoading && (isFollowing === false || isPending) && (
            <Button
              size="small"
              onClick={handleFollowClick}
              disabled={followLoading}
              sx={{
                ml: 0.5, height: 30, px: 2, fontWeight: 600, borderRadius: 1.5, textTransform: 'none',
                fontSize: isPending ? 11 : 12,
                bgcolor: isPending ? 'transparent' : '#4C4EFF',
                color: isPending ? '#FFC107' : '#fff',
                border: isPending ? '1.5px solid rgba(255,193,7,0.5)' : 'none',
                '&:hover': { bgcolor: isPending ? 'rgba(255,193,7,0.08)' : '#3739b7' },
                '&.Mui-disabled': { opacity: 0.6 },
              }}
            >
              {followLoading
                ? <CircularProgress size={12} color="inherit" />
                : isPending ? t('room_channel_header.request_sent') : t('room_channel_header.follow')
              }
            </Button>
          )}

          {!isLoading && !isGarage && isFollowing !== false && (
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
          )}
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
            mt: 1.5,
            ml: 1.5,
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
        iconBgColor="#4C4EFF"
        confirmColor="#4C4EFF"
      />

      <RoomInformation
        open={roomInfoOpen}
        onClose={handleCloseRoomInformation}
        room={roomForDrawers}
        roomId={actualRoomId}
        enrichedMembers={enrichedMembers}
        isLoading={isRoomDetailFetching}
        isRoomAdmin={isRoomAdmin}
        permissionOverrides={memberPermissionOverrides}
        refreshKey={roomInfoRefreshKey}
        onEdit={() => setEditRoomOpen(true)}
        onDeleteRoom={onDeleteRoom}
        onMembersLoaded={setRoomApiMembers}
      />

      <RoomRequestDrawer
        open={roomRequestOpen}
        onClose={handleCloseRoomRequest}
        roomId={actualRoomId}
        isRoomAdmin={isRoomAdmin}
        permissionOverrides={memberPermissionOverrides}
        onMemberPermissionUpdate={handleMemberPermissionUpdate}
        onApprove={(request) => toast.success(t('room_channel_header.toast_approved', { name: request.name }))}
        onReject={(request) => toast.success(t('room_channel_header.toast_rejected', { name: request.name }))}
      />

      <CreateRoomModal
        open={editRoomOpen}
        onClose={() => setEditRoomOpen(false)}
        editMode
        initialValues={roomApiMembers ? { ...roomForDrawers, members: roomApiMembers } : roomForDrawers}
        onCreate={() => {
          setEditRoomOpen(false);
          if (roomId) fetchRoomById(roomId, true);
          setRoomInfoRefreshKey((k) => k + 1);
          setRoomInfoOpenNotify(true);
        }}
      />

      <UnfollowModal
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportFeedback(''); }}
        onConfirm={async () => {
          if (isSubmittingReport) return;
          try {
            await submitRoomReport({ roomId: actualRoomId, message: reportFeedback }).unwrap();
            toast.success(t('room_channel_header.toast_reported'));
          } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to submit report');
          } finally {
            setReportOpen(false);
            setReportFeedback('');
          }
        }}
        roomName={room?.name || 'this room'}
        title={t('room_channel_header.report_title')}
        icon="material-symbols:report-rounded"
        iconBgColor="#4C4EFF"
        confirmLabel={isSubmittingReport ? 'Submitting…' : t('room_channel_header.report_confirm')}
        confirmColor="#4C4EFF"
        feedback={reportFeedback}
        onFeedbackChange={setReportFeedback}
      />


      {/* Hashtag List Dialog */}
      {showHashtagList && (
        <React.Suspense fallback={null}>
          <RoomHashtagList
            open={showHashtagList}
            onClose={() => setShowHashtagList(false)}
            roomId={room?._id ?? room?.id}
            onHashtagClick={(tag) => {
              setSelectedHashtag(tag);
              setShowHashtagModal(true);
              setShowHashtagList(false);
            }}
          />
        </React.Suspense>
      )}
      {/* Hashtag Modal */}
      {showHashtagModal && (
        <HashtagModal
          open={showHashtagModal}
          onClose={() => setShowHashtagModal(false)}
          hashtag={selectedHashtag}
          roomId={room?._id ?? room?.id}
          onMessageClick={(message) => {
            // Close modal first, then scroll after animation finishes (~300ms)
            setShowHashtagModal(false);
            setTimeout(() => onMessageSelect?.(message), 350);
          }}
        />
      )}
    </>
  );
}

export default RoomChannelHeader;
