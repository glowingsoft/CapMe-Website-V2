import React from 'react';
import Box from '@mui/material/Box';
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
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';
import PinnedMessagesDisplay from './components/pinned-messages-display';
import CircularProgress from '@mui/material/CircularProgress';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { useGetRoomMessagesQuery, useGetRoomPinnedMessagesQuery } from 'src/store/Reducer/rooms-api';
import { getSocket } from 'src/socket/socket';
import { chatSocketService } from 'src/socket/chatSocketService';
import { toast } from 'src/components/snackbar';
import ChatInputBar from './components/chat-input-bar';
import MessageSkeleton from './components/message-skeleton';

const DRAWER_WIDTH = 420;
const MESSAGES_LIMIT = 10;

// Expand backend category strings ("image", "video", "audio", "file") to real MIME types
// so FileMessage type checks (startsWith('image/') etc.) work correctly.
const ATTACHMENT_TYPE_MAP = { image: 'image/jpeg', video: 'video/mp4', audio: 'audio/mpeg', voice: 'audio/mpeg', file: 'application/octet-stream' };
const resolveAttachmentType = (raw) => {
  if (raw && raw.includes('/')) return raw;
  const t = raw?.toLowerCase() ?? '';
  const ext = t.split('.').pop();
  const EXT = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', mp4: 'video/mp4', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf' };
  if (EXT[ext]) return EXT[ext];
  return ATTACHMENT_TYPE_MAP[t] ?? raw ?? 'application/octet-stream';
};
const getEntityId = (item) => String(item?.id ?? item?._id ?? '');
const cleanUrl = (s) => {
  if (!s || typeof s !== 'string') return '';
  // Fix duplicated base URL: https://bucket.com/https://bucket.com/file → https://bucket.com/file
  return s.replace(/^https?:\/\/[^/]+(\/https?:\/\/.+)$/, (_, rest) => rest.slice(1)).trim();
};

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
  const currentUser = useSelector(selectUser);
  const currentUserId = String(currentUser?.id ?? currentUser?._id ?? currentUser?.basicInfo?._id ?? '');
  const currentUserImage = currentUser?.photoURL ?? currentUser?.image ?? currentUser?.basicInfo?.image ?? currentUser?.avatar ?? '';
  const showLeftDrawer = /^\/(home|dashboard)(\/|$)/.test(location.pathname);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(true);
  const [activeRoom, setActiveRoom] = React.useState(null);
  const [pinnedMessages, setPinnedMessages] = React.useState([]);
  const [isPinnedRefetching, setIsPinnedRefetching] = React.useState(false);

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
  // true while the first page of a newly-selected room is in flight
  // initialized true so the skeleton shows immediately if a room is auto-selected on mount
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  // Refs for scroll management (stable across renders)
  const prevScrollHeightRef = React.useRef(0);   // saved before prepend
  const isPrependingRef = React.useRef(false);    // skip scroll-to-bottom during prepend
  const scrollGuardRef = React.useRef(false);     // prevents duplicate page increments
  const isInitialLoadRef = React.useRef(false);   // marks first page load for a room → instant scroll to bottom
  const suppressScrollToBottomRef = React.useRef(false); // skip one scroll-to-bottom after targeted scroll
  const roomVisibilityRef = React.useRef(null); // visibility from messages API response
  const pendingScrollMessageRef = React.useRef(null); // message to scroll to after room loads
  const isJumpingToMessageRef = React.useRef(false);  // suppresses scroll-to-bottom while jumping to a target

  const normalizeMessage = React.useCallback((msg) => {
    const senderId = msg.senderId ?? msg.sender?._id ?? msg.sender?.id ?? '';
    const isCurrentUser = currentUserId && String(senderId) === currentUserId;
    const avatar = cleanUrl(msg.senderImage ?? msg.sender?.image ?? msg.sender?.photo ?? msg.sender?.photoURL ?? (isCurrentUser ? currentUserImage : '') ?? '');
    return {
      id: msg._id ?? msg.id,
      type: 'message',
      user: {
        id: senderId,
        name: msg.sendername ?? msg.sender?.name ?? 'Unknown',
        username: `@${msg.sender?.email?.split('@')[0] ?? msg.sendername?.split(' ')[0]?.toLowerCase() ?? 'user'}`,
        avatar,
      },
      content: msg.content ?? msg.text ?? '',
      text: msg.text ?? msg.content ?? '',
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
      meta: msg.meta ?? {},
      tags: msg.tags ?? [],
      roomId: msg.roomId ?? '',
      visibility: msg.visibility?.toLowerCase() ?? activeRoom?.visibility ?? null,
      is_pin: !!(msg.is_pin ?? msg.isPinned),
      isPinned: !!(msg.is_pin ?? msg.isPinned),
      is_edited: !!msg.is_edited,
      attachments: Array.isArray(msg.attachments)
        ? msg.attachments.map((att) => ({
          url: att.fileUrl ?? att.url ?? '',
          type: resolveAttachmentType(att.fileType ?? att.type ?? ''),
          name: att.originalFileName ?? att.originalName ?? att.fileName ?? '',
          size: att.size ?? 0,
        }))
        : [],
    };
  }, [activeRoom?.visibility, currentUserId, currentUserImage]);

  const messagesQuery = useGetRoomMessagesQuery(
    { roomId: activeRoom?.id, page: messagesPage, limit: MESSAGES_LIMIT },
    { skip: !activeRoom?.id, refetchOnMountOrArgChange: true }
  );

  const pinnedQuery = useGetRoomPinnedMessagesQuery(
    { roomId: activeRoom?.id },
    { skip: !activeRoom?.id, refetchOnMountOrArgChange: true }
  );
  const pinnedRefetchRef = React.useRef(pinnedQuery.refetch);
  React.useEffect(() => { pinnedRefetchRef.current = pinnedQuery.refetch; });

  // Populate pinned messages from dedicated API
  React.useEffect(() => {
    if (!pinnedQuery.isSuccess || pinnedQuery.isFetching) return;
    setPinnedMessages(pinnedQuery.data ?? []);
    setIsPinnedRefetching(false);
  }, [pinnedQuery.data, pinnedQuery.isSuccess, pinnedQuery.isFetching]);

  // Populate / accumulate messages when API responds
  React.useEffect(() => {
    if (!messagesQuery.isSuccess || messagesQuery.isFetching) return;
    const raw = messagesQuery.data?.body?.messages ?? [];
    const roomVisibility = messagesQuery.data?.body?.room?.visibility?.toLowerCase() ?? activeRoom?.visibility ?? null;
    roomVisibilityRef.current = roomVisibility;
    // API returns newest-first — reverse to show oldest at top
    const normalized = [...raw].reverse().map((msg) => ({ ...normalizeMessage(msg), visibility: roomVisibility }));
    setHasMoreMessages(raw.length >= MESSAGES_LIMIT);
    if (messagesPage === 1) {
      isPrependingRef.current = false;
      isInitialLoadRef.current = true; // first batch → scroll instantly to bottom
      setIsLoadingMessages(false);
      setLocalPosts(normalized);
      if (pendingScrollMessageRef.current) {
        const msg = pendingScrollMessageRef.current;
        pendingScrollMessageRef.current = null;
        isInitialLoadRef.current = false; // don't auto-scroll to bottom
        setTimeout(() => handleMessageSelect(msg), 0);
      }
    } else {
      isPrependingRef.current = true;
      setLocalPosts((prev) => {
        const existingIds = new Set(prev.map((m) => String(m.id)));
        const unique = normalized.filter((m) => !existingIds.has(String(m.id)));
        return [...unique, ...prev];
      });
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

  // Socket: join room and listen for real-time events
  React.useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeRoom?.id) return;

    chatSocketService.joinRoom(activeRoom.id);

    const onMessageReceive = ({ message }) => {
      if (!message) return;
      const msgRoomId = String(message.roomId ?? message.room_id ?? '');
      console.log('[Socket] messageRecieve →', message._id, '| room:', msgRoomId, '| active:', activeRoom.id);

      // Always update the sidebar last-message preview for the correct room
      window.dispatchEvent(new CustomEvent('roomLastMessageUpdate', {
        detail: { roomId: msgRoomId || activeRoom.id, message },
      }));

      // Discard messages that don't belong to the active room
      if (msgRoomId && msgRoomId !== String(activeRoom.id)) return;

      setLocalPosts((prev) => {
        if (prev.some((p) => String(p.id) === String(message._id))) return prev;
        return [...prev, { ...normalizeMessage(message), visibility: roomVisibilityRef.current }];
      });
    };

    const onSocketMessageDeleted = ({ messageId }) => {
      console.log('[Socket] messageDeleted →', messageId);
      setLocalPosts((prev) => prev.filter((m) => getEntityId(m) !== String(messageId)));
      setPinnedMessages((prev) => prev.filter((m) => getEntityId(m) !== String(messageId)));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? null : prev));
    };

    const onSocketMessageEdited = ({ messageId, content, senderId, meta, tags, is_edited }) => {
      console.log('[Socket] messageEdited →', messageId);
      const updateMessage = (p) =>
        getEntityId(p) === String(messageId)
          ? {
            ...p,
            content,
            text: content,
            meta: meta ?? {},
            tags: tags ?? [],
            is_edited,
            senderId: senderId ?? p.senderId,
          }
          : p;
      setLocalPosts((prev) => prev.map(updateMessage));
      setPinnedMessages((prev) => prev.map(updateMessage));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? updateMessage(prev) : prev));
    };

    const onSocketMessageLiked = ({ messageId, likesCount, action }) => {
      console.log('[Socket] messageLiked →', messageId, '| count:', likesCount);
      const updateMessage = (p) =>
        getEntityId(p) === String(messageId)
          ? { ...p, stats: { ...p.stats, likes: likesCount }, likeAction: action }
          : p;
      setLocalPosts((prev) => prev.map(updateMessage));
      setPinnedMessages((prev) => prev.map(updateMessage));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? updateMessage(prev) : prev));
    };

    const onSocketMessagePinned = ({ messageId, is_pin, pinnedMessages: serverPinned }) => {
      console.log('[Socket] messagePinned →', messageId, '| is_pin:', is_pin);
      const updateMessage = (p) =>
        getEntityId(p) === String(messageId) ? { ...p, is_pin, isPinned: is_pin } : p;

      setLocalPosts((prev) => prev.map(updateMessage));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? updateMessage(prev) : prev));

      if (Array.isArray(serverPinned)) {
        setPinnedMessages(serverPinned);
      } else if (!is_pin) {
        // Unpin: remove immediately for instant UX
        setPinnedMessages((prev) => prev.filter((p) => getEntityId(p) !== String(messageId)));
      }
      // Set loading state synchronously before refetch so skeleton shows on the very next render
      setIsPinnedRefetching(true);
      pinnedRefetchRef.current?.();
    };

    const onChatCleared = () => {
      console.log('[Socket] chatCleared');
      setLocalPosts([]);
      setPinnedMessages([]);
    };

    socket.on('messageRecieve', onMessageReceive);
    socket.on('messageDeleted', onSocketMessageDeleted);
    socket.on('messageEdited', onSocketMessageEdited);
    socket.on('messageLiked', onSocketMessageLiked);
    socket.on('messagePinned', onSocketMessagePinned);
    socket.on('chatCleared', onChatCleared);

    return () => {
      chatSocketService.leaveRoom(activeRoom.id);
      socket.off('messageRecieve', onMessageReceive);
      socket.off('messageDeleted', onSocketMessageDeleted);
      socket.off('messageEdited', onSocketMessageEdited);
      socket.off('messageLiked', onSocketMessageLiked);
      socket.off('messagePinned', onSocketMessagePinned);
      socket.off('chatCleared', onChatCleared);
    };
  }, [activeRoom?.id, normalizeMessage]);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setDrawerOpen(false); setRoomInfoOpen(false); setProfileDrawerOpen(false); };
    const onOpenRoom = (e) => handleRoomSelect(e.detail);
    const onOpenRoomMessage = (e) => {
      const { room, message } = e.detail || {};
      if (message) pendingScrollMessageRef.current = message;
      handleRoomSelect(room);
    };
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    const onCloseComment = () => {
      setDrawerOpen(false);
      setSelectedPost(null);
    };

    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('accountDrawerOpened', onAccountOpened);
    window.addEventListener('openRoom', onOpenRoom);
    window.addEventListener('openRoomMessage', onOpenRoomMessage);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('notificationsDrawerChange', onNotificationsChange);
    window.addEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
    const onShareMessage = (e) => {
      const { messageId, shareCount } = e.detail || {};
      if (!messageId) return;
      setLocalPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) !== String(messageId)) return p;
          return {
            ...p,
            stats: {
              ...p.stats,
              shares: shareCount !== undefined ? shareCount : p.stats.shares + 1,
            },
          };
        })
      );
    };

    const onCommentAdded = (e) => {
      const { messageId } = e.detail || {};
      if (!messageId) return;
      setLocalPosts((prev) =>
        prev.map((p) =>
          String(p.id) === String(messageId)
            ? { ...p, stats: { ...p.stats, comments: (p.stats?.comments ?? 0) + 1 } }
            : p
        )
      );
    };

    const onCommentRemoved = (e) => {
      const { messageId } = e.detail || {};
      if (!messageId) return;
      setLocalPosts((prev) =>
        prev.map((p) =>
          String(p.id) === String(messageId)
            ? { ...p, stats: { ...p.stats, comments: Math.max(0, (p.stats?.comments ?? 0) - 1) } }
            : p
        )
      );
    };

    window.addEventListener('shareMessage', onShareMessage);
    window.addEventListener('commentAdded', onCommentAdded);
    window.addEventListener('commentRemoved', onCommentRemoved);

    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('accountDrawerOpened', onAccountOpened);
      window.removeEventListener('openRoom', onOpenRoom);
      window.removeEventListener('openRoomMessage', onOpenRoomMessage);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
      window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
      window.removeEventListener('shareMessage', onShareMessage);
      window.removeEventListener('commentAdded', onCommentAdded);
      window.removeEventListener('commentRemoved', onCommentRemoved);
    };
  }, []);

  const anyRightDrawerOpen = drawerOpen || roomInfoOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;

  // Sentinel ref — always sits below the last post
  const postsEndRef = React.useRef(null);
  // Track previous room to distinguish room-switch (instant) vs new message (smooth)
  const prevRoomRef = React.useRef(null);

  const handleUnpinMessage = React.useCallback(async (messageId) => {
    const socket = getSocket();
    if (!socket?.connected) {
      toast.error('Not connected. Please try again.');
      return;
    }

    if (!messageId) return;
    chatSocketService.pinMessage({ messageId, is_pin: false });
  }, []);

  const clearActiveRoomState = React.useCallback(() => {
    setActiveRoom(null);
    setLocalPosts([]);
    setPinnedMessages([]);
    setSelectedPost(null);
    setMessagesPage(1);
    setHasMoreMessages(false);
    setIsLoadingMessages(false);
    setDrawerOpen(false);
    setRoomInfoOpen(false);
    setTargetMessageId(null);
    setHighlightedMessageId(null);
    roomVisibilityRef.current = null;
    pendingScrollMessageRef.current = null;
    isJumpingToMessageRef.current = false;
    prevScrollHeightRef.current = 0;
    scrollGuardRef.current = false;
    isPrependingRef.current = false;
    isInitialLoadRef.current = false;
    suppressScrollToBottomRef.current = false;
    prevRoomRef.current = null;
  }, []);

  const handleRoomSelect = (room) => {
    if (room?.id && room.id === activeRoom?.id) return;
    roomVisibilityRef.current = null;
    isJumpingToMessageRef.current = !!pendingScrollMessageRef.current;
    setActiveRoom(room);
    setLocalPosts([]);
    setPinnedMessages([]);
    setMessagesPage(1);
    setHasMoreMessages(false);
    setIsLoadingMessages(true);
    prevScrollHeightRef.current = 0;
    scrollGuardRef.current = false;
    isPrependingRef.current = false;
  };

  React.useEffect(() => {
    const onRoomFollowUpdate = (e) => {
      const { roomId: updatedId, isFollowing } = e.detail ?? {};
      if (!updatedId || isFollowing !== false) return;
      if (String(updatedId) !== String(activeRoom?.id)) return;
      clearActiveRoomState();
    };

    window.addEventListener('roomFollowUpdate', onRoomFollowUpdate);
    return () => window.removeEventListener('roomFollowUpdate', onRoomFollowUpdate);
  }, [activeRoom?.id, clearActiveRoomState]);

  const handleActiveRoomUnfollow = React.useCallback((roomId) => {
    if (!roomId || String(roomId) !== String(activeRoom?.id)) return;
    clearActiveRoomState();
  }, [activeRoom?.id, clearActiveRoomState]);

  // Open a room (and optionally scroll to a message) passed via navigation state
  React.useEffect(() => {
    if (location.state?.pendingRoom) {
      if (location.state?.pendingMessageId) {
        pendingScrollMessageRef.current = { _id: location.state.pendingMessageId, id: location.state.pendingMessageId };
      }
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
    // Keep selectedPost set so comments stay in memory and reopen is instant
  };

  const handleToggleLeftDrawer = () => {
    setLeftDrawerOpen((prev) => !prev);
  };


  const handleMessageSelect = React.useCallback((selectedMessage) => {
    const selectedId = selectedMessage?.id ?? selectedMessage?._id;
    if (!selectedId) return;
    const id = String(selectedId);

    // If message isn't loaded yet, inject it fully normalized so it renders correctly
    setLocalPosts((prev) => {
      const exists = prev.some((p) => String(p.id) === id);
      if (exists) return prev;
      const normalized = {
        ...normalizeMessage(selectedMessage),
        id,
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
  }, [normalizeMessage]);

  React.useEffect(() => {
    if (!targetMessageId || !postsContainerRef.current) return;

    const messageElement = postsContainerRef.current.querySelector(`[data-message-id="${targetMessageId}"]`);

    if (messageElement) {
      // Wait one frame so all pending renders are committed before measuring position
      requestAnimationFrame(() => {
        const container = postsContainerRef.current;
        if (!container) return;
        const msgTop = messageElement.getBoundingClientRect().top
          - container.getBoundingClientRect().top
          + container.scrollTop;
        const centerOffset = (container.clientHeight - messageElement.offsetHeight) / 2;
        container.scrollTop = Math.max(0, msgTop - centerOffset);
        isJumpingToMessageRef.current = false; // allow scroll-to-bottom behaviour to resume
      });

      setHighlightedMessageId(targetMessageId);
      suppressScrollToBottomRef.current = true;
      setTargetMessageId(null);

      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => setHighlightedMessageId(null), 1800);
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
    if (isJumpingToMessageRef.current) return; // a targeted message scroll is in progress
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
      // Re-pin to bottom as images/link-previews expand (stops after 3s or user scrolls)
      const observer = new ResizeObserver(() => {
        if (isJumpingToMessageRef.current) return; // don't fight a targeted scroll
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distFromBottom < 300) el.scrollTop = el.scrollHeight;
      });
      observer.observe(el);
      const timer = setTimeout(() => observer.disconnect(), 3000);
      return () => { observer.disconnect(); clearTimeout(timer); };
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom, localPosts.length, targetMessageId]);

  const postsWithDates = React.useMemo(() => withDateSeparators(localPosts), [localPosts]);

  const enrichedMembers = React.useMemo(() => {
    const raw = messagesQuery.data?.body?.room?.members ?? activeRoom?.members ?? [];
    if (!Array.isArray(raw)) return [];

    const senderMap = new Map();
    // Use normalized localPosts first (stable, already formatted)
    localPosts.forEach((p) => {
      const uid = p?.user?.id;
      if (uid) senderMap.set(String(uid), { name: p.user?.name ?? '', avatar: cleanUrl(p.user?.avatar ?? p.user?.image ?? ''), email: p.user?.email ?? '' });
    });

    // Also fall back to raw messages from the API (sender object) — covers initial load before normalization
    const rawMsgs = messagesQuery.data?.body?.messages ?? [];
    rawMsgs.forEach((msg) => {
      const sid = msg?.sender?._id ?? msg?.senderId ?? msg?.sender?.id;
      if (sid && !senderMap.has(String(sid))) {
        senderMap.set(String(sid), { name: msg.sender?.name ?? '', avatar: cleanUrl(msg.sender?.image ?? msg.sender?.photo ?? ''), email: msg.sender?.email ?? '' });
      }
    });

    return raw.map((m) => {
      const u = typeof m.user === 'object' && m.user !== null ? m.user : null;
      const userId = u?._id ?? m.user ?? m.userId ?? m.id ?? m._id ?? '';
      const sender = userId ? senderMap.get(String(userId)) : null;
      const inferredName = u?.name ?? m.name ?? sender?.name ?? '';
      const inferredAvatar = cleanUrl(u?.image ?? u?.avatar ?? m.image ?? m.avatar ?? sender?.avatar ?? sender?.image ?? '');
      return {
        id: userId || m._id || '',
        userId,
        name: inferredName,
        avatar: inferredAvatar,
        email: u?.email ?? m.email ?? sender?.email ?? '',
        permission: (m.permission ?? m.role ?? 'view')?.toString?.() ?? 'view',
      };
    });
  }, [messagesQuery.data, localPosts, activeRoom?.members]);

  // Debug: inspect enriched members in dev only
  try { console.debug && console.debug('enrichedMembers', enrichedMembers); } catch (e) { }

  // Calculate if current user is room admin
  const isRoomAdmin = React.useMemo(() => {
    if (!activeRoom || !currentUser) return false;
    const roomFromMessages = messagesQuery.data?.body?.room;
    const userId = String(currentUser._id ?? currentUser.id ?? '');

    // Top-level permission field (some API shapes)
    const rootPermission = String(roomFromMessages?.permission ?? activeRoom.permission ?? '').toLowerCase();
    if (rootPermission === 'admin') return true;

    // Creator check — room.createdby matches current user
    const createdBy = String(roomFromMessages?.createdby ?? activeRoom.createdby ?? '');
    if (createdBy && createdBy === userId) return true;

    // Member-level permission check
    const members = roomFromMessages?.members ?? activeRoom.members ?? [];
    if (!Array.isArray(members)) return false;

    return members.some((m) => {
      const user = typeof m.user === 'object' && m.user !== null ? m.user : null;
      const memberId = String(user?._id ?? user?.id ?? m.user ?? m.userId ?? m.id ?? m._id ?? '');
      const permission = String(m.permission ?? m.role ?? '').toLowerCase();
      return memberId === userId && permission === 'admin';
    });
  }, [activeRoom, currentUser, messagesQuery.data]);

  const canPost = React.useMemo(() => {
    if (isRoomAdmin) return true;
    const roomFromMessages = messagesQuery.data?.body?.room;
    const members = roomFromMessages?.members ?? activeRoom?.members ?? [];
    if (!Array.isArray(members) || !currentUserId) return false;
    const me = members.find((m) => {
      const userObj = typeof m.user === 'object' && m.user !== null ? m.user : null;
      const mId = String(userObj?._id ?? userObj?.id ?? (typeof m.user === 'string' ? m.user : null) ?? m.userId ?? m.id ?? m._id ?? '');
      return mId === currentUserId;
    });
    if (!me) return true; // not yet in list — optimistically allow (e.g. owner not listed)
    const status = (me.status ?? 'active').toLowerCase();
    const permission = (me.permission ?? me.role ?? 'view').toLowerCase();
    return status === 'active' && (permission === 'edit' || permission === 'admin');
  }, [isRoomAdmin, activeRoom, currentUserId, messagesQuery.data]);

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
                  messagesRoom={messagesQuery.data?.body?.room}
                  enrichedMembers={enrichedMembers}
                  isGarage={activeRoom?.isGarage}
                  isLoading={isLoadingMessages}
                  messages={localPosts}
                  onMessageSelect={handleMessageSelect}
                  isRoomAdmin={isRoomAdmin}
                  onRoomUnfollow={handleActiveRoomUnfollow}
                  onDeleteRoom={() => {
                    const deletedId = activeRoom?._id ?? activeRoom?.id;
                    setActiveRoom(null);
                    setLocalPosts([]);
                    window.dispatchEvent(new CustomEvent('roomDeleted', { detail: { roomId: deletedId } }));
                  }}
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
                    isFetching={isPinnedRefetching}
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

                  {/* Skeleton for initial room load — shown from the moment the room is selected
                      until the first page of messages arrives, preventing the empty-state flash */}
                  {isLoadingMessages && (
                    <MessageSkeleton count={5} />
                  )}

                  {/* Empty state — only shown after load completes with genuinely no messages */}
                  {!isLoadingMessages && !messagesQuery.isFetching && messagesQuery.isSuccess && localPosts.length === 0 && (
                    activeRoom?.isGarage ? (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 4,
                            bgcolor: 'rgba(76,78,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon="solar:garage-bold" width={40} style={{ color: '#4C4EFF', opacity: 0.75 }} />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111', mb: 0.5 }}>
                            Your garage is empty
                          </Typography>
                          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 260, lineHeight: 1.6 }}>
                            This is your private space — jot down notes, ideas, or reminders. Only you can see this.
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: 'rgba(76,78,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Iconify icon="solar:chat-line-bold-duotone" width={32} style={{ color: '#4C4EFF' }} />
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                          No messages yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 260 }}>
                          Be the first to say something in <Box component="span" sx={{ color: '#4C4EFF', fontWeight: 600 }}>{activeRoom?.name}</Box>!
                        </Typography>
                      </Box>
                    )
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
                        <PostCard post={item} onCommentClick={handleOpenComments} noAutoFetch />
                      </Box>
                    )
                  )}

                  {/* Sentinel — scrollIntoView targets this to reach the bottom */}
                  <div ref={postsEndRef} />
                </Box>

                {/* Message input — pinned at bottom, never scrolls */}
                {canPost ? (
                  <ChatInputBar activeRoom={activeRoom} />
                ) : (
                  <Box
                    sx={{
                      flexShrink: 0,
                      mt: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      background: 'linear-gradient(90deg, rgba(76,78,255,0.08) 0%, rgba(76,78,255,0.03) 100%)',
                      border: '1.5px solid rgba(76,78,255,0.18)',
                      borderRadius: 3,
                      px: 2,
                      py: 1.25,
                    }}
                  >
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(76,78,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Iconify icon="solar:lock-bold" width={17} style={{ color: '#4C4EFF' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={13} fontWeight={700} color="#4C4EFF" lineHeight={1.3}>
                        View access only
                      </Typography>
                      <Typography fontSize={11.5} color="text.secondary" lineHeight={1.3} sx={{ mt: 0.25 }}>
                        Admin has given you view access only. Contact the admin to get edit permission.
                      </Typography>
                    </Box>
                  </Box>
                )}
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
          onCreate={(room) => {
            if (!room?._id) return;
            window.dispatchEvent(new CustomEvent('roomCreated', { detail: room }));
            handleRoomSelect({
              id: room._id,
              name: room.name ?? 'Untitled Room',
              icon: room.image ?? '',
              visibility: room.visibility ?? 'public',
              desc: '',
              unread: 0,
              favorite: false,
              lastMessageAt: room.createdAt ?? new Date().toISOString(),
            });
          }}
        />
      </Box>

    </Box>
  );
}
