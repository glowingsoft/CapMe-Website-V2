import { useState, useRef, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';

const MOCK_GARAGE_MESSAGES = [
  {
    id: 1,
    content: 'Remember to check the weekend plans',
    time: '2:30 PM',
  },
  {
    id: 2,
    content: 'Buy groceries: milk, eggs, bread',
    time: '1:15 PM',
  },
  {
    id: 3,
    content: 'Project deadline is next Friday — need to finalize the UI screens.',
    time: 'Yesterday',
  },
  {
    id: 4,
    content: 'Idea: add dark mode toggle to the settings page',
    time: 'Mon',
  },
];

export default function GarageRoomDrawer({ open, onClose }) {
  const [messages, setMessages] = useState(MOCK_GARAGE_MESSAGES);
  const [message, setMessage] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const filtered = searchValue.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchValue.toLowerCase())
      )
    : messages;

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open, messages]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 380 },
          bgcolor: '#141414',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      BackdropProps={{
        sx: { bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(76,78,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon="solar:garage-bold" width={20} color="#4C4EFF" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              My Garage
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>Personal · Only you</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setShowSearch((p) => !p)}
            sx={{ color: showSearch ? '#4C4EFF' : '#6B7280', '&:hover': { color: '#fff' } }}
          >
            <Icon icon="eva:search-fill" width={19} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#6B7280', '&:hover': { color: '#fff' } }}
          >
            <Icon icon="mdi:close" width={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Search bar */}
      {showSearch && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#232323',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
            }}
          >
            <Icon icon="eva:search-fill" width={16} color="#6B7280" />
            <InputBase
              autoFocus
              placeholder="Search messages..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: 13,
                color: '#fff',
                '& input::placeholder': { color: '#6B7280' },
              }}
            />
            {searchValue && (
              <IconButton size="small" onClick={() => setSearchValue('')} sx={{ p: 0.25 }}>
                <Icon icon="mdi:close" width={14} color="#6B7280" />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {/* Messages list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
          },
        }}
      >
        {filtered.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
              {searchValue ? 'No messages match your search.' : 'Your garage is empty.\nSend your first note!'}
            </Typography>
          </Box>
        ) : (
          filtered.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: '#4C4EFF',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                M
              </Avatar>
              <Box
                sx={{
                  bgcolor: '#232323',
                  borderRadius: '4px 12px 12px 12px',
                  px: 1.5,
                  py: 1,
                  flex: 1,
                }}
              >
                <Typography sx={{ fontSize: 13.5, color: '#E5E7EB', lineHeight: 1.55 }}>
                  {msg.content}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.5 }}>
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Message input */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#232323',
            borderRadius: 3,
            px: 1.5,
            py: 0.75,
          }}
        >
          <InputBase
            inputRef={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a note..."
            fullWidth
            multiline
            maxRows={4}
            sx={{
              flex: 1,
              fontSize: 14,
              color: '#fff',
              '& textarea': { p: 0 },
              '& textarea::placeholder': { color: '#6B7280' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!message.trim()}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: '#4C4EFF',
              color: '#fff',
              width: 34,
              height: 34,
              borderRadius: '50%',
              '&:hover': { bgcolor: '#3739CC' },
              '&.Mui-disabled': { bgcolor: 'rgba(76,78,255,0.3)', color: 'rgba(255,255,255,0.4)' },
            }}
          >
            <Icon icon="mingcute:send-line" width={18} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
