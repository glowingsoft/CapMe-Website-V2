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
import React, { useMemo, useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales';
import { useGetHomeRoomsQuery, useShareMessageMutation } from 'src/store/Reducer/rooms-api';

export default function ShareMessageModal({ open, onClose, messageId }) {
  const { t } = useTranslate('common');
  const [sharing, setSharing] = useState(null);
  const [sharedRooms, setSharedRooms] = useState(new Set());

  const { data: roomsData, isLoading } = useGetHomeRoomsQuery(
    { page: 1, limit: 50, type: 'all' },
    { skip: !open }
  );

  const [shareMessageApi] = useShareMessageMutation();

  const rooms = useMemo(() => {
    const raw = roomsData?.body?.rooms ?? roomsData?.body?.data ?? roomsData?.data ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => ({
      id: r._id ?? r.id,
      name: r.name ?? 'Room',
      avatar: r.image ?? r.icon ?? '',
      color: r.color ?? '#4C4EFF',
    }));
  }, [roomsData]);

  const handleClose = () => {
    setSharedRooms(new Set());
    onClose();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/message/${messageId}`;
    navigator.clipboard.writeText(link);
    toast.success(t('share_message_modal.toast_link_copied'));
    handleClose();
  };

  const handleShareToRoom = async (roomId) => {
    if (sharing || sharedRooms.has(roomId)) return;
    setSharing(roomId);
    try {
      const res = await shareMessageApi({ messageId, roomId }).unwrap();
      const newCount =
        res?.body?.shareCount ?? res?.shareCount ?? res?.body?.sharesCount ?? res?.sharesCount;

      setSharedRooms((prev) => new Set([...prev, roomId]));
      toast.success(t('share_message_modal.toast_shared'));

      window.dispatchEvent(
        new CustomEvent('shareMessage', {
          detail: { messageId, shareCount: newCount },
        })
      );
    } catch {
      toast.error(t('share_message_modal.toast_error'));
    } finally {
      setSharing(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography fontWeight={700} fontSize={16}>
          {t('share_message_modal.title')}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
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
          {t('share_message_modal.copy_link')}
        </Button>

        <Divider sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('share_message_modal.or_share')}
          </Typography>
        </Divider>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} sx={{ color: '#4C4EFF' }} />
          </Box>
        ) : rooms.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            {t('share_message_modal.no_rooms')}
          </Typography>
        ) : (
          <Stack spacing={0.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {rooms.map((room) => {
              const done = sharedRooms.has(room.id);
              const loading = sharing === room.id;
              return (
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
                    cursor: done ? 'default' : 'pointer',
                    opacity: done ? 0.6 : 1,
                    '&:hover': { bgcolor: done ? 'transparent' : 'rgba(76,78,255,0.06)' },
                  }}
                >
                  <Avatar
                    src={room.avatar || undefined}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: room.color,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {room.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }} noWrap>
                    {room.name}
                  </Typography>
                  {loading ? (
                    <CircularProgress size={18} sx={{ color: '#4C4EFF' }} />
                  ) : done ? (
                    <Iconify icon="mdi:check-circle" width={18} sx={{ color: '#43a047' }} />
                  ) : (
                    <Iconify icon="mingcute:send-line" width={18} sx={{ color: '#9e9e9e' }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
