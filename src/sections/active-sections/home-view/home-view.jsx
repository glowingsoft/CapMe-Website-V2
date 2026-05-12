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
import { commentsData, suggestedRooms } from './mock';
import SelectFile from './components/select-file';
import FileUploadProgress from './components/file-upload-progress';
import AudioRecorder from './components/audio-recorder';
import AttachedFileChip from './components/attached-file-chip';
import HashtagSuggestions from 'src/components/hashtags/hashtag-suggestions';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';
import { HASHTAGS } from './hashtags-mock';
import PinnedMessagesDisplay from './components/pinned-messages-display';
import CircularProgress from '@mui/material/CircularProgress';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import { useGetRoomMessagesQuery, useGetRoomPinnedMessagesQuery, useGetRoomTagsQuery, usePinMessageMutation } from 'src/store/Reducer/rooms-api';

const DRAWER_WIDTH = 420;
const MESSAGES_LIMIT = 10;

function formatDateLabel(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
}

function withDateSeparators(messages) {
  const result = [];
  let lastDateStr = null;
  messages.forEach((msg) => {
    if (!msg.createdAt) { result.push(msg); return; }
    const dateStr = new Date(msg.createdAt).toDateString();
    if (dateStr !== lastDateStr) {
      lastDateStr = dateStr;
      result.push({ type: 'date', id: `date-${dateStr}`, label: formatDateLabel(msg.createdAt) });
    }
    result.push(msg);
  });
  return result;
}
export default function HomeView() {
  const location = useLocation();
  const showLeftDrawer = /^\/(home|dashboard)(\/|$)/.test(location.pathname);

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
  const [pinnedMessages, setPinnedMessages] = React.useState([]);
  const [pinMessageApi] = usePinMessageMutation();

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
  const [targetMessageId, setTargetMessageId] = React.useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = React.useState(null);
  const postsContainerRef = React.useRef(null);
  const highlightTimerRef = React.useRef(null);
  const [localPosts, setLocalPosts] = React.useState([]);
  const [messagesPage, setMessagesPage] = React.useState(1);
  const [hasMoreMessages, setHasMoreMessages] = React.useState(false);
  // Refs for scroll management (stable across renders)
  const prevScrollHeightRef = React.useRef(0);   // saved before prepend
  const isPrependingRef = React.useRef(false);    // skip scroll-to-bottom during prepend
  const scrollGuardRef = React.useRef(false);     // prevents duplicate page increments
  const isInitialLoadRef = React.useRef(false);   // marks first page load for a room → instant scroll to bottom
  const suppressScrollToBottomRef = React.useRef(false); // skip one scroll-to-bottom after targeted scroll

  const normalizeMessage = React.useCallback((msg) => ({
    id: msg._id,
    type: 'message',
    user: {
      name: msg.sendername ?? msg.sender?.name ?? 'Unknown',
      username: `@${msg.sender?.email?.split('@')[0] ?? msg.sendername?.split(' ')[0]?.toLowerCase() ?? 'user'}`,
      avatar: msg.senderImage ?? msg.sender?.image ?? '',
    },
    content: msg.content ?? '',
    hashtags: '',
    likes: msg.likes ?? [],
    stats: {
      likes: msg.likeCount ?? 0,
      comments: msg.commentCount ?? 0,
      shares: msg.shareCount ?? 0,
    },
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    createdAt: msg.createdAt ?? null,
    image: msg.meta?.image ?? '',
    isPinned: !!msg.is_pin,
  }), []);

  const messagesQuery = useGetRoomMessagesQuery(
    { roomId: activeRoom?.id, page: messagesPage, limit: MESSAGES_LIMIT },
    { skip: !activeRoom?.id, refetchOnMountOrArgChange: true }
  );

  const tagsQuery = useGetRoomTagsQuery(
    { roomId: activeRoom?.id, page: 1, limit: 10 },
    { skip: !activeRoom?.id }
  );

  const pinnedQuery = useGetRoomPinnedMessagesQuery(
    { roomId: activeRoom?.id },
    { skip: !activeRoom?.id, refetchOnMountOrArgChange: true }
  );

  // Populate pinned messages from dedicated API
  React.useEffect(() => {
    if (!pinnedQuery.isSuccess || pinnedQuery.isFetching) return;
    setPinnedMessages(pinnedQuery.data ?? []);
  }, [pinnedQuery.data, pinnedQuery.isSuccess, pinnedQuery.isFetching]);

  // Populate / accumulate messages when API responds
  React.useEffect(() => {
    if (!messagesQuery.isSuccess || messagesQuery.isFetching) return;
    const raw = messagesQuery.data?.body?.messages ?? [];
    // API returns newest-first — reverse to show oldest at top
    const normalized = [...raw].reverse().map(normalizeMessage);
    setHasMoreMessages(raw.length >= MESSAGES_LIMIT);
    if (messagesPage === 1) {
      isPrependingRef.current = false;
      isInitialLoadRef.current = true; // first batch → scroll instantly to bottom
      setLocalPosts(normalized);
    } else {
      isPrependingRef.current = true;
      setLocalPosts((prev) => [...normalized, ...prev]);
    }
    scrollGuardRef.current = false;
  }, [messagesQuery.data, messagesQuery.isSuccess, messagesQuery.isFetching, messagesPage, normalizeMessage]);

  // Restore scroll position after prepending older messages (runs synchronously before paint)
  React.useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0 && postsContainerRef.current) {
      const el = postsContainerRef.current;
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
    // NOTE: do NOT reset isPrependingRef here — useLayoutEffect fires before useEffect,
    // so the scroll-to-bottom effect would always see false. It resets there instead.
  }, [localPosts]);

  const onPinMessage = React.useCallback((e) => {
    const { messageId, isPinned, message: detailMessage } = e.detail;
    const message = detailMessage || localPosts.find((p) => String(p.id) === String(messageId));

    if (!message) return;

    setLocalPosts((prev) =>
      prev.map((post) =>
        String(post.id) === String(messageId)
          ? { ...post, isPinned }
          : post
      )
    );

    if (isPinned) {
      setPinnedMessages((prev) => {
        const exists = prev.some((m) => String(m.id) === String(messageId));
        if (exists) {
          return prev.map((m) => (String(m.id) === String(messageId) ? { ...m, ...message, isPinned: true } : m));
        }
        return [...prev, { ...message, isPinned: true }];
      });
    } else {
      setPinnedMessages((prev) => prev.filter((m) => String(m.id) !== String(messageId)));
    }
  }, [localPosts]);

  const onDeleteMessage = React.useCallback((e) => {
    const { messageId } = e.detail;
    setLocalPosts((prev) => prev.filter((m) => m.id !== messageId));
    setPinnedMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const onEditMessage = React.useCallback((e) => {
    const { messageId, content } = e.detail;
    setLocalPosts((prev) => prev.map((post) => (post.id === messageId ? { ...post, content } : post)));
    setPinnedMessages((prev) => prev.map((post) => (post.id === messageId ? { ...post, content } : post)));
  }, []);

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
    const onLikeMessage = (e) => {
      const { messageId, likeCount, liked } = e.detail || {};
      if (!messageId) return;
      setLocalPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) !== String(messageId)) return p;
          return {
            ...p,
            stats: { ...p.stats, likes: likeCount ?? p.stats.likes },
            // keep existing likes array if present; optionally adjust isLiked if consumed elsewhere
          };
        })
      );
      setPinnedMessages((prev) =>
        prev.map((p) => {
          if (String(p.id) !== String(messageId)) return p;
          return { ...p, stats: { ...p.stats, likes: likeCount ?? p.stats.likes } };
        })
      );
    };

    window.addEventListener('pinMessage', onPinMessage);
    window.addEventListener('deleteMessage', onDeleteMessage);
    window.addEventListener('editMessage', onEditMessage);
    window.addEventListener('likeMessage', onLikeMessage);

    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('accountDrawerOpened', onAccountOpened);
      window.removeEventListener('openRoom', onOpenRoom);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
      window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
      window.removeEventListener('pinMessage', onPinMessage);
      window.removeEventListener('deleteMessage', onDeleteMessage);
      window.removeEventListener('editMessage', onEditMessage);
      window.removeEventListener('likeMessage', onLikeMessage);
    };
  }, [onDeleteMessage, onEditMessage, onPinMessage]);

  const anyRightDrawerOpen = drawerOpen || roomInfoOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;

  // Sentinel ref — always sits below the last post
  const postsEndRef = React.useRef(null);
  // Track previous room to distinguish room-switch (instant) vs new message (smooth)
  const prevRoomRef = React.useRef(null);

  const handleUnpinMessage = React.useCallback(async (messageId) => {
    try {
      await pinMessageApi({ messageId, is_pin: false }).unwrap();
    } catch {
      // API call failed, but still update local state
    }
    window.dispatchEvent(
      new CustomEvent('pinMessage', {
        detail: { messageId, isPinned: false },
      })
    );
  }, [pinMessageApi]);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setLocalPosts([]);
    setPinnedMessages([]);
    setMessagesPage(1);
    setHasMoreMessages(false);
    prevScrollHeightRef.current = 0;
    scrollGuardRef.current = false;
    isPrependingRef.current = false;
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

  const handleMessageSelect = React.useCallback((selectedMessage) => {
    if (!selectedMessage?.id) return;
    const id = String(selectedMessage.id);

    // If message isn't loaded yet, inject it into the feed so the DOM element exists
    setLocalPosts((prev) => {
      const exists = prev.some((p) => String(p.id) === id);
      if (exists) return prev;
      // Insert in chronological order by createdAt
      const normalized = {
        ...selectedMessage,
        id,
        type: 'message',
        _injected: true,
      };
      const insertIdx = prev.findIndex(
        (p) => p.createdAt && normalized.createdAt && new Date(p.createdAt) > new Date(normalized.createdAt)
      );
      if (insertIdx === -1) return [...prev, normalized];
      const next = [...prev];
      next.splice(insertIdx, 0, normalized);
      return next;
    });

    setTargetMessageId(id);
  }, []);

  React.useEffect(() => {
    if (!targetMessageId || !postsContainerRef.current) return;

    const messageElement = postsContainerRef.current.querySelector(`[data-message-id="${targetMessageId}"]`);

    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(targetMessageId);
      // Suppress the next scroll-to-bottom that fires when targetMessageId → null
      suppressScrollToBottomRef.current = true;
      setTargetMessageId(null);

      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }

      highlightTimerRef.current = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1800);
    }
    // Do NOT clear targetMessageId here if not found — the inject may still be rendering
  }, [targetMessageId, localPosts]);

  React.useEffect(() => () => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
  }, []);

  // Scroll to bottom: instant on room switch or initial load, smooth on new message
  React.useEffect(() => {
    if (!activeRoom) return;
    if (targetMessageId) return;
    if (suppressScrollToBottomRef.current) {
      suppressScrollToBottomRef.current = false;
      return;
    }
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      return;
    }
    const roomChanged = activeRoom !== prevRoomRef.current;
    prevRoomRef.current = activeRoom;
    const isInitial = isInitialLoadRef.current;
    isInitialLoadRef.current = false;
    const el = postsContainerRef.current;
    if (!el) return;
    if (roomChanged || isInitial) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [activeRoom, localPosts, targetMessageId]);

  const postsWithDates = React.useMemo(() => withDateSeparators(localPosts), [localPosts]);

  const leftDrawerWidth = showLeftDrawer && leftDrawerOpen ? DRAWER_WIDTH : 0;

  return (
    // height: 105px is the dashboard header height (AppBar + offset)
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden' }}>

      {showLeftDrawer && (
        <LeftDrawer
          open={leftDrawerOpen}
          onToggle={handleToggleLeftDrawer}
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
                  isGarage={activeRoom?.isGarage}
                  messages={localPosts}
                  onMessageSelect={handleMessageSelect}
                  onRoomInfoOpenChange={(val) => {
                    setRoomInfoOpen(val);
                    if (val) {
                      setDrawerOpen(false);
                      setProfileDrawerOpen(false);
                      closeOverlayDrawers();
                    }
                  }}
                />

                <Box sx={{ flexShrink: 0 }}>
                  <PinnedMessagesDisplay
                    pinnedMessages={pinnedMessages}
                    onUnpin={handleUnpinMessage}
                    onMessageClick={handleMessageSelect}
                  />
                </Box>

                {/* Scrollable posts — only this scrolls */}
                <Box
                  ref={postsContainerRef}
                  onScroll={() => {
                    const el = postsContainerRef.current;
                    if (!el) return;
                    // Reset guard when user scrolls away from top
                    if (el.scrollTop > 80) { scrollGuardRef.current = false; return; }
                    // Near top — load older messages
                    if (scrollGuardRef.current || !hasMoreMessages || messagesQuery.isFetching) return;
                    scrollGuardRef.current = true;
                    prevScrollHeightRef.current = el.scrollHeight;
                    setMessagesPage((p) => p + 1);
                  }}
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
                  {/* Spinner at top when loading older pages */}
                  {messagesQuery.isFetching && messagesPage > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={22} sx={{ color: '#4C4EFF' }} />
                    </Box>
                  )}

                  {/* Spinner for initial room load */}
                  {messagesQuery.isFetching && messagesPage === 1 && localPosts.length === 0 && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: '#4C4EFF' }} />
                    </Box>
                  )}

                  {postsWithDates.map((item) =>
                    item.type === 'date' ? (
                      <OldMessagesLabel key={item.id} label={item.label} />
                    ) : (
                      <Box
                        key={`post-${item.id}`}
                        data-message-id={String(item.id)}
                        sx={{
                          borderRadius: 4,
                          transition: 'box-shadow 0.25s ease, background-color 0.25s ease',
                          ...(highlightedMessageId === String(item.id) && {
                            backgroundColor: 'rgba(76, 78, 255, 0.08)',
                            boxShadow: '0 0 0 2px rgba(76, 78, 255, 0.35)',
                          }),
                        }}
                      >
                        <PostCard post={item} onCommentClick={handleOpenComments} />
                      </Box>
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
                    <AttachedFileChip file={attachedFile} onRemove={() => setAttachedFile(null)} />
                  )}

                  {audioRecorderOpen ? (
                    <AudioRecorder
                      onDone={(fileData) => {
                        setAudioRecorderOpen(false);
                        setAttachedFile({
                          url: fileData.url,
                          type: fileData.type,
                          name: fileData.name,
                          size: fileData.size,
                        });
                      }}
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
