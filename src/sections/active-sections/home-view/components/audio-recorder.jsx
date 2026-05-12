import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import { AudioPlayer } from './file-message';

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const BAR_HEIGHTS = Array.from({ length: 180 }, () => 8 + Math.floor(Math.random() * 22));

// Best MIME type this browser supports for recording
const MIME_TYPE = (() => {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  const chosen = candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
  // console.log('[AudioRecorder] selected MIME_TYPE:', chosen || '(browser default)');
  return chosen;
})();

function normalizeType(rawType) {
  const lower = (rawType || MIME_TYPE || 'audio/webm').toLowerCase();
  if (lower.includes('ogg')) return { type: 'audio/ogg', ext: 'ogg' };
  if (lower.includes('mp4')) return { type: 'audio/mp4', ext: 'mp4' };
  return { type: 'audio/webm', ext: 'webm' };
}

const MIN_SECONDS = 2;

export default function AudioRecorder({ onDone, onCancel }) {
  const [phase, setPhase] = useState('recording'); // recording | preview
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const cancelledRef = useRef(false);
  const audioUrlRef = useRef(null);
  const sentRef = useRef(false);
  const timerRef = useRef(null);
  const runIdRef = useRef(0);
  const liveStreamsRef = useRef(new Set());

  // ── Our own MediaRecorder with start(100) for reliable chunk collection ──
  // The hook's internal recorder uses start() without a timeslice which on some
  // Chrome/Windows builds flushes an incomplete webm container (~4 KB) regardless
  // of how long the user recorded. Collecting our own chunks with a 100 ms timeslice
  // always produces a complete blob.
  const ownRecorderRef = useRef(null);
  const ownStreamRef = useRef(null);   // kept so we can stop tracks and release the mic
  const ownChunksRef = useRef([]);
  const ownBlobRef = useRef(null);     // set in onstop, read in handleSend

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopStream = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    liveStreamsRef.current.delete(stream);
  };

  const stopAllStreams = () => {
    liveStreamsRef.current.forEach((stream) => {
      stream.getTracks().forEach((t) => t.stop());
    });
    liveStreamsRef.current.clear();
    ownStreamRef.current = null;
  };

  useEffect(() => {
    cancelledRef.current = false;
    setRecordingTime(0);
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    // Start our recorder with a 100 ms timeslice
    const initOwn = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelledRef.current || runId !== runIdRef.current) {
          stopStream(stream);
          return;
        }

        liveStreamsRef.current.add(stream);

        // If a previous stream exists (race / remount), close it first.
        if (ownStreamRef.current && ownStreamRef.current !== stream) {
          stopStream(ownStreamRef.current);
        }

        ownStreamRef.current = stream;   // store so we can release the mic later
        ownChunksRef.current = [];
        const opts = MIME_TYPE ? { mimeType: MIME_TYPE } : {};
        const rec = new MediaRecorder(stream, opts);
        ownRecorderRef.current = rec;

        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) ownChunksRef.current.push(e.data);
        };

        rec.start(100); // 100 ms timeslice — ensures all chunks are flushed
        setIsRecording(true);
        startTimer();
        console.log('[AudioRecorder] own MediaRecorder started, mimeType:', rec.mimeType);
      } catch (err) {
        console.error('[AudioRecorder] getUserMedia error:', err?.name, err?.message);
        setError(
          err?.name === 'NotAllowedError'
            ? 'Mic permission denied'
            : `Recording error: ${err?.message || err}`
        );
        console.error('[AudioRecorder] own recorder init error:', err);
      }
    };

    initOwn();

    return () => {
      cancelledRef.current = true;
      setIsRecording(false);
      stopTimer();

      // Stop own recorder and release mic on unmount
      const rec = ownRecorderRef.current;
      if (rec && rec.state !== 'inactive') rec.stop();
      ownRecorderRef.current = null;
      stopAllStreams();

      if (audioUrlRef.current && !sentRef.current) {
        console.log('[AudioRecorder] unmount — revoking unused URL');
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const handleStop = () => {
    if (recordingTime < MIN_SECONDS) {
      setError(`Please record at least ${MIN_SECONDS} seconds of audio.`);
      return;
    }

    // Stop our own recorder — onstop fires after final ondataavailable
    const rec = ownRecorderRef.current;
    if (!rec || rec.state === 'inactive') {
      setIsRecording(false);
      stopTimer();
      stopAllStreams();
      return;
    }

    setIsRecording(false);
    stopTimer();

    rec.onstop = () => {
      // Release the microphone as soon as encoding is done
      stopAllStreams();
      ownRecorderRef.current = null;

      if (cancelledRef.current) return;

      const mimeType = rec.mimeType || MIME_TYPE || 'audio/webm';
      const blob = new Blob(ownChunksRef.current, { type: mimeType });

      console.log('[AudioRecorder] recordingBlob:', blob);
      console.log('[AudioRecorder] recordingBlob.type:', blob.type);
      console.log('[AudioRecorder] recordingBlob.size:', blob.size, 'bytes');

      if (blob.size < 1000) {
        setError('Recording failed — blob is too small. Please check your microphone and try again.');
        return;
      }

      const url = URL.createObjectURL(blob);
      console.log('[AudioRecorder] audioUrl (preview):', url);

      ownBlobRef.current = blob;
      audioUrlRef.current = url;
      setAudioUrl(url);
      setPhase('preview');
    };

    rec.stop();
  };

  const handleSend = () => {
    const blob = ownBlobRef.current;
    if (!blob || !audioUrlRef.current) return;

    setIsRecording(false);
    stopTimer();

    const rec = ownRecorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
    stopAllStreams();

    const { type, ext } = normalizeType(blob.type);
    const file = new File([blob], `audio-${Date.now()}.${ext}`, { type });

    console.log('[AudioRecorder] file:', file);
    console.log('[AudioRecorder] file.type:', file.type);
    console.log('[AudioRecorder] file.size:', file.size, 'bytes');

    sentRef.current = true;

    onDone?.({
      file,
      url: audioUrlRef.current,
      type: file.type,
      name: file.name,
      size: file.size,
    });
  };

  const handleCancel = () => {
    cancelledRef.current = true;

    setIsRecording(false);
    stopTimer();

    const rec = ownRecorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
    ownRecorderRef.current = null;
    stopAllStreams();

    if (audioUrlRef.current && !sentRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    onCancel?.();
  };

  // ── Error state ──
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          bgcolor: '#fff5f5',
          borderRadius: 3,
          border: '1px solid #ffd0d0',
        }}
      >
        <Iconify icon="solar:danger-circle-bold" width={20} style={{ color: '#e53935' }} />
        <Typography fontSize={13} color="#e53935" sx={{ flex: 1 }}>
          {error}
        </Typography>
        <IconButton size="small" onClick={handleCancel}>
          <Iconify icon="mingcute:close-line" width={16} />
        </IconButton>
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
          gap: 1,
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

        {/* Dot + timer + bars in one flex section */}
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1, overflow: 'hidden' }}>
          {/* Pulsing red dot */}
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: '#e53935',
              flexShrink: 0,
              animation: 'blink 1.1s infinite',
              '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
            }}
          />

          {/* Timer */}
          <Typography fontSize={13} fontWeight={700} color="#e53935" sx={{ flexShrink: 0, minWidth: 34 }}>
            {formatTime(recordingTime)}
          </Typography>

          {/* Waveform bars */}
          <Stack direction="row" spacing={0.35} alignItems="center" sx={{ flex: 1, overflow: 'hidden' }}>
            {BAR_HEIGHTS.map((h, i) => (
              <Box
                key={i}
                sx={{
                  width: 3,
                  borderRadius: 2,
                  bgcolor: '#4C4EFF',
                  opacity: 0.35 + (i % 3) * 0.2,
                  height: `${h}px`,
                  flexShrink: 0,
                  animation: `wave ${0.5 + (i % 5) * 0.12}s ease-in-out infinite alternate`,
                  '@keyframes wave': {
                    from: { transform: 'scaleY(0.35)' },
                    to: { transform: 'scaleY(1)' },
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Stop button */}
        <IconButton
          size="small"
          onClick={handleStop}
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
      <IconButton size="small" onClick={handleCancel} sx={{ color: '#e53935', flexShrink: 0 }}>
        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
      </IconButton>

      {/* Audio preview */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AudioPlayer url={audioUrl} sx={{ bgcolor: 'transparent', border: 'none', px: 0, py: 0 }} />
      </Box>

      {/* Confirm / attach */}
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
        <Iconify icon="mingcute:check-line" width={20} />
      </IconButton>
    </Box>
  );
}
