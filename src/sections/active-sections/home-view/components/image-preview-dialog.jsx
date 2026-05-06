import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import React from 'react';
import { Iconify } from 'src/components/iconify';

export default function ImagePreviewDialog({ open, src, alt = 'Preview', onClose }) {
  const [loaded, setLoaded] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);

  React.useEffect(() => {
    if (!open) { setLoaded(false); setZoomed(false); }
  }, [open]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = alt || 'image';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 220 }}
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          m: 0,
          overflow: 'visible',
          background: 'none',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 'min(1100px, 90vw)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar — matches app's dark card header style */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            pb: 1.5,
          }}
        >
          {/* Alt label — muted like app's secondary text */}
          <Box
            sx={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.07em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {alt}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Tooltip title={zoomed ? 'Fit to screen' : 'Zoom in'} placement="bottom">
              <IconButton
                onClick={() => setZoomed((z) => !z)}
                size="small"
                sx={actionBtnSx}
              >
                <Iconify
                  icon={zoomed ? 'mingcute:zoom-out-line' : 'mingcute:zoom-in-line'}
                  width={16}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download" placement="bottom">
              <IconButton onClick={handleDownload} size="small" sx={actionBtnSx}>
                <Iconify icon="mingcute:download-2-line" width={16} />
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Box
              sx={{
                width: '1px',
                height: 20,
                bgcolor: 'rgba(255,255,255,0.10)',
                mx: 0.5,
              }}
            />

            <Tooltip title="Close" placement="bottom">
              <IconButton onClick={onClose} size="small" sx={closeBtnSx}>
                <Iconify icon="mingcute:close-line" width={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Image card — styled like app's dark post card */}
        <Box
          onClick={() => setZoomed((z) => !z)}
          sx={{
            position: 'relative',
            width: '100%',
            height: zoomed ? 'min(92vh, 1000px)' : 'min(80vh, 860px)',
            transition: 'height 0.3s cubic-bezier(.4,0,.2,1)',
            borderRadius: '16px',
            overflow: 'hidden',
            // Matches app card border style
            border: '1px solid rgba(255,255,255,0.08)',
            // Deep dark bg matching app sidebar/card backgrounds
            bgcolor: '#12131f',
            boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.05) inset',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
          }}
        >
          {/* Shimmer skeleton while loading */}
          {!loaded && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, #12131f 25%, #1c1e30 50%, #12131f 75%)',
                backgroundSize: '400% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '100% 0' },
                  '100%': { backgroundPosition: '-100% 0' },
                },
              }}
            />
          )}

          {/* Subtle indigo glow corners — matches app's purple/indigo accent */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              background:
                'radial-gradient(ellipse at top left, rgba(76,78,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(76,78,255,0.05) 0%, transparent 55%)',
            }}
          />

          <Box
            component="img"
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: zoomed ? 'cover' : 'contain',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(.4,0,.2,1)',
              transform: zoomed ? 'scale(1.015)' : 'scale(1)',
            }}
          />
        </Box>

        {/* Bottom hint — matches app's muted secondary text style */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 1.25,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          Click to zoom · ESC to close
        </Box>
      </Box>
    </Dialog>
  );
}

const actionBtnSx = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.50)',
  bgcolor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: 'rgba(76,78,255,0.18)',
    borderColor: 'rgba(76,78,255,0.40)',
    color: '#a5a6ff',
  },
};

// Close button — red destructive hover
const closeBtnSx = {
  ...actionBtnSx,
  '&:hover': {
    bgcolor: 'rgba(220,50,50,0.18)',
    borderColor: 'rgba(220,50,50,0.35)',
    color: '#ff8080',
  },
};