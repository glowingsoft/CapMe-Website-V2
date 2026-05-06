import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import DrawerHeader from './drawer-header';
import ViewAllModal from 'src/layouts/components/view-all';
import ImagePreviewDialog from './image-preview-dialog';

const MOCK_USER_ROOMS = [
  { name: 'Creative Rooms', icon: '' },
  { name: 'Finance Mania', icon: '' },
  { name: 'Travel Lovers', icon: '' },
];

const MOCK_USER_FRIENDS = [
  { name: 'John Doe', icon: 'https://i.pravatar.cc/46?img=11' },
  { name: 'Jane Smith', icon: 'https://i.pravatar.cc/46?img=12' },
  { name: 'Alice Brown', icon: 'https://i.pravatar.cc/46?img=13' },
];

const MOCK_USER_FOLLOWING = [
  { name: 'Music Mania', icon: '' },
  { name: 'Friendship Goals', icon: '' },
];

export default function UserProfileDrawer({ open, onClose, user }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [friendState, setFriendState] = useState(undefined);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  const cycleFriend = () =>
    setFriendState((cur) =>
      cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined
    );

  const friendLabel = friendState === 'active' ? 'Friends' : friendState === 'requested' ? 'Cancel request' : 'Add Friend';

  const lists = [MOCK_USER_ROOMS, MOCK_USER_FRIENDS, MOCK_USER_FOLLOWING];
  const filtered = lists[tab].filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoomClick = (room) => {
    window.dispatchEvent(new CustomEvent('openRoom', { detail: room }));
    onClose();
  };

  const handleFriendClick = (friend) => {
    window.dispatchEvent(new CustomEvent('openUserProfile', { detail: { name: friend.name, avatar: friend.icon } }));
  };

  const [roomFollowStates, setRoomFollowStates] = useState({});
  const cycleRoomFollow = (e, key) => {
    e.stopPropagation();
    setRoomFollowStates((prev) => {
      const cur = prev[key];
      const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
      return { ...prev, [key]: next };
    });
  };

  const [friendStates, setFriendStates] = useState({});
  const cycleFriendState = (e, key) => {
    e.stopPropagation();
    setFriendStates((prev) => {
      const cur = prev[key];
      const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
      return { ...prev, [key]: next };
    });
  };

  const tabLabels = ['Rooms', 'Friends', 'Following'];
  const tabTypes = ['rooms', 'friends', 'following'];

  const [viewAll, setViewAll] = useState({ open: false, search: '' });

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
        <DrawerHeader title={user.name || 'Profile'} onBack={onClose} showEdit={false} showShare={false} />

        <Scrollbar>
          {/* Avatar */}
          <Stack alignItems="center" sx={{ pt: 4, pb: 2 }}>
            <Avatar
              src={user.avatar || undefined}
              onClick={user.avatar ? () => setAvatarPreviewOpen(true) : undefined}
              sx={{
                width: 200,
                height: 200,
                borderRadius: 4,
                bgcolor: '#4C4EFF',
                fontSize: 64,
                fontWeight: 700,
                color: '#fff',
                cursor: user.avatar ? 'pointer' : 'default',
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>

            <ImagePreviewDialog
              open={avatarPreviewOpen}
              src={user.avatar}
              alt={`${user.name || 'User'} avatar`}
              onClose={() => setAvatarPreviewOpen(false)}
            />

            <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
              {user.name}
            </Typography>

            {user.username && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                {user.username}
              </Typography>
            )}
          </Stack>

          {/* Add Friend button */}
          <Stack sx={{ px: 3, pb: 3 }}>
            <Button
              fullWidth
              variant={friendState ? 'outlined' : 'contained'}
              onClick={cycleFriend}
              sx={{
                height: 40,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'none',
                boxShadow: 'none',
                ...(friendState === 'active'
                  ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                  : friendState === 'requested'
                    ? { borderColor: '#bbb', color: '#888', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }
                    : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
              }}
            >
              {friendLabel}
            </Button>
          </Stack>

          {/* Stats */}
          <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ px: 2, pb: 3 }}>
            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{MOCK_USER_ROOMS.length}</Typography>
              <Typography variant="body2" color="text.secondary">Rooms</Typography>
            </Stack>
            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />
            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{MOCK_USER_FRIENDS.length.toString().padStart(2, '0')}</Typography>
              <Typography variant="body2" color="text.secondary">Friends</Typography>
            </Stack>
            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />
            <Stack alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{MOCK_USER_FOLLOWING.length.toString().padStart(2, '0')}</Typography>
              <Typography variant="body2" color="text.secondary">Following</Typography>
            </Stack>
          </Stack>

          {/* Search */}
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
                {label} ({lists[i].length.toString().padStart(2, '0')})
              </Button>
            ))}
          </Stack>

          {/* List */}
          <Box sx={{ px: 2, pb: 3 }}>
            <Stack spacing={1}>
              {filtered.length === 0 ? (
                <Typography color="text.secondary" fontSize={14} sx={{ textAlign: 'center', py: 3 }}>
                  No results found.
                </Typography>
              ) : (
                filtered.map((item, i) => {
                  const rKey = `room-${i}`;
                  const fKey = `friend-${i}`;
                  const isRoomTab = tab === 0 || tab === 2;
                  const rState = isRoomTab ? roomFollowStates[rKey] : undefined;
                  const rLabel = rState === 'active' ? 'Following' : rState === 'requested' ? 'Cancel request' : 'Follow';
                  const fState = tab === 1 ? friendStates[fKey] : undefined;
                  const fLabel = fState === 'active' ? 'Friends' : fState === 'requested' ? 'Cancel request' : 'Add';

                  const handleClick = () => {
                    if (tab === 0 || tab === 2) handleRoomClick(item);
                    else if (tab === 1) handleFriendClick(item);
                  };

                  return (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      onClick={handleClick}
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
                      <Typography className="item-name" fontSize={14} fontWeight={600} color="text.primary" noWrap sx={{ flexGrow: 1, transition: 'color 0.15s' }}>
                        {item.name}
                      </Typography>
                      {isRoomTab && (
                        <Button
                          size="small"
                          variant={rState ? 'outlined' : 'contained'}
                          onClick={(e) => cycleRoomFollow(e, rKey)}
                          sx={{
                            minWidth: 100,
                            height: 30,
                            borderRadius: 2,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'none',
                            flexShrink: 0,
                            boxShadow: 'none',
                            ...(rState === 'active'
                              ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                              : rState === 'requested'
                                ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                          }}
                        >
                          {rLabel}
                        </Button>
                      )}
                      {tab === 1 && (
                        <Button
                          size="small"
                          variant={fState ? 'outlined' : 'contained'}
                          onClick={(e) => cycleFriendState(e, fKey)}
                          sx={{
                            minWidth: 100,
                            height: 30,
                            borderRadius: 2,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'none',
                            flexShrink: 0,
                            boxShadow: 'none',
                            ...(fState === 'active'
                              ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                              : fState === 'requested'
                                ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                          }}
                        >
                          {fLabel}
                        </Button>
                      )}
                    </Stack>
                  );
                })
              )}
            </Stack>
            {lists[tab].length > 0 && (
              <Button
                fullWidth
                onClick={() => setViewAll({ open: true, search: '' })}
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
                See All {tabLabels[tab]} ({lists[tab].length.toString().padStart(2, '0')})
              </Button>
            )}
          </Box>
        </Scrollbar>
      </Drawer>

      <ViewAllModal
        open={viewAll.open}
        onClose={() => setViewAll((prev) => ({ ...prev, open: false }))}
        title={tabLabels[tab]}
        type={tabTypes[tab]}
        data={lists[tab]}
        search={viewAll.search}
        setSearch={(s) => setViewAll((prev) => ({ ...prev, search: s }))}
      />
    </>
  );
}
