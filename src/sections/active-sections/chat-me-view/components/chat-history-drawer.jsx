import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import {
  CHAT_HISTORY,
  CHAT_HISTORY_GROUP_ORDER,
  CHAT_HISTORY_GROUP_LABELS,
} from '../mock';

export default function ChatHistoryDrawer({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState(CHAT_HISTORY);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => item.text.toLowerCase().includes(q));
  }, [history, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of filtered) {
      if (!map[item.group]) map[item.group] = [];
      map[item.group].push(item);
    }
    return map;
  }, [filtered]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      disableScrollLock
      ModalProps={{ sx: { pointerEvents: 'none' } }}
      PaperProps={{
        sx: {
          width: 420,
          borderTopLeftRadius: 20,
          mt: '105px',
          height: 'calc(100vh - 105px)',
          bgcolor: '#fff',
          p: 0,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ── */}
      <DrawerHeader title="Chat History" onBack={onClose} showEdit={false} showShare={false} />

      {/* ── Logo ── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, pb: 1.5, flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo/logo-single.svg"
          alt="Capme"
          sx={{ width: 56, height: 56, objectFit: 'contain' }}
        />
      </Box>

      {/* ── Search + New chat ── */}
      <Box sx={{ px: 2.5, pb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.9,
              bgcolor: '#f5f5f5',
              borderRadius: 10,
              border: '1px solid #ebebeb',
            }}
          >
            <Iconify icon="mingcute:search-line" width={18} style={{ color: '#9e9e9e', flexShrink: 0 }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              sx={{ flex: 1, fontSize: 14, '& input': { p: 0 } }}
            />
            {search && (
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.2 }}>
                <Iconify icon="mingcute:close-line" width={14} style={{ color: '#9e9e9e' }} />
              </IconButton>
            )}
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: '#111',
              color: '#fff',
              flexShrink: 0,
              '&:hover': { bgcolor: '#333' },
            }}
          >
            <Iconify icon="mingcute:add-line" width={22} />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* ── History list ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.1) transparent',
          '&::-webkit-scrollbar': { width: '3px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
        }}
      >
        {history.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 1 }}>
            <Iconify icon="solar:history-bold" width={40} style={{ color: '#e0e0e0' }} />
            <Typography fontSize={14} color="text.disabled">
              No chat history yet
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 1 }}>
            <Iconify icon="mingcute:search-line" width={36} style={{ color: '#e0e0e0' }} />
            <Typography fontSize={14} color="text.disabled">
              No results for &ldquo;{search}&rdquo;
            </Typography>
          </Box>
        ) : (
          CHAT_HISTORY_GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
            <Box key={group}>
              <Typography
                sx={{ px: 2.5, pt: 2, pb: 0.5, fontSize: 13, fontWeight: 800, color: '#111', letterSpacing: 0.2 }}
              >
                {CHAT_HISTORY_GROUP_LABELS[group]}
              </Typography>

              {grouped[group].map((item) => (
                <Box key={item.id}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.2,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      '&:hover': { bgcolor: '#f7f7f7' },
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 400, color: 'text.secondary' }}
                      noWrap
                    >
                      {item.text}
                    </Typography>
                  </Box>
                  <Divider sx={{ mx: 2.5 }} />
                </Box>
              ))}
            </Box>
          ))
        )}
      </Box>

      {/* ── Clear History ── */}
      <Box sx={{ p: 2.5, flexShrink: 0 }}>
        <Button
          fullWidth
          onClick={() => setHistory([])}
          sx={{
            bgcolor: '#111',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2.5,
            py: 1.4,
            textTransform: 'none',
            '&:hover': { bgcolor: '#333' },
          }}
        >
          Clear History
        </Button>
      </Box>
    </Drawer>
  );
}
