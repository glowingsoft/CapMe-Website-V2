import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (type) => {
  if (type.startsWith('image/')) return 'solar:gallery-bold';
  if (type.startsWith('video/')) return 'solar:videocamera-bold';
  if (type.startsWith('audio/')) return 'solar:music-note-bold';
  return 'solar:file-bold';
};

export default function FileUploadProgress({ file, progress, onCancel }) {
  if (!file) return null;

  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1,
        px: 2,
        py: 1.5,
        bgcolor: '#f5f6ff',
        border: '1px solid #e0e0ff',
        borderRadius: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: '#4C4EFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={fileIcon(file.type)} width={20} style={{ color: '#fff' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontSize={13} fontWeight={600} noWrap color="text.primary">
            {file.name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flex: 1,
                height: 5,
                borderRadius: 10,
                bgcolor: '#dde0ff',
                '& .MuiLinearProgress-bar': { bgcolor: '#4C4EFF', borderRadius: 10 },
              }}
            />
            <Typography fontSize={11} color="text.secondary" sx={{ flexShrink: 0 }}>
              {progress < 100 ? `${progress}%` : 'Processing…'}
            </Typography>
          </Stack>
          <Typography fontSize={11} color="text.disabled" sx={{ mt: 0.3 }}>
            {formatBytes(file.size)}
          </Typography>
        </Box>

        {onCancel && progress < 100 && (
          <IconButton size="small" onClick={onCancel} sx={{ color: '#9e9e9e' }}>
            <Iconify icon="mingcute:close-line" width={16} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
