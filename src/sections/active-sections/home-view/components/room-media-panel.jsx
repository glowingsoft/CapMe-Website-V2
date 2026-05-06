import { useState } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import DrawerHeader from './drawer-header';
import { AudioPlayer } from './file-message';
import { MOCK_ROOM_MEDIA } from '../mock';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FILE_COLOR = {
  'application/pdf': '#FF5252',
  'application/docx': '#2196F3',
  'application/xlsx': '#4CAF50',
  'application/pptx': '#FF9800',
};

const TABS = [
  { label: 'Images', icon: 'solar:gallery-bold' },
  { label: 'Videos', icon: 'solar:videocamera-bold' },
  { label: 'Audio', icon: 'solar:music-note-bold' },
  { label: 'Files', icon: 'solar:folder-bold' },
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
  return (
    <Modal open={!!image} onClose={onClose} sx={BACKDROP_SX}>
      <Box sx={{ position: 'relative', outline: 'none', maxWidth: 520, width: '100%' }}>
        <CloseBtn onClick={onClose} />
        {image?.url ? (
          <Box
            component="img"
            src={image.url}
            alt=""
            sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 3, display: 'block' }}
          />
        ) : (
          <Box sx={{ width: '100%', aspectRatio: '1', borderRadius: 3, bgcolor: image?.color }} />
        )}
      </Box>
    </Modal>
  );
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
function EmptyState({ label }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
      <Iconify icon="solar:inbox-bold" width={48} sx={{ mb: 1.5, color: 'text.disabled' }} />
      <Typography fontSize={14} color="text.secondary">No {label} yet</Typography>
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
              '&:hover': { opacity: 0.72 },
            }}
          />
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
                bgcolor: item.color,
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover .play-circle': { transform: 'scale(1.12)' },
              }}
            >
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

              <Typography
                fontSize={10}
                fontWeight={700}
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  right: 7,
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.55)',
                  px: 0.7,
                  borderRadius: 1,
                  lineHeight: 1.7,
                }}
              >
                {item.duration}
              </Typography>
            </Box>

            <Typography fontSize={12} fontWeight={600} noWrap sx={{ mt: 0.5, px: 0.5, color: 'text.secondary' }}>
              {item.name}
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
              <Typography fontSize={11} color="text.secondary">{item.duration} · {formatBytes(item.size)}</Typography>
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
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: FILE_COLOR[item.type] || '#4C4EFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:file-bold" width={22} style={{ color: '#fff' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={600} noWrap>{item.name}</Typography>
            <Typography fontSize={11} color="text.secondary">{formatBytes(item.size)}</Typography>
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
export default function RoomMediaPanel({ open, onBack, media = MOCK_ROOM_MEDIA }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [media.images, media.videos, media.audio, media.files].map((t) => t || []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onBack}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      disableScrollLock
      ModalProps={{ sx: { pointerEvents: 'none' } }}
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: '100%',
          borderTopLeftRadius: 20,
          overflow: 'hidden',
          bgcolor: '#fff',
          mt: '105px',
          height: 'calc(100vh - 105px)',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
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
        <Scrollbar sx={{ height: '100%' }}>
          {activeTab === 0 && <ImagesGrid items={tabItems[0]} />}
          {activeTab === 1 && <VideosGrid items={tabItems[1]} />}
          {activeTab === 2 && <AudioList items={tabItems[2]} />}
          {activeTab === 3 && <FilesList items={tabItems[3]} />}
        </Scrollbar>
      </Box>
    </Drawer>
  );
}
