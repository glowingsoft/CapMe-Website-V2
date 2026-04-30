import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Iconify } from 'src/components/iconify';

export default function SuggestedRooms({ rooms }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 12px rgba(0,0,0,0.07)', p: 2, bgcolor: '#fff' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Suggested Rooms
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Discover and manage your rooms.
      </Typography>

      <List disablePadding>
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            sx={{
              borderRadius: 2,
              mb: 1.3,
              pl: 1,
              pr: 2,
              bgcolor: '#F5F5F5',
            }}
          >
            <ListItemAvatar>
              <Avatar src={room.icon} sx={{ width: 36, height: 36 }} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography fontWeight={600} fontSize={15}>
                  {room.name}
                </Typography>
              }
              secondary={room.desc}
              secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }}
            />
            <Iconify icon="meteocons:star" width={24} style={{ color: '#888', cursor: 'pointer' }} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
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
