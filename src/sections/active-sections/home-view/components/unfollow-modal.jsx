import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export default function UnfollowModal({
  open,
  onClose,
  onConfirm,
  roomName = 'this room',
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          px: 4,
          py: 4,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.55)',
          backdropFilter: 'blur(3px)',
        },
      }}
    >
      {/* Icon */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            bgcolor: '#C40000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(196,0,0,0.22)',
          }}
        >
          <Iconify
            icon="material-symbols:priority-high-rounded"
            width={46}
            sx={{ color: '#fff' }}
          />
        </Box>
      </Box>

      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 800,
          color: '#514BFF',
          mb: 1.5,
        }}
      >
        Confirmation
      </Typography>

      <Typography
        sx={{
          fontSize: 16,
          color: '#666',
          lineHeight: 1.6,
        }}
      >
        Are you sure you want to unfollow
      </Typography>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 800,
          color: '#514BFF',
          mb: 3,
        }}
      >
        {roomName}?
      </Typography>

      <Button
        fullWidth
        disabled={loading}
        onClick={onConfirm}
        sx={{
          height: 52,
          borderRadius: 2,
          bgcolor: '#C40000',
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: '0 12px 28px rgba(196,0,0,0.28)',
          '&:hover': {
            bgcolor: '#A90000',
          },
          '&.Mui-disabled': {
            bgcolor: '#C40000',
            color: '#fff',
            opacity: 0.6,
          },
        }}
      >
        {loading ? 'Unfollowing...' : 'Unfollow'}
      </Button>

      <Button
        disabled={loading}
        onClick={onClose}
        sx={{
          mt: 1.5,
          color: '#777',
          fontSize: 16,
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'transparent',
            color: '#444',
          },
        }}
      >
        Not Now
      </Button>
    </Dialog>
  );
}