import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { scrollToBottom } from 'src/utils/scroll-to-bottom';
import { cleanUrl, withDateSeparators } from 'src/utils/message-utils';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { selectUser } from 'src/store/slices/userSlice';
import NoDataIllustration from 'src/assets/illustrations/no-data-illustration';
import ExplorePostCard from './components/explore-post-card';
import CommentDrawer from 'src/sections/active-sections/home-view/components/comment-drawer';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import ChatInputBar from 'src/sections/active-sections/home-view/components/chat-input-bar';
import ExploreFilter from './components/explore-filter';
import ExploreRoomHeader from './components/explore-room-header';
import ExploreLeftDrawer from './components/explore-left-drawer';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';
import { useGetRoomMessagesQuery, useLazyGetRoomByIdQuery } from 'src/store/Reducer/rooms-api';
import MessageSkeleton from 'src/sections/active-sections/home-view/components/message-skeleton';
import { useTranslate } from 'src/locales';

const DRAWER_WIDTH = 420;
const MESSAGES_LIMIT = 10;
const DEFAULT_FILTERS = { query: '', date: null, memberCount: null, contentType: null };
const countActiveFilters = (f) => Object.values(f).filter(Boolean).length;


// â”€â”€ ExploreView â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ExploreView() {
    const currentUser = useSelector(selectUser);
    const currentUserId = String(currentUser?.id ?? currentUser?._id ?? currentUser?.basicInfo?._id ?? '');
    const currentUserImage = currentUser?.photoURL ?? currentUser?.image ?? currentUser?.basicInfo?.image ?? currentUser?.avatar ?? '';
    const { t } = useTranslate('common');

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

    const [localPosts, setLocalPosts] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);

    const postsContainerRef = useRef(null);
    const postsEndRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const isPrependingRef = useRef(false);
    const isInitialLoadRef = useRef(false);
    const prevRoomRef = useRef(null);
    const scrollGuardRef = useRef(false);
    const selectedRoomRef = useRef(null);
    selectedRoomRef.current = selectedRoom;

    const roomId = selectedRoom?._id ?? selectedRoom?.id ?? null;

    // Fetch messages for selected room
    const messagesQuery = useGetRoomMessagesQuery(
        { roomId, page: messagesPage, limit: MESSAGES_LIMIT },
        { skip: !roomId, refetchOnMountOrArgChange: true }
    );

    // Fetch full room details (for member permission check)
    const [fetchRoomById, { data: roomDetailData }] = useLazyGetRoomByIdQuery();
    const roomDetail = roomDetailData?.body?.room ?? roomDetailData?.room ?? roomDetailData?.body ?? roomDetailData;

    const normalizeMessage = useCallback((msg) => {
        const senderId = msg.senderId ?? msg.sender?._id ?? msg.sender?.id ?? '';
        const isCurrentUser = currentUserId && String(senderId) === currentUserId;
        const avatar = cleanUrl(msg.senderImage ?? msg.sender?.image ?? (isCurrentUser ? currentUserImage : '') ?? '');
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
            visibility: msg.visibility?.toLowerCase() ?? selectedRoom?.visibility ?? null,
            is_pin: !!(msg.is_pin ?? msg.isPinned),
            isPinned: !!(msg.is_pin ?? msg.isPinned),
            is_edited: !!msg.is_edited,
            attachments: Array.isArray(msg.attachments)
                ? msg.attachments.map((att) => ({
                    url: att.fileUrl ?? att.url ?? '',
                    type: att.fileType ?? att.type ?? '',
                    name: att.originalFileName ?? att.fileName ?? att.name ?? '',
                    size: att.size ?? 0,
                }))
                : [],
        };
    }, [currentUserId, currentUserImage, selectedRoom?.visibility]);

    // Populate messages when API responds
    useEffect(() => {
        if (!messagesQuery.isSuccess || messagesQuery.isFetching) return;
        const raw = messagesQuery.data?.body?.messages ?? [];
        const normalized = [...raw].reverse().map((msg) => normalizeMessage(msg));
        setHasMoreMessages(raw.length >= MESSAGES_LIMIT);
        if (messagesPage === 1) {
            isPrependingRef.current = false;
            isInitialLoadRef.current = true;
            setLocalPosts(normalized);
            setIsLoadingMessages(false);
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

    // Restore scroll position after prepending older messages
    useLayoutEffect(() => {
        if (prevScrollHeightRef.current > 0 && postsContainerRef.current) {
            const el = postsContainerRef.current;
            el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
        }
    }, [localPosts]);

    // Scroll to bottom: instant on room switch or initial load, smooth on new message.
    // Mirrors home-view exactly â€” isInitialLoadRef is set by the populate effect (page 1)
    // and consumed here; no other signals needed.
    useEffect(() => {
        if (!selectedRoom) return;
        if (isPrependingRef.current) {
            isPrependingRef.current = false;
            return;
        }
        const roomChanged = selectedRoom !== prevRoomRef.current;
        prevRoomRef.current = selectedRoom;
        const isInitial = isInitialLoadRef.current;
        isInitialLoadRef.current = false;
        const el = postsContainerRef.current;
        if (!el) return;
        if (roomChanged || isInitial) {
            scrollToBottom(postsContainerRef, postsEndRef, 'auto');
            const raf1 = requestAnimationFrame(() => scrollToBottom(postsContainerRef, postsEndRef, 'auto'));
            const raf2 = requestAnimationFrame(() => { requestAnimationFrame(() => scrollToBottom(postsContainerRef, postsEndRef, 'auto')); });
            const observer = new ResizeObserver(() => {
                const container = postsContainerRef.current;
                if (!container) return;
                const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
                if (distFromBottom < 300) scrollToBottom(postsContainerRef, postsEndRef, 'auto');
            });
            if (el) observer.observe(el);
            const timer = setTimeout(() => observer.disconnect(), 3000);
            return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); observer.disconnect(); clearTimeout(timer); };
        }
        scrollToBottom(postsContainerRef, postsEndRef, 'smooth');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoom, localPosts.length]);

    // When room changes â€” reset and start loading
    const prevRoomIdRef = useRef(null);
    useEffect(() => {
        if (!roomId) {
            setLocalPosts([]);
            setIsLoadingMessages(false);
            setMessagesPage(1);
            setHasMoreMessages(false);
            prevScrollHeightRef.current = 0;
            isPrependingRef.current = false;
            isInitialLoadRef.current = false;
            prevRoomRef.current = null;
            return;
        }
        if (roomId === prevRoomIdRef.current) return;
        prevRoomIdRef.current = roomId;
        setMessagesPage(1);
        setHasMoreMessages(false);
        scrollGuardRef.current = false;
        prevScrollHeightRef.current = 0;
        isPrependingRef.current = false;
        fetchRoomById(roomId);
    }, [roomId, fetchRoomById]);

    // Determine if current user can post
    const currentUserMember = useMemo(() => {
        const members = roomDetail?.members ?? [];
        return members.find((m) => {
            const userObj = typeof m.user === 'object' && m.user !== null ? m.user : null;
            const mId = userObj?._id ?? userObj?.id ?? (typeof m.user === 'string' ? m.user : null) ?? m.userId ?? m.id ?? m._id ?? '';
            return String(mId) === currentUserId;
        }) ?? null;
    }, [roomDetail, currentUserId]);

    const canPost = useMemo(() => {
        if (!selectedRoom?.isFollowing) return false;
        if (!currentUserMember) return false;
        const status = (currentUserMember.status ?? 'active').toLowerCase();
        const permission = (currentUserMember.permission ?? currentUserMember.role ?? 'view').toLowerCase();
        return status === 'active' && (permission === 'edit' || permission === 'admin');
    }, [selectedRoom?.isFollowing, currentUserMember]);

    const postsWithDates = useMemo(() => withDateSeparators(localPosts), [localPosts]);

    useEffect(() => {
        const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
        const onAccountOpened = () => { setFilterDrawerOpen(false); setCommentDrawerOpen(false); setSelectedPost(null); setProfileDrawerOpen(false); };
        const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
        const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
        const onOpenRoom = (e) => {
            const incomingId = e.detail?._id ?? e.detail?.id;
            const current = selectedRoomRef.current;
            const currentId = current?._id ?? current?.id;
            if (incomingId && incomingId === currentId) return;
            isPrependingRef.current = false;
            prevScrollHeightRef.current = 0;
            scrollGuardRef.current = false;
            setIsLoadingMessages(true);
            setLocalPosts([]);
            setMessagesPage(1);
            setHasMoreMessages(false);
            setSelectedRoom(e.detail);
            setProfileDrawerOpen(false);
        };
        const onCloseComment = () => { setCommentDrawerOpen(false); setSelectedPost(null); };
        const onCloseFilter = () => setFilterDrawerOpen(false);
        const onRoomFollowUpdate = (e) => {
            const { roomId: updatedId, isFollowing, isPending } = e.detail ?? {};
            if (!updatedId) return;
            setSelectedRoom((prev) => {
                if (!prev) return prev;
                const id = prev._id ?? prev.id;
                if (String(id) !== String(updatedId)) return prev;
                return {
                    ...prev,
                    isFollowing: isFollowing ?? prev.isFollowing,
                    isPending: isPending !== undefined ? isPending : prev.isPending,
                };
            });
        };
        window.addEventListener('accountDrawerChange', onAccountChange);
        window.addEventListener('accountDrawerOpened', onAccountOpened);
        window.addEventListener('profileDrawerChange', onProfileChange);
        window.addEventListener('notificationsDrawerChange', onNotificationsChange);
        window.addEventListener('openRoom', onOpenRoom);
        window.addEventListener('roomFollowUpdate', onRoomFollowUpdate);
        window.addEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
        window.addEventListener(DRAWER_EVENTS.filterClose, onCloseFilter);
        return () => {
            window.removeEventListener('accountDrawerChange', onAccountChange);
            window.removeEventListener('accountDrawerOpened', onAccountOpened);
            window.removeEventListener('profileDrawerChange', onProfileChange);
            window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
            window.removeEventListener('openRoom', onOpenRoom);
            window.removeEventListener('roomFollowUpdate', onRoomFollowUpdate);
            window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
            window.removeEventListener(DRAWER_EVENTS.filterClose, onCloseFilter);
        };
    }, []);

    const handleRoomSelect = (room) => {
        const incomingId = room?._id ?? room?.id;
        const currentId = selectedRoom?._id ?? selectedRoom?.id;
        if (incomingId && incomingId === currentId) return;
        isPrependingRef.current = false;
        prevScrollHeightRef.current = 0;
        scrollGuardRef.current = false;
        setIsLoadingMessages(true);
        setLocalPosts([]);
        setMessagesPage(1);
        setHasMoreMessages(false);
        setSelectedRoom(room);
    };

    const openFilterDrawer = () => {
        setCommentDrawerOpen(false);
        setSelectedPost(null);
        setFilterDrawerOpen(true);
        closeOverlayDrawers();
    };

    const closeFilterDrawer = () => setFilterDrawerOpen(false);

    const openCommentDrawer = (post) => {
        setFilterDrawerOpen(false);
        setSelectedPost(post);
        setCommentDrawerOpen(true);
        closeOverlayDrawers();
    };

    const closeCommentDrawer = () => { setCommentDrawerOpen(false); setSelectedPost(null); };

    const handleFilterChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
    const handleClearAll = () => setFilters(DEFAULT_FILTERS);
    const filterCount = countActiveFilters(filters);

    useEffect(() => { if (filterDrawerOpen) { setCommentDrawerOpen(false); setSelectedPost(null); } }, [filterDrawerOpen]);
    useEffect(() => { if (commentDrawerOpen) setFilterDrawerOpen(false); }, [commentDrawerOpen]);

    const handleFollowToggle = (roomId, patch = {}) => {
        setSelectedRoom((prev) => {
            if (!prev) return prev;
            const id = prev._id ?? prev.id;
            if (String(id) !== String(roomId)) return prev;
            if (patch.cancelled) return { ...prev, isFollowing: false, isPending: false };
            if (patch.isPending) return { ...prev, isPending: true };
            return { ...prev, isFollowing: !prev.isFollowing, isPending: false };
        });
        // Refetch room details so member status/permission is up-to-date from backend
        fetchRoomById(roomId);
    };

    const leftDrawerWidth = DRAWER_WIDTH;
    const anyRightDrawerOpen = filterDrawerOpen || commentDrawerOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
    const contentRightOffset = anyRightDrawerOpen ? 420 : 0;

    // The active room shape ChatInputBar expects
    const activeRoomForInput = useMemo(() => selectedRoom
        ? { id: roomId, name: selectedRoom.name ?? '', visibility: selectedRoom.visibility ?? 'public' }
        : null,
        [selectedRoom, roomId]);

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden' }}>

            <ExploreLeftDrawer
                activeRoomId={selectedRoom?._id ?? selectedRoom?.id}
                onRoomSelect={handleRoomSelect}
                onFilterOpen={openFilterDrawer}
                filterCount={filterCount}
                filters={filters}
            />

            {/* â”€â”€ Main content â”€â”€ */}
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
                    transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1), margin-right 0.3s cubic-bezier(.4,0,.2,1)',
                    marginLeft: { md: `${leftDrawerWidth}px`, xs: 0 },
                    position: 'relative',
                }}
            >
                {selectedRoom ? (
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: { md: 950 }, ml: { md: 5 }, mr: { md: contentRightOffset ? `${contentRightOffset}px` : 0 }, transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1), margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0, flex: 1 }}>
                            {/* Header */}
                            <ExploreRoomHeader
                                room={selectedRoom}
                                isFollowing={selectedRoom.isFollowing}
                                isPending={selectedRoom.isPending}
                                onFollowToggle={handleFollowToggle}
                                isLoading={isLoadingMessages}
                            />

                            {/* Messages */}
                            <Box
                                ref={postsContainerRef}
                                onScroll={() => {
                                    const el = postsContainerRef.current;
                                    if (!el) return;
                                    if (el.scrollTop > 80) { scrollGuardRef.current = false; return; }
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
                                {messagesQuery.isFetching && messagesPage > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                        <CircularProgress size={22} sx={{ color: '#4C4EFF' }} />
                                    </Box>
                                )}
                                {isLoadingMessages ? (
                                    <MessageSkeleton count={5} />
                                ) : localPosts.length === 0 && messagesQuery.isSuccess && !messagesQuery.isFetching ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 1.5 }}>
                                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(76,78,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Iconify icon="solar:chat-line-bold-duotone" width={32} style={{ color: '#4C4EFF' }} />
                                        </Box>
                                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{t('explore_view.no_messages_title')}</Typography>
                                        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 260 }}>
                                            {t('explore_view.no_messages_subtitle', { roomName: selectedRoom.name })}
                                        </Typography>
                                    </Box>
                                ) : (
                                    postsWithDates.map((item) =>
                                        item.type === 'date' ? (
                                            <OldMessagesLabel key={item.id} label={item.label} />
                                        ) : (
                                            <ExplorePostCard
                                                key={item.id}
                                                post={item}
                                                onCommentClick={() => openCommentDrawer(item)}
                                            />
                                        )
                                    )
                                )}
                                <div ref={postsEndRef} />
                            </Box>
                        </Box>

                        {/* Input bar or locked state */}
                        {canPost ? (
                            <ChatInputBar activeRoom={activeRoomForInput} />
                        ) : (() => {
                            const isFollowing = selectedRoom.isFollowing;
                            const memberStatus = (currentUserMember?.status ?? '').toLowerCase();
                            const memberPermission = (currentUserMember?.permission ?? currentUserMember?.role ?? '').toLowerCase();
                            const isPending = selectedRoom.isPending || (isFollowing && (!currentUserMember || memberStatus === 'pending'));
                            const isViewOnly = isFollowing && memberStatus === 'active' && memberPermission === 'view';

                            let icon = 'solar:lock-bold';
                            let title = t('explore_view.not_following_title');
                            let subtitle = null;

                            if (isPending) {
                                icon = 'solar:clock-circle-bold';
                                title = t('explore_view.pending_title');
                                subtitle = t('explore_view.pending_subtitle');
                            } else if (isViewOnly) {
                                icon = 'solar:eye-bold';
                                title = t('explore_view.view_access_title');
                                subtitle = t('explore_view.view_access_subtitle');
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
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, mr: contentRightOffset ? { md: `${contentRightOffset}px` } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
                        <NoDataIllustration sx={{ mb: 1 }} />
                        <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
                            <Box component="span" sx={{ color: '#4C4EFF' }}>Explore</Box>
                            {' Rooms'}
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Click any room on the left to preview its posts
                        </Typography>
                    </Box>
                )}

                <CommentDrawer
                    open={commentDrawerOpen}
                    onClose={closeCommentDrawer}
                    selectedPost={selectedPost}
                    commentsData={[]}
                    locked={!canPost}
                />

                <Drawer
                    anchor="right"
                    open={filterDrawerOpen}
                    onClose={closeFilterDrawer}
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
                        },
                    }}
                >
                    <DrawerHeader title={t('explore_filter.title')} onBack={closeFilterDrawer} showEdit={false} showShare={false} />
                    <ExploreFilter
                        filters={filters}
                        onChange={handleFilterChange}
                        onClearAll={handleClearAll}
                        showHeader={false}
                    />
                </Drawer>
            </Box>
        </Box>
    );
}


