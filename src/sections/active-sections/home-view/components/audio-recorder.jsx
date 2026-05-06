import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import { AudioPlayer } from './file-message';

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Fixed bar heights generated once — prevents re-randomising on every render
const BAR_HEIGHTS = Array.from({ length: 28 }, () => 8 + Math.floor(Math.random() * 22));

export default function AudioRecorder({ onDone, onCancel }) {
  const [phase, setPhase] = useState('recording'); // recording | preview
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        chunksRef.current = [];

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          setAudioUrl(URL.createObjectURL(blob));
          setPhase('preview');
          streamRef.current?.getTracks().forEach((t) => t.stop());
        };

        recorder.start(100); // collect a chunk every 100 ms — ensures data even on short recordings
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      } catch (err) {
        if (!cancelled) setError(err?.name === 'NotAllowedError' ? 'Mic permission denied' : `Recording error: ${err?.message || err}`);
      }
    };

    start();

    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    clearInterval(timerRef.current);
    recorder.stop();
  };

  const handleSend = () => {
    if (!audioUrl) return;
    fetch(audioUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        onDone?.(file);
      });
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder) recorder.onstop = null; // prevent preview transition
    if (recorder?.state !== 'inactive') recorder?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCancel?.();
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, bgcolor: '#fff5f5', borderRadius: 3, border: '1px solid #ffd0d0' }}>
        <Iconify icon="solar:danger-circle-bold" width={20} style={{ color: '#e53935' }} />
        <Typography fontSize={13} color="#e53935" sx={{ flex: 1 }}>{error}</Typography>
        <IconButton size="small" onClick={handleCancel}><Iconify icon="mingcute:close-line" width={16} /></IconButton>
      </Box>
    );
  }

  // ── Recording phase ──
  if (phase === 'recording') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 3,
          px: 1.5,
          py: 0.75,
          boxShadow: '0px 1px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Cancel */}
        <IconButton size="small" onClick={handleCancel} sx={{ color: '#9e9e9e', flexShrink: 0 }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>

        {/* Pulsing red dot */}
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#e53935',
            flexShrink: 0,
            animation: 'blink 1.1s infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.2 },
            },
          }}
        />

        {/* Timer */}
        <Typography fontSize={15} fontWeight={700} color="#e53935" sx={{ flexShrink: 0 }}>
          {formatTime(elapsed)}
        </Typography>

        {/* Waveform bars — heights fixed at mount, only animation varies */}
        <Stack direction="row" spacing={0.4} alignItems="center" sx={{ flex: 1, px: 1 }}>
          {BAR_HEIGHTS.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                borderRadius: 2,
                bgcolor: '#4C4EFF',
                opacity: 0.35 + (i % 3) * 0.2,
                height: `${h}px`,
                animation: `wave ${0.5 + (i % 5) * 0.12}s ease-in-out infinite alternate`,
                '@keyframes wave': {
                  from: { transform: 'scaleY(0.35)' },
                  to: { transform: 'scaleY(1)' },
                },
              }}
            />
          ))}
        </Stack>

        {/* Stop button */}
        <IconButton
          size="small"
          onClick={stopRecording}
          sx={{
            flexShrink: 0,
            bgcolor: '#e53935',
            color: '#fff',
            width: 34,
            height: 34,
            borderRadius: '50%',
            '&:hover': { bgcolor: '#c62828' },
          }}
        >
          <Iconify icon="solar:stop-bold" width={16} />
        </IconButton>
      </Box>
    );
  }

  // ── Preview phase ──
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 3,
        px: 1.5,
        py: 0.75,
        boxShadow: '0px 1px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Discard */}
      <IconButton size="small" onClick={handleCancel} sx={{ color: '#9e9e9e', flexShrink: 0 }}>
        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
      </IconButton>

      {/* Themed audio player — transparent so it sits flush inside this row */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AudioPlayer url={audioUrl} sx={{ bgcolor: 'transparent', border: 'none', px: 0, py: 0 }} />
      </Box>

      {/* Send */}
      <IconButton
        size="small"
        onClick={handleSend}
        sx={{
          flexShrink: 0,
          bgcolor: '#4C4EFF',
          color: '#fff',
          width: 34,
          height: 34,
          borderRadius: '50%',
          '&:hover': { bgcolor: '#3739b7' },
        }}
      >
        <Iconify icon="mingcute:send-line" width={18} />
      </IconButton>
    </Box>
  );
}
