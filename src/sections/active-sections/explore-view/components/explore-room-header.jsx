import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import UnfollowModal from 'src/sections/active-sections/home-view/components/unfollow-modal';

export default function ExploreRoomHeader({
  room,
  isFollowing,
  isPending,
  onFollowToggle,
  onFilterOpen,
  filterActive = false,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });

  const showToast = (message) => setToast({ open: true, message });
  const hideToast = () => setToast((p) => ({ ...p, open: false }));

  const handleFollow = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // TODO: replace with API call
    onFollowToggle(room._id);
    setLoading(false);
  };

  const menuItems = [
    {
      label: 'Share',
      icon: 'mingcute:share-forward-fill',
      onClick: () => setMenuAnchor(null),
    },
    {
      label: 'Report',
      icon: 'material-symbols:report-rounded',
      onClick: () => { setMenuAnchor(null); setReportOpen(true); },
    },
  ];

  let followLabel = isFollowing ? 'Following' : 'Follow';
  if (isPending && !isFollowing) followLabel = 'Requested';
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
        {/* Left: avatar + name */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: room?.color || '#4C4EFF',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {room?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize={15} color="#fff" lineHeight={1.2}>
              {room?.name}
            </Typography>
            {room?.hashtag && (
              <Typography fontSize={11} color="rgba(255,255,255,0.5)">
                {room.hashtag}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Right: members + follow + menu */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {showMemberCount && (
            <>
              <Typography fontSize={12} fontWeight={600} color="rgba(255,255,255,0.7)" sx={{ mr: 1 }}>
                {memberCount}
              </Typography>
              <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />
            </>
          )}

          {/* Filter */}
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
                <Box
                  sx={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#4C4EFF',
                  }}
                />
              )}
            </IconButton>
          )}

          {/* Follow button */}
          <Button
            size="small"
            onClick={handleFollow}
            disabled={loading}
            sx={{
              ml: 0.5,
              height: 30,
              px: 2,
              fontWeight: 600,
              fontSize: 12,
              textTransform: 'none',
              borderRadius: 1.5,
              bgcolor: isFollowing ? 'transparent' : '#4C4EFF',
              color: isFollowing ? '#fff' : '#fff',
              border: isFollowing ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
              '&:hover': {
                bgcolor: isFollowing ? 'rgba(255,255,255,0.08)' : '#3739b7',
              },
              '&.Mui-disabled': { opacity: 0.6 },
            }}
          >
            {loading ? <CircularProgress size={12} color="inherit" /> : followLabel}
          </Button>

          {/* Menu */}
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: '#bdbdbd', '&:hover': { color: '#fff' } }}
          >
            <Iconify icon="ph:dots-three-vertical-bold" width={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* Menu popover */}
      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
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
          },
        }}
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
          showToast('Room reported successfully');
        }}
        roomName={room?.name}
        title="Report Room"
        icon="material-symbols:report-rounded"
        iconBgColor="#4C4EFF"
        confirmLabel="Submit"
        confirmColor="#4C4EFF"
        feedback={reportFeedback}
        onFeedbackChange={setReportFeedback}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideToast} severity="success" variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
