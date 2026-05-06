import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function SuggestedRooms({ rooms }) {
  const router = useRouter();
  const [followed, setFollowed] = useState({});

  const cycleFollow = (id) =>
    setFollowed((prev) => {
      const cur = prev[id];
      const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
      return { ...prev, [id]: next };
    });

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', p: 2, bgcolor: '#fff' }}>
      <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
        <Box component="span" sx={{ color: '#4C4EFF' }}>Suggested</Box>
        {' Rooms'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Discover and manage your rooms.
      </Typography>

      <List disablePadding>
        {rooms.map((room) => {
          const state = followed[room.id];
          const label = state === 'active' ? 'Following' : state === 'requested' ? 'Cancel request' : 'Follow';
          const isActive = state === 'active';
          const isRequested = state === 'requested';
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
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={room.icon || undefined}
                  sx={{ width: 36, height: 36, bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, fontSize: 15 }}
                >
                  {room.name?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight={600} fontSize={14} noWrap>
                    {room.name}
                  </Typography>
                }
                secondary={room.desc}
                secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary', noWrap: true }}
              />
              <Button
                size="small"
                variant={state ? 'outlined' : 'contained'}
                onClick={() => cycleFollow(room.id)}
                sx={{
                  ml: 1,
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
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => router.push(paths.dashboard.explore)}
          sx={{
            mt: 1,
            px: 10,
            py: 1,
            borderRadius: 1,
            bgcolor: '#4C4EFF',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
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
