import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { Iconify } from 'src/components/iconify';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import {
  useGetSuggestedRoomsQuery,
  useToggleRoomFollowMutation,
} from 'src/store/Reducer/rooms-api';

export default function SuggestedRooms({ expanded, onExpandedChange }) {
  const router = useRouter();

  const { data: allRooms = [], isLoading, refetch } = useGetSuggestedRoomsQuery();
  const rooms = useMemo(() => allRooms.slice(0, 6), [allRooms]);
  const [toggleFollow] = useToggleRoomFollowMutation();
  const [loadingIds, setLoadingIds] = useState({});

  const setLoading = (id, val) => setLoadingIds((p) => ({ ...p, [id]: val }));

  const handleFollow = async (room) => {
    setLoading(room.id, true);
    try {
      const result = await toggleFollow(room.id).unwrap();
      const msg = result?.message ?? '';
      const isPending = msg.toLowerCase().includes('request') || msg.toLowerCase().includes('sent');
      window.dispatchEvent(
        new CustomEvent('roomFollowUpdate', {
          detail: { roomId: room.id, isFollowing: !isPending, isPending },
        })
      );
      refetch();
    } catch (err) {
      const errMsg = err?.data?.message ?? err?.message ?? '';
      if (errMsg.toLowerCase().includes('already sent')) {
        window.dispatchEvent(
          new CustomEvent('roomFollowUpdate', {
            detail: { roomId: room.id, isFollowing: false, isPending: true },
          })
        );
      } else {
        toast.error('Failed to follow room');
      }
    } finally {
      setLoading(room.id, false);
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
    const handled = window.dispatchEvent(new CustomEvent('openRoom', { detail: roomObj }));
    if (!handled || window.location.pathname !== paths.dashboard.root) {
      router.push(paths.dashboard.root, { state: { pendingRoom: roomObj } });
    }
  };

  const PANEL_WIDTH = 420;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Toggle button — fixed, mirrors left drawer style, transitions with the panel */}
      <IconButton
        onClick={() => onExpandedChange((v) => !v)}
        sx={{
          position: 'fixed',
          top: 120,
          right: expanded ? PANEL_WIDTH + 32 - 17 : 32 - 17,
          bgcolor: '#4C4EFF',
          color: '#fff',
          width: 35,
          height: 35,
          zIndex: 200,
          borderRadius: '50%',
          boxShadow: 2,
          transition: 'right 0.3s cubic-bezier(.4,0,.2,1)',
          '&:hover': { bgcolor: '#3739b7' },
          display: { xs: 'none', lg: 'flex' },
        }}
      >
        <Iconify
          icon={expanded ? 'mingcute:right-line' : 'mingcute:left-line'}
          width={24}
        />
      </IconButton>

      {/* Animated panel — slides in/out horizontally */}
      <Box
        sx={{
          width: expanded ? PANEL_WIDTH : 0,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
          flexShrink: 0,
        }}
      >
        <Card
          sx={{
            width: PANEL_WIDTH,
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            p: 2,
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ mb: 1.5, pl: 3 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>Suggested</Box>
              {' Rooms'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover and manage your rooms.
            </Typography>
          </Box>

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
              : rooms.map((room) => (
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
                  <ListItemAvatar onClick={() => handleOpen(room)} sx={{ cursor: 'pointer' }}>
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
                    variant="contained"
                    disabled={!!loadingIds[room.id]}
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
                      bgcolor: '#4C4EFF',
                      color: '#fff',
                      border: '1px solid #4C4EFF',
                      '&:hover': { bgcolor: '#3739b7' },
                      '&.Mui-disabled': { opacity: 0.6 },
                    }}
                  >
                    {loadingIds[room.id] ? <CircularProgress size={12} color="inherit" /> : 'Follow'}
                  </Button>
                </ListItem>
              ))}
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
      </Box>
    </Box>
  );
}
