import React from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { useLocation } from 'react-router-dom';
import CommentDrawer from './components/comment-drawer';
import LeftDrawer from './components/left-drawer';
import PostCard from './components/post-card';
import RoomChannelHeader from './components/room-channel-header';
import SuggestedRooms from './components/suggested-rooms';
import NoDataIllustration from '../../../assets/illustrations/no-data-illustration';
import { commentsData, posts, suggestedRooms } from './mock';
import { roomsData } from './data';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';

// Must match LeftDrawer's drawerWidth when open
const DRAWER_WIDTH = 420;

export default function HomeView() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(true);
  const [activeRoom, setActiveRoom] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [roomInfoOpen, setRoomInfoOpen] = React.useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setDrawerOpen(false); setRoomInfoOpen(false); };
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('accountDrawerOpened', onAccountOpened);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('accountDrawerOpened', onAccountOpened);
    };
  }, []);

  const anyRightDrawerOpen = drawerOpen || roomInfoOpen || accountDrawerOpen;
  const [localPosts, setLocalPosts] = React.useState(posts);
  const location = useLocation();

  // Sentinel ref — always sits below the last post
  const postsEndRef = React.useRef(null);
  // Track previous room to distinguish room-switch (instant) vs new message (smooth)
  const prevRoomRef = React.useRef(null);

  const showLeftDrawer = /^\/dashboard(\/|$)/.test(location.pathname);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setLocalPosts(posts); // reset to room posts (swap for real fetch later)
  };

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setRoomInfoOpen(false);
    setDrawerOpen(true);
    window.dispatchEvent(new Event('closeAccountDrawer'));
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPost(null);
  };

  const handleToggleLeftDrawer = () => {
    setLeftDrawerOpen((prev) => !prev);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    setLocalPosts((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'message',
        user: { name: 'You', username: '@you', avatar: '' },
        image: '',
        content: text,
        hashtags: '',
        stats: { likes: 0, comments: 0, shares: 0 },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  // Scroll to bottom: instant on room switch, smooth on new message
  React.useEffect(() => {
    if (!activeRoom || !postsEndRef.current) return;
    const roomChanged = activeRoom !== prevRoomRef.current;
    prevRoomRef.current = activeRoom;
    postsEndRef.current.scrollIntoView({ behavior: roomChanged ? 'instant' : 'smooth' });
  }, [activeRoom, localPosts]);

  const leftDrawerWidth = showLeftDrawer && leftDrawerOpen ? DRAWER_WIDTH : 0;

  return (
    // height: 105px is the dashboard header height (AppBar + offset)
    <Box sx={{ flexGrow: 1, bgcolor: '#fafbfc', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden' }}>

      {showLeftDrawer && (
        <LeftDrawer
          open={leftDrawerOpen}
          onToggle={handleToggleLeftDrawer}
          roomsData={roomsData}
          activeRoomId={activeRoom?.id}
          onRoomSelect={handleRoomSelect}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pl: { xs: 2, md: 4 },
          pb: { xs: 2, md: 4 },
          pt: { xs: 2, md: '17px' },
          pr: { xs: 2, md: 4 },
          boxSizing: 'border-box',
          transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
          marginLeft: { md: `${leftDrawerWidth}px`, xs: 0 },
        }}
      >
        {/* Two-column row always rendered — sidebar stays at the same position in both states */}
        <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden', minHeight: 0 }}>

          {/* Left column — room content or empty state */}
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              mr: anyRightDrawerOpen ? { md: '90px' } : 0,
              transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          >
            {activeRoom ? (
              <>
                {/* Room channel header bar */}
                <RoomChannelHeader
                  room={activeRoom}
                  onRoomInfoOpenChange={(val) => {
                    setRoomInfoOpen(val);
                    if (val) {
                      setDrawerOpen(false);
                      window.dispatchEvent(new Event('closeAccountDrawer'));
                    }
                  }}
                />

                {/* Scrollable posts — only this scrolls */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    pr: 0.5,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0,0,0,0.15) transparent',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
                  }}
                >
                  {localPosts.map((item, index) =>
                    item.type === 'date' ? (
                      <OldMessagesLabel key={index} label={item.label} />
                    ) : (
                      <PostCard key={item.id} post={item} onCommentClick={() => handleOpenComments(item)} />
                    )
                  )}
                  {/* Sentinel — scrollIntoView targets this to reach the bottom */}
                  <div ref={postsEndRef} />
                </Box>

                {/* Message input — pinned at bottom, never scrolls */}
                <Box
                  sx={{
                    flexShrink: 0,
                    mt: 1.5,
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
                  <IconButton size="small" sx={{ color: '#9e9e9e', flexShrink: 0 }}>
                    <Iconify icon="mingcute:add-line" width={22} />
                  </IconButton>

                  <InputBase
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
                    placeholder="Type a message..."
                    fullWidth
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      color: 'text.primary',
                      '& input': { p: 0 },
                    }}
                  />

                  <IconButton
                    onClick={handleSend}
                    size="small"
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
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <NoDataIllustration sx={{ mb: 3 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  No room selected
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Please select a room from the left to view its content.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Sidebar — drawer overlaps this freely; center column above adjusts via mr */}
          <Box sx={{ flex: '0 0 300px', display: { xs: 'none', lg: 'block' } }}>
            <SuggestedRooms rooms={suggestedRooms} />
          </Box>

        </Box>

        <CommentDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          selectedPost={selectedPost}
          commentsData={commentsData}
        />
      </Box>
    </Box>
  );
}
