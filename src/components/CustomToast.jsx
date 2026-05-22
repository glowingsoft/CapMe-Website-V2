import { Box, Typography, IconButton } from '@mui/material';
import { Iconify } from './iconify';
import toast from 'react-hot-toast';

export const CustomToast = ({ payload, t }) => {
  const title = payload?.notification?.title ?? 'Notification';
  const body = payload?.notification?.body ?? '';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: 360,
        maxWidth: '90vw',
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E8EB',
        borderRadius: '12px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        px: 2,
        py: 1.5,
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: 'rgba(76, 78, 255, 0.1)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon="iconoir:bell-notification-solid" sx={{ width: 20, height: 20, color: '#4C4EFF' }} />
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            color: '#1C252E',
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
        {body && (
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: '#637381',
              lineHeight: 1.5,
              mt: 0.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {body}
          </Typography>
        )}
      </Box>

      {/* Close */}
      <IconButton
        size="small"
        onClick={() => toast.dismiss(t?.id)}
        sx={{
          flexShrink: 0,
          alignSelf: 'flex-start',
          color: '#919EAB',
          width: 24,
          height: 24,
          '&:hover': { bgcolor: '#F4F6F8', color: '#1C252E' },
        }}
      >
        <Iconify icon="mingcute:close-line" sx={{ width: 14, height: 14 }} />
      </IconButton>
    </Box>
  );
};
