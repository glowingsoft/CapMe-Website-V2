import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Iconify } from 'src/components/iconify';

// ─── Shared close button ──────────────────────────────────────────────────────
function CloseButton({ onClose, top = 8, right = 8 }) {
  return (
    <IconButton
      onClick={onClose}
      size="small"
      sx={{
        position: 'absolute',
        top,
        right,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: 'rgba(20,20,26,0.72)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.14)',
        '&:hover': { bgcolor: 'rgba(220,50,50,0.30)', borderColor: 'rgba(255,120,120,0.5)' },
      }}
    >
      <Iconify icon="mingcute:close-line" width={16} />
    </IconButton>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────────
export function VideoPreviewDialog({ open, url, name, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#000', borderRadius: 3, overflow: 'hidden', position: 'relative' } }}
    >
      <CloseButton onClose={onClose} />
      <Box
        component="video"
        src={url}
        controls
        autoPlay
        sx={{ width: '100%', display: 'block', maxHeight: '75vh', bgcolor: '#000' }}
      />
    </Dialog>
  );
}

// ─── PDF / iframe ─────────────────────────────────────────────────────────────
export function PdfPreviewDialog({ open, url, name, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', height: '85vh', position: 'relative' } }}
    >
      <CloseButton onClose={onClose} />
      <Box
        component="iframe"
        src={url}
        title={name || 'File preview'}
        sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </Dialog>
  );
}

// ─── Audio ────────────────────────────────────────────────────────────────────
export function AudioPreviewDialog({ open, url, name, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 2.5, position: 'relative' } }}
    >
      <CloseButton onClose={onClose} />
      <Typography variant="subtitle2" sx={{ mb: 1.5, pr: 4 }} noWrap>
        {name || 'Audio preview'}
      </Typography>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <Box
        component="audio"
        src={url}
        controls
        sx={{ width: '100%', display: 'block', outline: 'none' }}
      />
    </Dialog>
  );
}

export default function ImagePreviewDialog({ open, src, alt = 'Preview', onClose }) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!open) setLoaded(false);
  }, [open]);

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
      <Box sx={{ position: 'relative', width: 'min(1100px, 90vw)', display: 'block' }}>
        <CloseButton onClose={onClose} top={-14} right={-14} />

        {/* Image card */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 'min(80vh, 860px)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: '#12131f',
            boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.05) inset',
            cursor: 'default',
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

          <Box
            component="img"
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
}