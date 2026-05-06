import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useLocation } from 'react-router-dom';
import CommentDrawer from './components/comment-drawer';
import CreateRoomModal from './components/create-room-modal';
import LeftDrawer from './components/left-drawer';
import PostCard from './components/post-card';
import RoomChannelHeader from './components/room-channel-header';
import SuggestedRooms from './components/suggested-rooms';
import NoDataIllustration from '../../../assets/illustrations/no-data-illustration';
import { commentsData, posts, suggestedRooms } from './mock';
import { roomsData } from './data';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import SelectFile from './components/select-file';
import FileUploadProgress from './components/file-upload-progress';
import AudioRecorder from './components/audio-recorder';
import HashtagSuggestions from 'src/components/hashtags/hashtag-suggestions';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';
import { HASHTAGS } from './hashtags-mock';

// Must match LeftDrawer's drawerWidth when open
const DRAWER_WIDTH = 420;
export default function HomeView() {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(true);
  const [activeRoom, setActiveRoom] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const inputRef = React.useRef(null);
  const [fileMenuAnchor, setFileMenuAnchor] = React.useState(null);
  const [upload, setUpload] = React.useState({ file: null, progress: 0 });
  const [attachedFile, setAttachedFile] = React.useState(null); // ready to send
  const [audioRecorderOpen, setAudioRecorderOpen] = React.useState(false);
  const uploadTimerRef = React.useRef(null);

  const handleFileSelected = (file) => {
    const url = URL.createObjectURL(file);
    const LARGE = 300 * 1024; // 300 KB threshold — show progress above this

    if (file.size < LARGE) {
      setAttachedFile({ url, type: file.type, name: file.name, size: file.size });
      return;
    }

    setUpload({ file, progress: 0 });
    let progress = 0;
    uploadTimerRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        clearInterval(uploadTimerRef.current);
        setUpload((prev) => ({ ...prev, progress: 100 }));
        setTimeout(() => {
          setUpload({ file: null, progress: 0 });
          setAttachedFile({ url, type: file.type, name: file.name, size: file.size });
        }, 500);
      } else {
        setUpload((prev) => ({ ...prev, progress }));
      }
    }, 250);
  };

  const cancelUpload = () => {
    clearInterval(uploadTimerRef.current);
    setUpload({ file: null, progress: 0 });
  };
  const [roomInfoOpen, setRoomInfoOpen] = React.useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setDrawerOpen(false); setRoomInfoOpen(false); setProfileDrawerOpen(false); };
    const onOpenRoom = (e) => handleRoomSelect(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    const onCloseComment = () => {
      setDrawerOpen(false);
      setSelectedPost(null);
    };

    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('accountDrawerOpened', onAccountOpened);
    window.addEventListener('openRoom', onOpenRoom);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('notificationsDrawerChange', onNotificationsChange);
    window.addEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('accountDrawerOpened', onAccountOpened);
      window.removeEventListener('openRoom', onOpenRoom);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
      window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
    };
  }, []);

  const anyRightDrawerOpen = drawerOpen || roomInfoOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
  const [localPosts, setLocalPosts] = React.useState(posts);
  const location = useLocation();

  // Sentinel ref — always sits below the last post
  const postsEndRef = React.useRef(null);
  // Track previous room to distinguish room-switch (instant) vs new message (smooth)
  const prevRoomRef = React.useRef(null);

  const showLeftDrawer = /^\/(home|dashboard)(\/|$)/.test(location.pathname);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setLocalPosts(posts);
  };

  // Open a room passed via navigation state (e.g. from activity feed)
  React.useEffect(() => {
    if (location.state?.pendingRoom) {
      handleRoomSelect(location.state.pendingRoom);
      window.history.replaceState({}, '');
    }
  }, []);

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setRoomInfoOpen(false);
    setDrawerOpen(true);
    closeOverlayDrawers({ includeRoomInfo: true });
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
    if (!text && !attachedFile) return;
    setLocalPosts((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'message',
        user: { name: 'You', username: '@you', avatar: '' },
        content: text,
        hashtags: '',
        stats: { likes: 0, comments: 0, shares: 0 },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: attachedFile || undefined,
      },
    ]);
    setMessage('');
    setAttachedFile(null);
  };

  const handlePickHashtag = (tag) => {
    const value = message || '';
    const next = value.replace(/(?:^|\s)#([\p{L}\p{N}_]{0,32})$/u, (m, q) => m.replace(`#${q}`, `#${tag}`)) + ' ';
    setMessage(next);
    setTimeout(() => inputRef.current?.focus(), 0);
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
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden' }}>

      {showLeftDrawer && (
        <LeftDrawer
          open={leftDrawerOpen}
          onToggle={handleToggleLeftDrawer}
          roomsData={roomsData}
          activeRoomId={activeRoom?.id}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={() => setCreateRoomOpen(true)}
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
                  messages={localPosts}
                  onRoomInfoOpenChange={(val) => {
                    setRoomInfoOpen(val);
                    if (val) {
                      setDrawerOpen(false);
                      setProfileDrawerOpen(false);
                      closeOverlayDrawers();
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
                      <OldMessagesLabel key={`date-${index}`} label={item.label} />
                    ) : (
                      <PostCard key={`post-${item.id}`} post={item} onCommentClick={handleOpenComments} />
                    )
                  )}
                  {/* Sentinel — scrollIntoView targets this to reach the bottom */}
                  <div ref={postsEndRef} />
                </Box>

                {/* Message input — pinned at bottom, never scrolls */}
                <Box sx={{ flexShrink: 0, mt: 1.5 }}>
                  {/* Upload progress */}
                  {upload.file && (
                    <FileUploadProgress
                      file={upload.file}
                      progress={upload.progress}
                      onCancel={cancelUpload}
                    />
                  )}

                  {/* Attached file chip — shows after upload is done, before send */}
                  {attachedFile && !upload.file && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.8,
                        mb: 0.5,
                        bgcolor: '#f0f1ff',
                        border: '1px solid #d0d2ff',
                        borderRadius: 2,
                      }}
                    >
                      <Iconify icon="solar:paperclip-bold" width={16} style={{ color: '#4C4EFF', flexShrink: 0 }} />
                      <Typography fontSize={13} fontWeight={500} color="#4C4EFF" noWrap sx={{ flex: 1 }}>
                        {attachedFile.name}
                      </Typography>
                      <IconButton size="small" onClick={() => setAttachedFile(null)} sx={{ p: 0.2, color: '#9e9e9e' }}>
                        <Iconify icon="mingcute:close-line" width={14} />
                      </IconButton>
                    </Box>
                  )}

                  {audioRecorderOpen ? (
                    <AudioRecorder
                      onDone={(file) => { setAudioRecorderOpen(false); handleFileSelected(file); }}
                      onCancel={() => setAudioRecorderOpen(false)}
                    />
                  ) : (
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
                        position: 'relative',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => setFileMenuAnchor(e.currentTarget)}
                        sx={{ color: '#9e9e9e', flexShrink: 0 }}
                      >
                        <Iconify icon="mingcute:add-line" width={22} />
                      </IconButton>

                      <SelectFile
                        anchorEl={fileMenuAnchor}
                        onClose={() => setFileMenuAnchor(null)}
                        onFileSelected={handleFileSelected}
                        onAudioRecord={() => setAudioRecorderOpen(true)}
                      />

                      <InputBase
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !upload.file) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type a message..."
                        inputRef={inputRef}
                        fullWidth
                        multiline
                        maxRows={4}
                        sx={{
                          flex: 1,
                          fontSize: 14,
                          color: 'text.primary',
                          '& textarea': { p: 0 },
                        }}
                      />

                      <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 52 }}>
                        <HashtagSuggestions value={message} hashtags={HASHTAGS} onPick={handlePickHashtag} />
                      </Box>

                      <IconButton
                        onClick={handleSend}
                        disabled={!!upload.file || (!message.trim() && !attachedFile)}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          bgcolor: '#4C4EFF',
                          color: '#fff',
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          '&:hover': { bgcolor: '#3739b7' },
                          '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
                        }}
                      >
                        <Iconify icon="mingcute:send-line" width={18} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <NoDataIllustration sx={{ mb: 3 }} />
                <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, mb: 1 }}>
                  <Box component="span" sx={{ color: '#4C4EFF' }}>Select</Box>
                  {' a Room'}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2.5 }}>
                  Pick a room from the left to view its content.
                </Typography>
                <Box
                  onClick={() => setCreateRoomOpen(true)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    border: '1.5px dashed rgba(76,78,255,0.35)',
                    color: '#4C4EFF',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'rgba(76,78,255,0.06)', borderColor: '#4C4EFF' },
                  }}
                >
                  <Iconify icon="mingcute:add-line" width={18} />
                  Create a Room
                </Box>
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

        <CreateRoomModal
          open={createRoomOpen}
          onClose={() => setCreateRoomOpen(false)}
          onCreate={(room) => console.log('Room created:', room)}
        />
      </Box>

    </Box>
  );
}
