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
  // report / feedback mode
  title = 'Confirmation',
  description,
  confirmLabel,
  confirmColor = '#C40000',
  icon = 'material-symbols:priority-high-rounded',
  iconBgColor = '#C40000',
  feedback,
  onFeedbackChange,
}) {
  const isReportMode = feedback !== undefined;
  const iconBg = getSoftIconBg(iconBgColor);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.55)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3.5, pb: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Iconify icon={icon} width={30} sx={{ color: iconBgColor }} />
        </Box>

        <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.75 }}>
          {title}
        </Typography>

        {isReportMode ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
              {description ?? `Please share your feedback about "${roomName}"`}
            </Typography>

            <Box
              component="textarea"
              value={feedback}
              onChange={(e) => onFeedbackChange?.(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              sx={{
                width: '100%',
                resize: 'none',
                border: '1.5px solid #e0e0e0',
                borderRadius: '10px',
                p: '14px 16px',
                fontSize: 14,
                fontFamily: 'inherit',
                color: '#222',
                bgcolor: '#fafbfc',
                outline: 'none',
                mb: 3,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                '&:focus': { borderColor: '#4C4EFF' },
              }}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
            {description ?? `Are you sure you want to unfollow "${roomName}"?`}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            disabled={loading}
            onClick={onClose}
            sx={{
              minWidth: 100,
              borderColor: 'rgba(0,0,0,0.15)',
              color: 'text.primary',
              borderRadius: 2,
              py: 0.95,
              px: 2.75,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={loading || (isReportMode && !feedback?.trim())}
            onClick={onConfirm}
            sx={{
              minWidth: 100,
              bgcolor: confirmColor,
              color: '#fff',
              borderRadius: 2,
              py: 0.95,
              px: 2.75,
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: confirmColor, filter: 'brightness(0.88)', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: confirmColor, color: '#fff', opacity: 0.45 },
            }}
          >
            {loading ? 'Submitting...' : (confirmLabel ?? (isReportMode ? 'Submit' : 'Unfollow'))}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function getSoftIconBg(hexColor) {
  const hex = (hexColor || '').replace('#', '');
  if (hex.length !== 6) return 'rgba(76,78,255,0.10)';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.10)`;
}