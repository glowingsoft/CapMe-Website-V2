import { useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ProfilePageShell from 'src/components/profile-page-shell';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { useGetRoomDownloadedMediaQuery } from 'src/store/Reducer/rooms-api';
import DrawerHeader from './drawer-header';
import { AudioPlayer } from './file-message';
import ImagePreviewDialog from './image-preview-dialog';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeLabel = (name = '', type = '') => {
  const ext = name.split('.').pop()?.toUpperCase();
  if (ext) return ext;
  if (type) return type.split('/').pop()?.toUpperCase() || 'FILE';
  return 'FILE';
};

const getFileStyle = (name = '', type = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (type === 'application/pdf' || ext === 'pdf')
    return { icon: 'solar:file-text-bold', color: '#e53935' };
  if (['doc', 'docx'].includes(ext))
    return { icon: 'solar:file-text-bold', color: '#1565c0' };
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return { icon: 'solar:file-bold', color: '#2e7d32' };
  if (['ppt', 'pptx'].includes(ext))
    return { icon: 'solar:file-bold', color: '#e65100' };
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext))
    return { icon: 'solar:archive-bold', color: '#f57c00' };
  return { icon: 'solar:file-bold', color: '#9e9e9e' };
};

const TABS = [
  { label: 'Images', icon: 'solar:gallery-bold', type: 'image' },
  { label: 'Videos', icon: 'solar:videocamera-bold', type: 'video' },
  { label: 'Audio', icon: 'solar:music-note-bold', type: 'audio' },
  { label: 'Files', icon: 'solar:folder-bold', type: 'file' },
];

// ── Lightbox / Video modal ───────────────────────────────────────────────────
const BACKDROP_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2,
  '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.88)' },
};

function CloseBtn({ onClick }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: -14,
        right: -14,
        zIndex: 1,
        bgcolor: '#fff',
        width: 32,
        height: 32,
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        '&:hover': { bgcolor: '#f0f0f0' },
      }}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}

function ImageLightbox({ image, onClose }) {
  return <ImagePreviewDialog open={!!image} src={image?.url} alt={image?.name || 'Image preview'} onClose={onClose} />;
}

function VideoModal({ video, onClose }) {
  return (
    <Modal open={!!video} onClose={onClose} sx={BACKDROP_SX}>
      <Box sx={{ position: 'relative', outline: 'none', maxWidth: 640, width: '100%' }}>
        <CloseBtn onClick={onClose} />
        {video?.url ? (
          <Box
            component="video"
            src={video.url}
            controls
            autoPlay
            sx={{ width: '100%', maxHeight: '80vh', borderRadius: 3, display: 'block', bgcolor: '#000' }}
          />
        ) : (
          <Box sx={{ position: 'relative', aspectRatio: '16/9', borderRadius: 3, bgcolor: video?.color, overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.35)' }}>
              <Typography fontSize={14} sx={{ color: 'rgba(255,255,255,0.7)' }}>No preview available</Typography>
            </Box>
          </Box>
        )}
        {video && (
          <Typography fontSize={13} fontWeight={600} sx={{ mt: 1.5, color: '#fff', textAlign: 'center' }}>
            {video.name}
          </Typography>
        )}
      </Box>
    </Modal>
  );
}

// ── Tab content ───────────────────────────────────────────────────────────────
const EMPTY_STATE_CONFIG = {
  images: { icon: 'solar:gallery-bold', label: 'No images yet' },
  videos: { icon: 'solar:videocamera-bold', label: 'No videos yet' },
  audio: { icon: 'solar:music-note-bold', label: 'No audio yet' },
  files: { icon: 'solar:folder-bold', label: 'No files yet' },
};

function EmptyState({ label }) {
  const config = EMPTY_STATE_CONFIG[label] ?? { icon: 'solar:inbox-bold', label: `No ${label} yet` };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: 'rgba(76,78,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={config.icon} width={36} sx={{ color: '#4C4EFF', opacity: 0.5 }} />
      </Box>
      <Typography fontSize={14} fontWeight={600} color="text.secondary">
        {config.label}
      </Typography>
      <Typography fontSize={12} color="text.disabled">
        Media shared in this room will appear here
      </Typography>
    </Box>
  );
}

function ImagesGrid({ items }) {
  const [selected, setSelected] = useState(null);
  if (!items.length) return <EmptyState label="images" />;
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, p: 2 }}>
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => setSelected(item)}
            sx={{
              aspectRatio: '1',
              borderRadius: 2,
              bgcolor: item.color,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              overflow: 'hidden',
              '&:hover': { opacity: 0.82 },
            }}
          >
            {item.url && (
              <Box component="img" src={item.url} alt={item.name || 'Image'} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </Box>
        ))}
      </Box>
      <ImageLightbox image={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function VideosGrid({ items }) {
  const [selected, setSelected] = useState(null);
  if (!items.length) return <EmptyState label="videos" />;
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, p: 2 }}>
        {items.map((item) => (
          <Box key={item.id}>
            <Box
              onClick={() => setSelected(item)}
              sx={{
                position: 'relative',
                aspectRatio: '16/9',
                borderRadius: 2,
                bgcolor: '#111',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover .play-circle': { transform: 'scale(1.12)' },
              }}
            >
              {item.url && (
                <Box
                  component="video"
                  src={item.url}
                  muted
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={(e) => { e.target.currentTime = 0.5; }}
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  className="play-circle"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s',
                  }}
                >
                  <Iconify icon="solar:play-bold" width={16} sx={{ color: '#4C4EFF', ml: '2px' }} />
                </Box>
              </Box>
            </Box>

            <Typography fontSize={12} fontWeight={600} noWrap sx={{ mt: 0.5, px: 0.5, color: 'text.secondary' }}>
              {item.name}
            </Typography>
            <Typography fontSize={10} color="text.disabled" noWrap sx={{ px: 0.5 }}>
              {[formatBytes(item.size), fDate(item.downloadedAt)].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        ))}
      </Box>
      <VideoModal video={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function AudioList({ items }) {
  if (!items.length) return <EmptyState label="audio" />;
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{ bgcolor: '#f5f6ff', borderRadius: 2, border: '1px solid #e0e0ff', overflow: 'hidden' }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, pt: 1.5, pb: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#4C4EFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:soundwave-bold" width={16} style={{ color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontSize={13} fontWeight={600} noWrap>{item.name}</Typography>
              <Typography fontSize={11} color="text.secondary">
                {[item.duration, formatBytes(item.size), fDate(item.downloadedAt)].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <AudioPlayer url={item.url} sx={{ bgcolor: 'transparent', border: 'none', px: 0, py: 0 }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function FilesList({ items }) {
  if (!items.length) return <EmptyState label="files" />;
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {items.map((item) => (
        <Stack
          key={item.id}
          direction="row"
          alignItems="center"
          spacing={1.5}
          onClick={() => item.url && window.open(item.url, '_blank')}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: item.url ? 'pointer' : 'default',
            '&:hover': { bgcolor: '#f5f6ff' },
          }}
        >
          {(() => {
            const { icon, color } = getFileStyle(item.name, item.type);
            return (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={icon} width={22} style={{ color: '#fff' }} />
              </Box>
            );
          })()}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={600} noWrap>{item.name}</Typography>
            <Typography fontSize={11} color="text.secondary">
              {[getFileTypeLabel(item.name, item.type), formatBytes(item.size), fDate(item.downloadedAt)].filter(Boolean).join(' · ')}
            </Typography>
          </Box>

          <IconButton size="small" sx={{ color: '#4C4EFF', flexShrink: 0 }}>
            <Iconify icon="solar:download-minimalistic-bold" width={18} />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function RoomMediaPanel({ open, onBack, roomId }) {
  const [activeTab, setActiveTab] = useState(0);

  const activeType = TABS[activeTab].type;

  const { data, isFetching } = useGetRoomDownloadedMediaQuery(
    { roomId, type: activeType, page: 1, limit: 30 },
    { skip: !roomId || !open, refetchOnMountOrArgChange: true }
  );

  const items = data?.items ?? [];

  return (
    <ProfilePageShell open={open} onClose={onBack}>
      <DrawerHeader
        title="Downloaded Media"
        onBack={onBack}
        showEdit={false}
        showShare={false}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 12,
            minHeight: 46,
            color: 'text.secondary',
            gap: 0.5,
          },
          '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 3, borderRadius: 2 },
          '& .Mui-selected': { color: '#4C4EFF !important' },
        }}
      >
        {TABS.map((tab, i) => (
          <Tab
            key={tab.label}
            value={i}
            label={tab.label}
            icon={<Iconify icon={tab.icon} width={15} />}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} sx={{ color: '#4C4EFF' }} />
          </Box>
        ) : (
          <Scrollbar sx={{ height: '100%' }}>
            {activeTab === 0 && <ImagesGrid items={items} />}
            {activeTab === 1 && <VideosGrid items={items} />}
            {activeTab === 2 && <AudioList items={items} />}
            {activeTab === 3 && <FilesList items={items} />}
          </Scrollbar>
        )}
      </Box>
    </ProfilePageShell>
  );
}
