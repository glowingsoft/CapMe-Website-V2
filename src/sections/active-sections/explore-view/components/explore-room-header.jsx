import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Iconify } from 'src/components/iconify';
import RoomAvatar from 'src/components/room-avatar';
import UnfollowModal from 'src/sections/active-sections/home-view/components/unfollow-modal';
import { useCancelRoomRequestMutation, useToggleRoomFollowMutation } from 'src/store/Reducer/rooms-api';
import { useTranslate } from 'src/locales';
import { toast } from 'src/components/snackbar';

export default function ExploreRoomHeader({
  room,
  isFollowing,
  isPending,
  onFollowToggle,
  onFilterOpen,
  filterActive = false,
  isLoading = false,
  onBack = null,
}) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [toggleRoomFollow] = useToggleRoomFollowMutation();
  const [cancelRoomRequest] = useCancelRoomRequestMutation();
  const { t } = useTranslate('common');

  const handleFollow = async () => {
    const roomId = room?._id ?? room?.id;
    if (!roomId) return;

    // Cancel pending request
    if (isPending) {
      setLoading(true);
      try {
        await cancelRoomRequest(roomId).unwrap();
        toast.success(t('room_channel_header.toast_request_cancelled'));
        onFollowToggle(roomId, { cancelled: true });
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: false } }));
      } catch {
        toast.error(t('explore_drawer.toast_cancel_error'));
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const result = await toggleRoomFollow(roomId).unwrap();
      const msg = result?.message ?? '';
      const isRequestSent = msg.toLowerCase().includes('request') || msg.toLowerCase().includes('sent');

      if (isRequestSent && !isFollowing) {
        // Pending request — not yet following
        toast.info(t('room_channel_header.toast_request_sent'));
        onFollowToggle(roomId, { isPending: true });
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
      } else {
        // Actual follow/unfollow
        const nextFollowing = !isFollowing;
        toast.success(nextFollowing ? t('explore_drawer.toast_followed') : t('explore_drawer.toast_unfollowed'));
        onFollowToggle(roomId);
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: nextFollowing, isPending: false } }));
      }
    } catch (err) {
      const errMsg = err?.data?.message ?? err?.message ?? '';
      if (errMsg.toLowerCase().includes('already sent')) {
        toast.info(t('room_channel_header.toast_request_sent'));
        onFollowToggle(roomId, { isPending: true });
        window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
      } else {
        toast.error(t('explore_drawer.toast_update_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      label: t('room_channel_header.menu_share'),
      icon: 'mingcute:share-forward-fill',
      onClick: () => setMenuAnchor(null),
    },
    {
      label: t('room_channel_header.menu_report'),
      icon: 'material-symbols:report-rounded',
      onClick: () => { setMenuAnchor(null); setReportOpen(true); },
    },
  ];

  let followLabel = isFollowing ? t('explore_drawer.btn_following') : t('explore_drawer.btn_follow');
  if (isPending && !isFollowing) followLabel = t('explore_drawer.btn_request_sent');
  const memberCount = Number(room?.memberCount ?? 0);
  const showMemberCount = Number.isFinite(memberCount) && memberCount > 0;

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
        {/* Left: back button (mobile) + avatar + name */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {onBack && (
            <IconButton
              size="small"
              onClick={onBack}
              sx={{ color: '#fff', display: { xs: 'flex', md: 'none' }, mr: -0.5, flexShrink: 0 }}
            >
              <Iconify icon="mingcute:left-line" width={22} />
            </IconButton>
          )}
          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          ) : (
            <RoomAvatar image={room?.image ?? room?.icon} name={room?.name} size={32} bgcolor={room?.color || '#4C4EFF'} />
          )}
          <Box>
            {isLoading ? (
              <Skeleton variant="text" width={130} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
            ) : (
              <>
                <Typography fontWeight={700} fontSize={15} color="#fff" lineHeight={1.2} sx={{ maxWidth: '15ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room?.name}</Typography>
                {room?.hashtag && (
                  <Typography fontSize={11} color="rgba(255,255,255,0.5)">{room.hashtag}</Typography>
                )}
              </>
            )}
          </Box>
        </Stack>

        {/* Right: members + follow + menu */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {isLoading ? (
            <>
              <Skeleton variant="text" width={36} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
              <Skeleton variant="rounded" width={80} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1.5 }} />
              <Skeleton variant="circular" width={30} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
            </>
          ) : (
            <>
              {showMemberCount && (
                <>
                  <Typography fontSize={12} fontWeight={600} color="rgba(255,255,255,0.7)" sx={{ mr: 1 }}>
                    {memberCount}
                  </Typography>
                  <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />
                </>
              )}

              {onFilterOpen && (
                <IconButton
                  size="small"
                  onClick={onFilterOpen}
                  sx={{
                    position: 'relative',
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: filterActive ? 'rgba(76,78,255,0.22)' : 'rgba(255,255,255,0.10)',
                    color: '#fff',
                    '&:hover': { bgcolor: filterActive ? 'rgba(76,78,255,0.30)' : 'rgba(255,255,255,0.16)' },
                  }}
                  aria-label="Open filters"
                >
                  <Iconify icon="solar:filter-bold" width={18} />
                  {filterActive && (
                    <Box sx={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', bgcolor: '#4C4EFF' }} />
                  )}
                </IconButton>
              )}

              <Button
                size="small"
                onClick={handleFollow}
                disabled={loading}
                sx={{
                  ml: 0.5,
                  height: 30,
                  px: 2,
                  fontWeight: 600,
                  fontSize: isPending ? 11 : 12,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  bgcolor: isPending ? 'transparent' : isFollowing ? 'transparent' : '#4C4EFF',
                  color: isPending ? '#FFC107' : '#fff',
                  border: isPending
                    ? '1.5px solid rgba(255,193,7,0.5)'
                    : isFollowing ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: isPending ? 'rgba(255,193,7,0.08)' : isFollowing ? 'rgba(255,255,255,0.08)' : '#3739b7',
                  },
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {loading ? <CircularProgress size={12} color="inherit" /> : followLabel}
              </Button>

              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}
              >
                <Iconify icon="ph:dots-three-vertical-bold" width={18} />
              </IconButton>
            </>
          )}
        </Stack>
      </Box>

      {/* Menu popover */}
      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: {
            mt: 1,
            width: 200,
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
          } } }}
      >
        <Box sx={{ p: 1.5, position: 'relative', zIndex: 1, bgcolor: '#fff', borderRadius: 2.5 }}>
          {menuItems.map((item, i) => (
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
                  '&:hover': { bgcolor: 'rgba(79,70,229,0.08)' },
                }}
              >
                <Iconify icon={item.icon} width={20} sx={{ color: '#4F46E5' }} />
                <Typography fontSize={14} fontWeight={500} color="#111827">
                  {item.label}
                </Typography>
              </Box>
              {i < menuItems.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      </Popover>

      {/* Report modal */}
      <UnfollowModal
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportFeedback(''); }}
        onConfirm={() => {
          setReportOpen(false);
          setReportFeedback('');
          toast.success(t('room_channel_header.toast_reported'));
        }}
        roomName={room?.name}
        title={t('room_info.report_modal_title')}
        icon="material-symbols:report-rounded"
        iconBgColor="#4C4EFF"
        confirmLabel={t('room_info.report_modal_confirm')}
        confirmColor="#4C4EFF"
        feedback={reportFeedback}
        onFeedbackChange={setReportFeedback}
      />

    </>
  );
}
