import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useGetHomeRoomsQuery } from 'src/store/Reducer/rooms-api';

export default function ShareMessageModal({ open, onClose, messageId, shareApi }) {
  const [sharing, setSharing] = useState(null); // roomId being shared to

  const { data: roomsData, isLoading } = useGetHomeRoomsQuery(
    { page: 1, limit: 30 },
    { skip: !open }
  );

  const rooms = React.useMemo(() => {
    const raw = roomsData?.body?.data ?? roomsData?.data ?? roomsData ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => ({
      id: r._id ?? r.id,
      name: r.name ?? r.roomName ?? 'Room',
      avatar: r.image ?? r.avatar ?? '',
      color: r.color ?? '#4C4EFF',
    }));
  }, [roomsData]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/message/${messageId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
    onClose();
  };

  const handleShareToRoom = async (roomId) => {
    setSharing(roomId);
    try {
      await shareApi(messageId).unwrap();
      toast.success('Shared successfully');
      onClose();
    } catch {
      toast.error('Failed to share');
    } finally {
      setSharing(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: 'hidden' },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography fontWeight={700} fontSize={16}>Share Message</Typography>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 2, pt: 0 }}>
        {/* Copy link */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Iconify icon="mdi:link-variant" width={20} />}
          onClick={handleCopyLink}
          sx={{
            mb: 2,
            borderRadius: 2.5,
            borderColor: '#e0e0e0',
            color: 'text.primary',
            fontWeight: 600,
            py: 1.2,
            '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'rgba(76,78,255,0.04)' },
          }}
        >
          Copy Link
        </Button>

        <Divider sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">or share to a room</Typography>
        </Divider>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : rooms.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No rooms found
          </Typography>
        ) : (
          <Stack spacing={0.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {rooms.map((room) => (
              <Box
                key={room.id}
                onClick={() => handleShareToRoom(room.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' },
                }}
              >
                <Avatar
                  src={room.avatar || undefined}
                  sx={{ width: 36, height: 36, bgcolor: room.color, fontWeight: 700, fontSize: 14 }}
                >
                  {room.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }}>
                  {room.name}
                </Typography>
                {sharing === room.id ? (
                  <CircularProgress size={18} />
                ) : (
                  <Iconify icon="mingcute:send-line" width={18} sx={{ color: '#9e9e9e' }} />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
