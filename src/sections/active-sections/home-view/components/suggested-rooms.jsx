import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { selectUser } from 'src/store/slices/userSlice';
import {
  useCancelRoomRequestMutation,
  useGetSuggestedRoomsQuery,
  useToggleRoomFollowMutation,
  useUnfollowRoomMutation,
} from 'src/store/Reducer/rooms-api';

export default function SuggestedRooms() {
  const router = useRouter();
  const currentUser = useSelector(selectUser);
  const currentUserId = String(currentUser?._id ?? currentUser?.id ?? currentUser?.basicInfo?._id ?? '');

  const { data: allRooms = [], isLoading } = useGetSuggestedRoomsQuery();
  const rooms = allRooms.slice(0, 6);
  const [toggleFollow] = useToggleRoomFollowMutation();
  const [cancelRequest] = useCancelRoomRequestMutation();
  const [unfollowRoom] = useUnfollowRoomMutation();

  // followState: { [roomId]: 'active' | 'requested' | undefined }
  const [followState, setFollowState] = useState({});
  const [loadingIds, setLoadingIds] = useState({});

  // Seed initial state from API data
  useEffect(() => {
    if (!rooms.length) return;
    setFollowState((prev) => {
      const next = { ...prev };
      rooms.forEach((r) => {
        if (next[r.id] !== undefined) return;
        if (r.is_following) {
          next[r.id] = 'active';
        } else if (r.is_requested || (currentUserId && r.requests.some((rid) => String(rid) === currentUserId))) {
          next[r.id] = 'requested';
        }
      });
      return next;
    });
  }, [rooms, currentUserId]);

  const setLoading = (id, val) => setLoadingIds((p) => ({ ...p, [id]: val }));

  const handleFollow = async (room) => {
    const { id } = room;
    const state = followState[id];

    if (state === 'active') {
      // Unfollow
      setLoading(id, true);
      try {
        await unfollowRoom(id).unwrap();
        setFollowState((p) => ({ ...p, [id]: undefined }));
      } catch {
        toast.error('Failed to unfollow room');
      } finally {
        setLoading(id, false);
      }
      return;
    }

    if (state === 'requested') {
      // Cancel request
      setLoading(id, true);
      try {
        await cancelRequest(id).unwrap();
        setFollowState((p) => ({ ...p, [id]: undefined }));
        toast.success('Request cancelled');
      } catch {
        toast.error('Failed to cancel request');
      } finally {
        setLoading(id, false);
      }
      return;
    }

    // Follow
    setLoading(id, true);
    try {
      const result = await toggleFollow(id).unwrap();
      const msg = result?.message ?? '';
      const isPending = msg.toLowerCase().includes('request') || msg.toLowerCase().includes('sent');
      if (isPending) {
        setFollowState((p) => ({ ...p, [id]: 'requested' }));
        toast.info('Follow request sent');
      } else {
        setFollowState((p) => ({ ...p, [id]: 'active' }));
        toast.success('Following room');
      }
    } catch (err) {
      const errMsg = err?.data?.message ?? err?.message ?? '';
      if (errMsg.toLowerCase().includes('already sent')) {
        setFollowState((p) => ({ ...p, [id]: 'requested' }));
        toast.info('Follow request sent');
      } else {
        toast.error('Failed to follow room');
      }
    } finally {
      setLoading(id, false);
    }
  };

  const handleOpen = (room) => {
    const roomObj = {
      id: room.id,
      name: room.name,
      icon: room.image,
      visibility: room.visibility,
      desc: room.description,
      unread: 0,
      favorite: false,
      lastMessageAt: room.createdAt || new Date().toISOString(),
    };
    // If home view is mounted it will pick this up via its openRoom listener;
    // otherwise navigate there carrying the room in location state.
    const handled = window.dispatchEvent(new CustomEvent('openRoom', { detail: roomObj }));
    if (!handled || window.location.pathname !== paths.dashboard.root) {
      router.push(paths.dashboard.root, { state: { pendingRoom: roomObj } });
    }
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', p: 2, bgcolor: '#fff', width: '100%', overflow: 'hidden' }}>
      <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
        <Box component="span" sx={{ color: '#4C4EFF' }}>Suggested</Box>
        {' Rooms'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Discover and manage your rooms.
      </Typography>

      <List disablePadding>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
            <ListItem key={i} sx={{ borderRadius: 2, mb: 1.3, pl: 1, pr: 1.5, bgcolor: 'rgba(76,78,255,0.04)', border: '1px solid rgba(76,78,255,0.08)' }}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={36} height={36} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" width={100} height={18} />}
                secondary={<Skeleton variant="text" width={140} height={14} />}
              />
              <Skeleton variant="rounded" width={90} height={30} sx={{ borderRadius: 2, flexShrink: 0, ml: 1 }} />
            </ListItem>
          ))
          : rooms.map((room) => {
            const state = followState[room.id];
            const isActive = state === 'active';
            const isRequested = state === 'requested';
            const isBusy = !!loadingIds[room.id];
            const label = isActive ? 'Following' : isRequested ? 'Requested' : 'Follow';
            return (
              <ListItem
                key={room.id}
                sx={{
                  borderRadius: 2,
                  mb: 1.3,
                  pl: 1,
                  pr: 1.5,
                  bgcolor: 'rgba(76,78,255,0.04)',
                  border: '1px solid rgba(76,78,255,0.08)',
                  cursor: 'default',
                  transition: 'background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                  '&:hover': {
                    bgcolor: 'rgba(76,78,255,0.10)',
                    borderColor: 'rgba(76,78,255,0.28)',
                    boxShadow: '0 2px 10px rgba(76,78,255,0.12)',
                  },
                }}
              >
                <ListItemAvatar
                  onClick={() => handleOpen(room)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Avatar
                    src={room.image || undefined}
                    sx={{ width: 36, height: 36, bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, fontSize: 15 }}
                  >
                    {room.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  onClick={() => handleOpen(room)}
                  sx={{ cursor: 'pointer' }}
                  primary={
                    <Typography fontWeight={600} fontSize={14} noWrap>
                      {room.name}
                    </Typography>
                  }
                  secondary={room.description}
                  secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary', noWrap: true }}
                />
                <Button
                  size="small"
                  variant={state ? 'outlined' : 'contained'}
                  disabled={isBusy}
                  onClick={() => handleFollow(room)}
                  sx={{
                    ml: 1,
                    minWidth: 90,
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
                    '&.Mui-disabled': { opacity: 0.6 },
                  }}
                >
                  {isBusy ? <CircularProgress size={12} color="inherit" /> : label}
                </Button>
              </ListItem>
            );
          })}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => router.push(paths.dashboard.explore)}
          sx={{
            px: 4,
            height: 30,
            borderRadius: 2,
            bgcolor: '#4C4EFF',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#3739b7' },
          }}
        >
          See More
        </Button>
      </Box>
    </Card>
  );
}
