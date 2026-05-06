import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import ImagePreviewDialog from './image-preview-dialog';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmt = (s) => {
  if (!s || !isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export function AudioPlayer({ url, sx }) {
  const audioRef = useRef(null);
  const seekingForDurationRef = useRef(false);
  const rafRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const stopRAF = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startRAF = () => {
    stopRAF();
    const tick = () => {
      const el = audioRef.current;
      if (el && !el.paused) {
        setCurrentTime(el.currentTime);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Proper RAF cleanup on unmount
  useEffect(() => () => stopRAF(), []);

  // Reset all player state whenever the audio URL changes
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    stopRAF();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    seekingForDurationRef.current = false;
    console.log('[AudioPlayer] url changed:', url);
  }, [url]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
      stopRAF();
    } else {
      el.play()
        .then(() => {
          setPlaying(true);
          startRAF();
        })
        .catch((err) => {
          console.error('[AudioPlayer] play failed:', err?.message || err);
          setPlaying(false);
          stopRAF();
        });
    }
  };

  // Handles the Infinity-duration quirk of MediaRecorder blobs:
  // seek to a huge value forces the browser to scan the full stream and report real duration.
  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    console.log('[AudioPlayer] metadata loaded — raw duration:', el.duration);
    if (!isFinite(el.duration)) {
      seekingForDurationRef.current = true;
      el.currentTime = 1e101;
    } else {
      setDuration(el.duration);
    }
  };

  const handleDurationChange = () => {
    const el = audioRef.current;
    if (!el || !isFinite(el.duration)) return;
    console.log('[AudioPlayer] durationchange:', el.duration);
    setDuration(el.duration);
  };

  const handleSeeked = () => {
    const el = audioRef.current;
    if (!el || !seekingForDurationRef.current) return;
    seekingForDurationRef.current = false;
    const d = isFinite(el.duration) ? el.duration : 0;
    console.log('[AudioPlayer] seeked — resolved duration:', d);
    setDuration(d);
    el.currentTime = 0;
  };

  // onTimeUpdate as a fallback in case RAF ticks stall (tab inactive, etc.)
  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (el && !el.paused) setCurrentTime(el.currentTime);
  };

  const handleError = () => {
    const el = audioRef.current;
    const msg = el?.error?.message || 'unknown audio error';
    console.error('[AudioPlayer] audio element error:', msg, 'url:', url);
    setPlaying(false);
    stopRAF();
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        px: 2,
        py: 1.4,
        bgcolor: '#f5f6ff',
        border: '1px solid #e0e0ff',
        borderRadius: 2.5,
        ...sx,
      }}
    >
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          onSeeked={handleSeeked}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
            stopRAF();
          }}
          onError={handleError}
          style={{ display: 'none' }}
        />
      )}

      {/* Waveform icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: '#4C4EFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon="solar:soundwave-bold" width={18} style={{ color: '#fff' }} />
      </Box>

      {/* Play / Pause */}
      <IconButton
        size="small"
        onClick={toggle}
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#4C4EFF',
          color: '#fff',
          borderRadius: '50%',
          flexShrink: 0,
          '&:hover': { bgcolor: '#3739b7' },
        }}
      >
        <Iconify icon={playing ? 'solar:pause-bold' : 'solar:play-bold'} width={14} />
      </IconButton>

      {/* Current time */}
      <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ flexShrink: 0, minWidth: 28 }}>
        {fmt(currentTime)}
      </Typography>

      {/* Progress bar */}
      <Box
        onClick={handleSeek}
        sx={{
          flex: 1,
          minWidth: 0,
          height: 4,
          bgcolor: '#e0e1ff',
          borderRadius: 2,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            bgcolor: '#4C4EFF',
            borderRadius: 2,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#4C4EFF',
            boxShadow: '0 0 0 2px #fff',
          }}
        />
      </Box>

      {/* Duration */}
      <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ flexShrink: 0, minWidth: 28, textAlign: 'right' }}>
        {fmt(duration)}
      </Typography>
    </Stack>
  );
}

export default function FileMessage({ file }) {
  const { url, type, name, size } = file;
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  if (type?.startsWith('image/')) {
    return (
      <>
        <Box
          component="img"
          src={url}
          alt={name}
          onClick={() => setImagePreviewOpen(true)}
          sx={{
            maxWidth: '100%',
            maxHeight: 300,
            borderRadius: 2,
            objectFit: 'cover',
            display: 'block',
            cursor: 'pointer',
          }}
        />

        <ImagePreviewDialog
          open={imagePreviewOpen}
          src={url}
          alt={name || 'Image preview'}
          onClose={() => setImagePreviewOpen(false)}
        />
      </>
    );
  }

  if (type?.startsWith('video/')) {
    return (
      <Box
        component="video"
        src={url}
        controls
        sx={{ maxWidth: '100%', maxHeight: 280, borderRadius: 2, display: 'block', bgcolor: '#000' }}
      />
    );
  }

  if (type?.startsWith('audio/')) {
    return <AudioPlayer url={url} />;
  }

  // Generic file card
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: '#f5f6ff',
        border: '1px solid #e0e0ff',
        borderRadius: 2.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: '#eceeff' },
      }}
      onClick={() => window.open(url, '_blank')}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: '#4C4EFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon="solar:file-bold" width={22} style={{ color: '#fff' }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={600} noWrap color="text.primary">
          {name}
        </Typography>
        <Typography fontSize={11} color="text.secondary">
          {formatBytes(size)}
        </Typography>
      </Box>

      <Iconify icon="solar:download-minimalistic-bold" width={18} style={{ color: '#4C4EFF', flexShrink: 0 }} />
    </Stack>
  );
}
