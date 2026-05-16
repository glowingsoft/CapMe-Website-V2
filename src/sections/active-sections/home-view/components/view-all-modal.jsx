import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import RoomAvatar from 'src/components/room-avatar';


export default function ViewAllModal({
  open,
  onClose,
  title,
  items = [],
  type = 'room',
  activeRoomId,
  onRoomSelect,
  onFollowerAction,
  followerActionLabel = 'Remove',
  followerActionColor = '#B90000',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '75vh' } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 2 }}
      >
        <Typography fontWeight={700} fontSize={18}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 2,
          pb: 2,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        }}
      >
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#bdbdbd', fontSize: 14 }}>
            No items found.
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {type === 'room'
              ? items.map((room) => (
                  <Stack
                    key={room.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    onClick={() => {
                      onRoomSelect?.(room);
                      onClose();
                    }}
                    sx={{
                      p: 1.2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      bgcolor: activeRoomId === room.id ? 'rgba(76,78,255,0.08)' : 'transparent',
                      border: `1.5px solid ${activeRoomId === room.id ? '#4C4EFF' : 'transparent'}`,
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' },
                    }}
                  >
                    <RoomAvatar image={room.icon} name={room.name} size={38} bgcolor="#e8e9ff" color="#4C4EFF" />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} fontSize={14} noWrap>
                        {room.name}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary" noWrap>
                        {room.desc}
                      </Typography>
                    </Box>
                  </Stack>
                ))
              : items.map((follower) => (
                  <Box
                    key={follower.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: '#f9f9f9',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar src={follower.avatar} sx={{ width: 40, height: 40, flexShrink: 0 }} />
                      <Typography fontSize={14} fontWeight={600} noWrap>
                        {follower.name}
                      </Typography>
                    </Stack>
                    {onFollowerAction && (
                      <Button
                        size="small"
                        onClick={() => onFollowerAction(follower)}
                        sx={{
                          flexShrink: 0,
                          ml: 1,
                          bgcolor: followerActionColor,
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 1.5,
                          px: 1.5,
                          textTransform: 'none',
                          '&:hover': { filter: 'brightness(0.88)' },
                        }}
                      >
                        {followerActionLabel}
                      </Button>
                    )}
                  </Box>
                ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
