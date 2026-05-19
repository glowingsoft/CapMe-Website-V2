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
import { scrollToBottom } from 'src/utils/scroll-to-bottom';
import { cleanUrl, withDateSeparators } from 'src/utils/message-utils';
import PinnedMessagesDisplay from './components/pinned-messages-display';
import CircularProgress from '@mui/material/CircularProgress';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { useGetRoomMessagesQuery, useGetRoomPinnedMessagesQuery } from 'src/store/Reducer/rooms-api';
import { getSocket } from 'src/socket/socket';
import { chatSocketService } from 'src/socket/chatSocketService';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales';
import ChatInputBar from './components/chat-input-bar';
import MessageSkeleton from './components/message-skeleton';
import UserProfileDrawer from './components/user-profile-drawer';

const DRAWER_WIDTH = 420;
const MESSAGES_LIMIT = 10;

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
export default function HomeView() {
  const { t } = useTranslate('common');
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
  const [blockedProfileOpen, setBlockedProfileOpen] = React.useState(false);
  const [targetMessageId, setTargetMessageId] = React.useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = React.useState(null);
  const postsContainerRef = React.useRef(null);
  const highlightTimerRef = React.useRef(null);
  const [localPosts, setLocalPosts] = React.useState([]);
  const [messagesPage, setMessagesPage] = React.useState(1);
  const [roomSearchRaw, setRoomSearchRaw] = React.useState('');
  const [roomSearch, setRoomSearch] = React.useState('');
  const [hasMoreMessages, setHasMoreMessages] = React.useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);

  const handleRoomSelectRef = React.useRef(null);
  const activeRoomRef = React.useRef(null);
  const prevScrollHeightRef = React.useRef(0);
  const isPrependingRef = React.useRef(false);
  const scrollGuardRef = React.useRef(false);
  const isInitialLoadRef = React.useRef(false);
  const suppressScrollToBottomRef = React.useRef(false);
  const roomVisibilityRef = React.useRef(null);
  const pendingScrollMessageRef = React.useRef(null);
  const isJumpingToMessageRef = React.useRef(false);
  const normalizeMessage = React.useCallback((msg) => {
    const senderId = msg.senderId ?? msg.sender?._id ?? msg.sender?.id ?? '';
    const isCurrentUser = currentUserId && String(senderId) === currentUserId;
    const avatar = cleanUrl(msg.senderImage ?? msg.sender?.image ?? msg.sender?.photo ?? msg.sender?.photoURL ?? (isCurrentUser ? currentUserImage : '') ?? '');
    return {
      id: msg._id ?? msg.id,
      type: 'message',
      user: {
        id: senderId,
        name: msg.sender?.name ?? msg.sendername ?? '',
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRoomSearch(roomSearchRaw);
      setMessagesPage(1);
      setLocalPosts([]);
      setIsLoadingMessages(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [roomSearchRaw]);

  const messagesQuery = useGetRoomMessagesQuery(
    { roomId: activeRoom?.id, page: messagesPage, limit: MESSAGES_LIMIT, search: roomSearch },
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

  React.useEffect(() => {
    if (!messagesQuery.isSuccess || messagesQuery.isFetching) return;
    const args = messagesQuery.originalArgs ?? {};
    if (String(args.page) !== String(messagesPage) || String(args.roomId) !== String(activeRoom?.id)) return;
    const raw = messagesQuery.data?.body?.messages ?? [];
    const roomFromMessages = messagesQuery.data?.body?.room;
    const roomVisibility = roomFromMessages?.visibility?.toLowerCase() ?? activeRoom?.visibility ?? null;
    roomVisibilityRef.current = roomVisibility;

    const normalized = [...raw].reverse().map((msg) => ({ ...normalizeMessage(msg), visibility: roomVisibility }));
    setHasMoreMessages(raw.length >= MESSAGES_LIMIT);
    if (messagesPage === 1) {
      isPrependingRef.current = false;
      isInitialLoadRef.current = true;
      setIsLoadingMessages(false);
      setLocalPosts(normalized);

      // Sync follow/request/permission status from the messages API response
      if (roomFromMessages) {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          const isFollow = roomFromMessages.isFollow ?? roomFromMessages.is_following;
          const isRequest = roomFromMessages.isRequest ?? roomFromMessages.is_requested;
          const permission = roomFromMessages.permission ?? prev.permission;
          return {
            ...prev,
            ...(isFollow !== undefined ? { is_following: isFollow } : {}),
            ...(isRequest !== undefined ? { is_requested: isRequest } : {}),
            ...(permission !== undefined ? { permission } : {}),
            members: roomFromMessages.members ?? prev.members,
          };
        });
      }

      if (pendingScrollMessageRef.current) {
        const msg = pendingScrollMessageRef.current;
        pendingScrollMessageRef.current = null;
        isInitialLoadRef.current = false;
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

  React.useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0 && postsContainerRef.current) {
      const el = postsContainerRef.current;
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }

  }, [localPosts]);

  // Socket: join room and listen for real-time events
  React.useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeRoom?.id) return;

    chatSocketService.joinRoom(activeRoom.id);

    const onMessageReceive = ({ message }) => {
      if (!message) return;
      const msgRoomId = String(message.roomId ?? message.room_id ?? '');
      const isBackgroundRoom = msgRoomId && msgRoomId !== String(activeRoom.id);
      console.log('[Socket] messageRecieve ->', message._id, '| room:', msgRoomId, '| active:', activeRoom.id, '| background:', isBackgroundRoom);

      if (isBackgroundRoom) return;

      const msgSenderId = String(message.senderId ?? message.sender?._id ?? message.sender?.id ?? '');
      const msgContent = message.content ?? message.text ?? '';

      setLocalPosts((prev) => {
        if (prev.some((p) => !p.isOptimistic && String(p.id) === String(message._id))) return prev;
        // Remove matching optimistic message from the current user
        const withoutOptimistic = prev.filter(
          (p) => !(p.isOptimistic && String(p.user?.id) === msgSenderId && p.content === msgContent)
        );
        return [...withoutOptimistic, { ...normalizeMessage(message), visibility: roomVisibilityRef.current }];
      });
    };

    const onSocketMessageDeleted = ({ messageId }) => {
      console.log('[Socket] messageDeleted ->', messageId);
      setLocalPosts((prev) => prev.filter((m) => getEntityId(m) !== String(messageId)));
      setPinnedMessages((prev) => prev.filter((m) => getEntityId(m) !== String(messageId)));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? null : prev));
    };

    const onSocketMessageEdited = ({ messageId, content, senderId, meta, tags, is_edited }) => {
      console.log('[Socket] messageEdited ->', messageId);
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
      console.log('[Socket] messageLiked ->', messageId, '| count:', likesCount);
      const updateMessage = (p) =>
        getEntityId(p) === String(messageId)
          ? { ...p, stats: { ...p.stats, likes: likesCount }, likeAction: action }
          : p;
      setLocalPosts((prev) => prev.map(updateMessage));
      setPinnedMessages((prev) => prev.map(updateMessage));
      setSelectedPost((prev) => (getEntityId(prev) === String(messageId) ? updateMessage(prev) : prev));
    };

    const onSocketMessagePinned = ({ messageId, is_pin, pinnedMessages: serverPinned }) => {
      console.log('[Socket] messagePinned ->', messageId, '| is_pin:', is_pin);
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

  // Global socket listener — room list updates (unread count, last message, favourite)
  // Depends on currentUserId so it runs after the layout has called connectSocket
  React.useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();
    if (!socket) {
      console.warn('[roomListUpdate] Socket not available yet - listener not attached');
      return;
    }
    console.log('[roomListUpdate] Attaching socket listener for user:', currentUserId);
    const onRoomListUpdate = ({ roomId, last_message, unreadCount, is_favorite }) => {
      console.log('[Socket] roomListUpdate ->', { roomId, unreadCount, last_message, is_favorite });
      if (!roomId) return;
      const detail = {
        roomId,
        ...(unreadCount != null ? { unreadCount } : {}),
        ...(last_message ? { lastMessage: last_message } : {}),
      };
      console.log('[roomListUpdate] Dispatching window event ->', detail);
      window.dispatchEvent(new CustomEvent('roomListUpdate', { detail }));
      if (is_favorite != null) {
        window.dispatchEvent(new CustomEvent('roomFavouriteUpdate', {
          detail: { roomId, isFavourite: is_favorite },
        }));
      }
    };
    socket.on('roomListUpdate', onRoomListUpdate);
    return () => {
      console.log('[roomListUpdate] Detaching socket listener');
      socket.off('roomListUpdate', onRoomListUpdate);
    };
  }, [currentUserId]);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setDrawerOpen(false); setRoomInfoOpen(false); setProfileDrawerOpen(false); };
    const onOpenRoom = (e) => handleRoomSelectRef.current?.(e.detail);
    const onOpenRoomMessage = (e) => {
      const { room, message } = e.detail || {};
      if (message) pendingScrollMessageRef.current = message;
      handleRoomSelectRef.current?.(room);
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

  const anyRightDrawerOpen = drawerOpen || roomInfoOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen || blockedProfileOpen;

  // Sentinel ref â€” always sits below the last post
  const postsEndRef = React.useRef(null);
  // Track previous room to distinguish room-switch (instant) vs new message (smooth)
  const prevRoomRef = React.useRef(null);

  const handleUnpinMessage = React.useCallback(async (messageId) => {
    const socket = getSocket();
    if (!socket?.connected) {
      toast.error(t('home_view.toast_not_connected'));
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

  const handleOptimisticMessage = React.useCallback(({ content, attachedFile, meta }) => {
    const now = new Date();
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      isOptimistic: true,
      type: 'message',
      user: {
        id: currentUserId,
        name: currentUser?.name ?? currentUser?.username ?? currentUser?.displayName ?? currentUser?.basicInfo?.name ?? '',
        username: `@${currentUser?.email?.split('@')[0] ?? currentUser?.username ?? 'you'}`,
        avatar: currentUserImage,
      },
      content: content ?? '',
      text: content ?? '',
      hashtags: '',
      likes: [],
      stats: { likes: 0, comments: 0, shares: 0 },
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
      image: meta?.image ?? '',
      meta: meta ?? {},
      tags: [],
      roomId: String(activeRoomRef.current?.id ?? ''),
      visibility: roomVisibilityRef.current,
      is_pin: false,
      isPinned: false,
      is_edited: false,
      attachments: attachedFile
        ? [{ url: attachedFile.url, type: attachedFile.type, name: attachedFile.name, size: attachedFile.size }]
        : [],
    };
    setLocalPosts((prev) => [...prev, optimistic]);
  }, [currentUserId, currentUser, currentUserImage]);

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
    setRoomSearchRaw('');
    setRoomSearch('');
    prevScrollHeightRef.current = 0;
    scrollGuardRef.current = false;
    isPrependingRef.current = false;
  };
  handleRoomSelectRef.current = handleRoomSelect;
  activeRoomRef.current = activeRoom;

  React.useEffect(() => {
    const onRoomFollowUpdate = (e) => {
      const { roomId: updatedId, isFollowing, isPending, isCancelledRequest } = e.detail ?? {};
      if (!updatedId) return;
      const currentRoom = activeRoomRef.current;
      if (!currentRoom?.id) return;
      if (String(updatedId) !== String(currentRoom.id)) return;

      if (isFollowing === false && !isPending && !isCancelledRequest) {
        clearActiveRoomState();
      } else {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          if (isCancelledRequest) return { ...prev, is_following: false, is_requested: false };
          if (isPending) return { ...prev, is_requested: true, is_following: false };
          if (isFollowing === true) return { ...prev, is_following: true, is_requested: false };
          return prev;
        });
      }
    };

    window.addEventListener('roomFollowUpdate', onRoomFollowUpdate);
    return () => window.removeEventListener('roomFollowUpdate', onRoomFollowUpdate);
  }, [clearActiveRoomState]);

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

    const messageElement = postsContainerRef.current.querySelector(
      `[data-message-id="${targetMessageId}"]`
    );

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
        isJumpingToMessageRef.current = false;
      });

      setHighlightedMessageId(targetMessageId);
      suppressScrollToBottomRef.current = true;
      setTargetMessageId(null);

      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => setHighlightedMessageId(null), 1800);
    }
  }, [targetMessageId, localPosts]);

  React.useEffect(() => () => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!activeRoom) return;
    if (targetMessageId) return;
    if (isJumpingToMessageRef.current) return;
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
      scrollToBottom(postsContainerRef, postsEndRef, 'auto');
      const raf1 = requestAnimationFrame(() => scrollToBottom(postsContainerRef, postsEndRef, 'auto'));
      const raf2 = requestAnimationFrame(() => { requestAnimationFrame(() => scrollToBottom(postsContainerRef, postsEndRef, 'auto')); });
      const observer = new ResizeObserver(() => {
        if (isJumpingToMessageRef.current) return;
        const container = postsContainerRef.current;
        if (!container) return;
        const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distFromBottom < 300) scrollToBottom(postsContainerRef, postsEndRef, 'auto');
      });
      observer.observe(el);
      const timer = setTimeout(() => observer.disconnect(), 3000);
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); observer.disconnect(); clearTimeout(timer); };
    }
    scrollToBottom(postsContainerRef, postsEndRef, 'smooth');
  }, [activeRoom, localPosts.length, targetMessageId]);

  const postsWithDates = React.useMemo(() => withDateSeparators(localPosts), [localPosts]);

  const enrichedMembers = React.useMemo(() => {
    const raw = messagesQuery.data?.body?.room?.members ?? activeRoom?.members ?? [];
    if (!Array.isArray(raw)) return [];

    const senderMap = new Map();
    localPosts.forEach((p) => {
      const uid = p?.user?.id;
      if (uid) senderMap.set(String(uid), { name: p.user?.name ?? '', avatar: cleanUrl(p.user?.avatar ?? p.user?.image ?? ''), email: p.user?.email ?? '' });
    });

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

  try { console.debug && console.debug('enrichedMembers', enrichedMembers); } catch (e) { }

  const isRoomAdmin = React.useMemo(() => {
    if (!activeRoom || !currentUser) return false;
    const roomFromMessages = messagesQuery.data?.body?.room;
    const userId = String(currentUser._id ?? currentUser.id ?? '');

    // Top-level permission field (some API shapes)
    const rootPermission = String(roomFromMessages?.permission ?? activeRoom.permission ?? '').toLowerCase();
    if (rootPermission === 'admin') return true;

    // Creator check â€” room.createdby matches current user
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

  // Explicit follow state â€” only set for rooms opened from user profile drawer
  const isRoomNotFollowing = activeRoom?.is_following === false;
  const isRoomPending = activeRoom?.is_requested === true;

  const handleFollowToggle = React.useCallback((_roomId, patch) => {
    setActiveRoom((prev) => {
      if (!prev) return prev;
      if (patch?.cancelled) return { ...prev, is_following: false, is_requested: false };
      if (patch?.isPending) return { ...prev, is_requested: true, is_following: false };
      return { ...prev, is_following: !prev.is_following, is_requested: false };
    });
  }, []);

  const canPost = React.useMemo(() => {
    if (isRoomAdmin) return true;
    if (isRoomNotFollowing || isRoomPending) return false; // not a member or pending approval
    const roomFromMessages = messagesQuery.data?.body?.room;
    const members = roomFromMessages?.members ?? activeRoom?.members ?? [];

    // Use root-level permission field from messages API as the primary check
    const rootPermission = String(roomFromMessages?.permission ?? activeRoom?.permission ?? '').toLowerCase();
    if (rootPermission === 'edit' || rootPermission === 'admin') return true;
    if (rootPermission === 'view') return false;

    if (!Array.isArray(members) || !currentUserId) return false;
    const me = members.find((m) => {
      const userObj = typeof m.user === 'object' && m.user !== null ? m.user : null;
      const mId = String(userObj?._id ?? userObj?.id ?? (typeof m.user === 'string' ? m.user : null) ?? m.userId ?? m.id ?? m._id ?? '');
      return mId === currentUserId;
    });
    if (!me) return true; // not yet in list â€” optimistically allow (e.g. owner not listed)
    const status = (me.status ?? 'active').toLowerCase();
    const permission = (me.permission ?? me.role ?? 'view').toLowerCase();
    return status === 'active' && (permission === 'edit' || permission === 'admin');
  }, [isRoomAdmin, isRoomNotFollowing, isRoomPending, activeRoom, currentUserId, messagesQuery.data]);

  // Check if current user is blocked in this room
  const isBlockedInRoom = React.useMemo(() => {
    if (!currentUserId || isRoomAdmin) return false;
    const roomFromMessages = messagesQuery.data?.body?.room;
    const members = roomFromMessages?.members ?? activeRoom?.members ?? [];
    if (!Array.isArray(members)) return false;
    const me = members.find((m) => {
      const userObj = typeof m.user === 'object' && m.user !== null ? m.user : null;
      const mId = String(userObj?._id ?? userObj?.id ?? (typeof m.user === 'string' ? m.user : null) ?? m.userId ?? m.id ?? m._id ?? '');
      return mId === currentUserId;
    });
    return me ? String(me.status ?? '').toLowerCase() === 'blocked' : false;
  }, [currentUserId, isRoomAdmin, activeRoom, messagesQuery.data]);

  // The admin/creator ID to open when the blocked user taps "Follow owner"
  const blockedRoomAdminId = React.useMemo(() => {
    if (!isBlockedInRoom) return null;
    const roomFromMessages = messagesQuery.data?.body?.room;
    return String(roomFromMessages?.createdby ?? activeRoom?.createdby ?? '');
  }, [isBlockedInRoom, activeRoom, messagesQuery.data]);

  // Close blocked profile drawer when room changes
  React.useEffect(() => {
    setBlockedProfileOpen(false);
  }, [activeRoom?.id]);

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
        {/* Two-column row always rendered â€” sidebar stays at the same position in both states */}
        <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden', minHeight: 0 }}>

          {/* Left column â€” room content or empty state */}
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
                  key={activeRoom?.id}
                  room={activeRoom}
                  messagesRoom={messagesQuery.data?.body?.room}
                  enrichedMembers={enrichedMembers}
                  isGarage={activeRoom?.isGarage}
                  isLoading={isLoadingMessages}
                  messages={localPosts}
                  onMessageSelect={handleMessageSelect}
                  isRoomAdmin={isRoomAdmin}
                  onRoomUnfollow={handleActiveRoomUnfollow}
                  onSearchChange={setRoomSearchRaw}
                  isFollowing={activeRoom?.is_following}
                  isPending={isRoomPending}
                  onFollowToggle={handleFollowToggle}
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

                {/* Blocked user overlay — hides all messages */}
                {isBlockedInRoom ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      px: 3,
                      py: 6,
                      bgcolor: '#fff',
                      borderRadius: 3,
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: 'rgba(185,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:forbidden-circle-bold" width={36} style={{ color: '#B90000' }} />
                    </Box>
                    <Box sx={{ textAlign: 'center', maxWidth: 320 }}>
                      <Typography fontSize={16} fontWeight={800} color="#111" mb={0.5}>
                        {t('home_view.blocked_title')}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>
                        {t('home_view.blocked_subtitle')}
                      </Typography>
                    </Box>
                    {blockedRoomAdminId && (
                      <Box
                        onClick={() => setBlockedProfileOpen(true)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(76,78,255,0.08)',
                          border: '1.5px solid rgba(76,78,255,0.2)',
                          color: '#4C4EFF',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 700,
                          transition: 'all 0.15s',
                          '&:hover': { bgcolor: 'rgba(76,78,255,0.14)' },
                        }}
                      >
                        <Iconify icon="solar:user-plus-bold" width={18} />
                        {t('home_view.blocked_follow_owner')}
                      </Box>
                    )}
                  </Box>
                ) : (<>

                  {/* Scrollable posts â€” only this scrolls */}
                  <Box
                    ref={postsContainerRef}
                    onScroll={() => {
                      const el = postsContainerRef.current;
                      if (!el) return;
                      // Reset guard when user scrolls away from top
                      if (el.scrollTop > 80) { scrollGuardRef.current = false; return; }
                      // Near top â€” load older messages
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
                    {/* Skeleton — shown while waiting for fresh data (page 1) */}
                    {(isLoadingMessages || (messagesQuery.isFetching && messagesPage === 1)) && (
                      <MessageSkeleton count={5} />
                    )}

                    {/* Load-more indicator at top when fetching older pages */}
                    {messagesQuery.isFetching && messagesPage > 1 && (
                      <MessageSkeleton count={3} />
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
                              {t('home_view.garage_empty_title')}
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 260, lineHeight: 1.6 }}>
                              {t('home_view.garage_empty_subtitle')}
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
                            {t('home_view.no_messages_title')}
                          </Typography>
                          <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 260 }}>
                            {t('home_view.no_messages_subtitle', { roomName: activeRoom?.name })}
                          </Typography>
                        </Box>
                      )
                    )}

                    {!isLoadingMessages && !(messagesQuery.isFetching && messagesPage === 1) && postsWithDates.map((item) =>
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
                          <PostCard post={item} onCommentClick={handleOpenComments} noAutoFetch canInteract={canPost} />
                        </Box>
                      )
                    )}

                    {/* Sentinel â€” scrollIntoView targets this to reach the bottom */}
                    <div ref={postsEndRef} />
                  </Box>

                  {/* Message input â€” pinned at bottom, never scrolls */}
                  {canPost ? (
                    <ChatInputBar activeRoom={activeRoom} onOptimisticMessage={handleOptimisticMessage} />
                  ) : (() => {
                    let icon = 'solar:lock-bold';
                    let title = t('home_view.view_access_title');
                    let subtitle = t('home_view.view_access_subtitle');
                    if (isRoomPending) {
                      icon = 'solar:clock-circle-bold';
                      title = t('home_view.pending_title');
                      subtitle = t('home_view.pending_subtitle');
                    } else if (isRoomNotFollowing) {
                      icon = 'solar:lock-bold';
                      title = t('home_view.not_following_title');
                      subtitle = null;
                    }
                    return (
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
                          <Iconify icon={icon} width={17} style={{ color: '#4C4EFF' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontSize={13} fontWeight={700} color="#4C4EFF" lineHeight={1.3}>
                            {title}
                          </Typography>
                          {subtitle && (
                            <Typography fontSize={11.5} color="text.secondary" lineHeight={1.3} sx={{ mt: 0.25 }}>
                              {subtitle}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })()}
                </>) /* end isBlockedInRoom ternary */}
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <NoDataIllustration sx={{ mb: 3 }} />
                <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, mb: 1 }}>
                  <Box component="span" sx={{ color: '#4C4EFF' }}>{t('home_view.no_room_title_colored')}</Box>
                  {t('home_view.no_room_title_plain')}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2.5 }}>
                  {t('home_view.no_room_subtitle')}
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
                  {t('home_view.create_room')}
                </Box>
              </Box>
            )}
          </Box>

          {/* Sidebar â€” drawer overlaps this freely; center column above adjusts via mr */}
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

        {/* Blocked user: follow the room owner to regain access */}
        <UserProfileDrawer
          open={blockedProfileOpen}
          onClose={() => setBlockedProfileOpen(false)}
          user={blockedRoomAdminId ? { _id: blockedRoomAdminId } : null}
          onFollowChange={() => {
            // Refetch messages so the blocked status is re-evaluated
            setLocalPosts([]);
            setMessagesPage(1);
            messagesQuery.refetch();
          }}
        />
      </Box>

    </Box >
  );
}


