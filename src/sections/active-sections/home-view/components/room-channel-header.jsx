import { useState, useEffect } from 'react';
import React from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DRAWER_EVENTS } from 'src/utils/drawer-events';

import UnfollowModal from './unfollow-modal';
import RoomInformation from './room-information';
import RoomRequestDrawer from './room-request-drawer';
import HashtagModal from './hashtag-modal';
import CreateRoomModal from './create-room-modal';
const RoomHashtagList = React.lazy(() => import('./room-hashtag-list'));

// Placeholder members — swap with real room.members when API is ready
const MOCK_MEMBERS = [
  { avatar: 'https://i.pravatar.cc/40?img=1' },
  { avatar: 'https://i.pravatar.cc/40?img=2' },
  { avatar: 'https://i.pravatar.cc/40?img=3' },
];

export default function RoomChannelHeader({ room, memberCount = 12, members = MOCK_MEMBERS, onRoomInfoOpenChange, messages = [], onMessageSelect, isGarage = false }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [unfollowOpen, setUnfollowOpen] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const [roomInfoOpen, setRoomInfoOpen] = useState(false);
  const [roomRequestOpen, setRoomRequestOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [toast, setToast] = useState({ open: false, message: '' });
  const [showHashtagList, setShowHashtagList] = useState(false);
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const showToast = (message) => setToast({ open: true, message });
  const hideToast = () => setToast((prev) => ({ ...prev, open: false }));
  const [isFavourite, setIsFavourite] = useState(room?.isFavourite || false);

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

  const handleToggleFavourite = () => {
    setIsFavourite((prev) => !prev);
    showToast(isFavourite ? 'Removed from favourites' : 'Added to favourites');
  };

  const handleConfirmUnfollow = async () => {
    try {
      setUnfollowLoading(true);

      setUnfollowOpen(false);
      showToast('You have unfollowed the room');
    } catch (error) {
      console.error('Failed to unfollow room:', error);
    } finally {
      setUnfollowLoading(false);
    }
  };

  const menuItems = [
    {
      label: 'Room Information',
      icon: 'material-symbols:info-rounded',
      onClick: handleOpenRoomInformation,
    },
    {
      label: 'Room Requests',
      icon: 'solar:users-group-rounded-bold',
      onClick: handleOpenRoomRequests,
    },
    {
      label: 'Following',
      icon: 'mdi:account-star',
      onClick: handleOpenUnfollowModal,
    },
    {
      label: 'Share',
      icon: 'mingcute:share-forward-fill',
      onClick: () => {
        handleCloseMenu();
        console.log('Share');
      },
    },
    {
      label: 'Report',
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
          <Typography fontWeight={700} fontSize={15} color="#fff" lineHeight={1.2}>
            {room?.name}
          </Typography>
        </Stack>

        {/* Right: actions */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {!isGarage && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                {members.slice(0, 3).map((m, i) => (
                  <Avatar
                    key={i}
                    src={m.avatar}
                    sx={{
                      width: 26,
                      height: 26,
                      ml: i === 0 ? 0 : '-8px',
                      border: '2px solid #18181B',
                      zIndex: 3 - i,
                    }}
                  />
                ))}
              </Box>

              <Typography fontSize={13} fontWeight={600} color="#fff" sx={{ mr: 1 }}>
                {memberCount}
              </Typography>

              <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

              <IconButton size="small" sx={{ color: '#4C4EFF', '&:hover': { color: '#fff' } }} onClick={() => setShowHashtagList(true)}>
                <Iconify icon="mdi:tag" width={20} />
              </IconButton>

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

          {isGarage && (
            <Typography fontSize={12} color="#6B7280" sx={{ mr: 0.5 }}>
              Private · Only you
            </Typography>
          )}

          {/* Search */}
          <Stack direction="row" spacing={0.5} alignItems="center">
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
                  placeholder="Search..."
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

                <IconButton size="small" onClick={() => setShowSearch(false)}>
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
          </Stack>

          {!isGarage && (
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
        room={room}
        onEdit={() => setEditRoomOpen(true)}
      />

      <RoomRequestDrawer
        open={roomRequestOpen}
        onClose={handleCloseRoomRequest}
        room={room}
        onApprove={(request) => showToast(`${request.name} approved`)}
        onReject={(request) => showToast(`${request.name} rejected`)}
      />

      <CreateRoomModal
        open={editRoomOpen}
        onClose={() => setEditRoomOpen(false)}
        editMode
        initialValues={room}
        onCreate={(data) => console.log('Room updated:', data)}
      />

      <UnfollowModal
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportFeedback(''); }}
        onConfirm={() => {
          setReportOpen(false);
          setReportFeedback('');
          showToast('Room reported successfully');
        }}
        roomName={room?.name || 'this room'}
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
        <Alert
          onClose={hideToast}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Hashtag List Dialog */}
      {showHashtagList && (
        <React.Suspense fallback={null}>
          <RoomHashtagList
            open={showHashtagList}
            onClose={() => setShowHashtagList(false)}
            messages={messages}
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
          messages={selectedHashtag ? getMessagesWithHashtag(selectedHashtag) : []}
          onMessageClick={(message) => {
            onMessageSelect?.(message);
            setShowHashtagModal(false);
          }}
        />
      )}
    </>
  );
}
