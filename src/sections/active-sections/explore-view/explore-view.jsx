import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import NoDataIllustration from 'src/assets/illustrations/no-data-illustration';
import ExplorePostCard from './components/explore-post-card';
import CommentDrawer from 'src/sections/active-sections/home-view/components/comment-drawer';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import { posts as MOCK_POSTS, commentsData } from 'src/sections/active-sections/home-view/mock';
import ExploreFilter from './components/explore-filter';
import ExploreRoomHeader from './components/explore-room-header';
import { MOCK_ROOMS } from './mock';
import ExploreLeftDrawer from './components/explore-left-drawer';
import { roomsData } from 'src/sections/active-sections/home-view/data';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';


const DRAWER_WIDTH = 420;

const DEFAULT_FILTERS = { query: '', date: null, memberCount: null, contentType: null };
const countActiveFilters = (f) => Object.values(f).filter(Boolean).length;

// ── ExploreView ───────────────────────────────────────────────────────────────
export default function ExploreView() {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
    const postsEndRef = useRef(null);

    useEffect(() => {
        const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
        const onAccountOpened = () => { setFilterDrawerOpen(false); setCommentDrawerOpen(false); setSelectedPost(null); setProfileDrawerOpen(false); };
        const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
        const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
        const onOpenRoom = (e) => {
            setSelectedRoom(e.detail);
            setProfileDrawerOpen(false);
        };
        const onCloseComment = () => {
            setCommentDrawerOpen(false);
            setSelectedPost(null);
        };
        const onCloseFilter = () => {
            setFilterDrawerOpen(false);
        };
        window.addEventListener('accountDrawerChange', onAccountChange);
        window.addEventListener('accountDrawerOpened', onAccountOpened);
        window.addEventListener('profileDrawerChange', onProfileChange);
        window.addEventListener('notificationsDrawerChange', onNotificationsChange);
        window.addEventListener('openRoom', onOpenRoom);
        window.addEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
        window.addEventListener(DRAWER_EVENTS.filterClose, onCloseFilter);
        return () => {
            window.removeEventListener('accountDrawerChange', onAccountChange);
            window.removeEventListener('accountDrawerOpened', onAccountOpened);
            window.removeEventListener('profileDrawerChange', onProfileChange);
            window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
            window.removeEventListener('openRoom', onOpenRoom);
            window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
            window.removeEventListener(DRAWER_EVENTS.filterClose, onCloseFilter);
        };
    }, []);

    const mockRooms = MOCK_ROOMS;

    const handleRoomSelect = (room) => {
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

    const closeCommentDrawer = () => {
        setCommentDrawerOpen(false);
        setSelectedPost(null);
    };

    const handleFilterChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
    const handleClearAll = () => setFilters(DEFAULT_FILTERS);
    const filterCount = countActiveFilters(filters);
    const activeFilter = filterCount > 0;

    // Enforce "only one right drawer at a time" (same behavior as Home)
    useEffect(() => {
        if (filterDrawerOpen) {
            setCommentDrawerOpen(false);
            setSelectedPost(null);
        }
    }, [filterDrawerOpen]);

    useEffect(() => {
        if (commentDrawerOpen) {
            setFilterDrawerOpen(false);
        }
    }, [commentDrawerOpen]);

    // Scroll to bottom when room changes
    useEffect(() => {
        if (selectedRoom) {
            setTimeout(() => postsEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
        }
    }, [selectedRoom?._id ?? selectedRoom?.id]);

    const selectedRoomState = selectedRoom
        ? mockRooms.find((r) => r._id === selectedRoom._id) ?? selectedRoom
        : null;

    const leftDrawerWidth = DRAWER_WIDTH;
    const anyRightDrawerOpen = filterDrawerOpen || commentDrawerOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
    const contentRightOffset = anyRightDrawerOpen ? 420 : 0;

    return (
        <Box
            sx={{
                flexGrow: 1,
                bgcolor: '#f4f5f9',
                height: 'calc(100vh - 105px)',
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            {/* ── LeftDrawer from Home ── */}
            <ExploreLeftDrawer
                roomsData={roomsData}
                activeRoomId={selectedRoom?._id ?? selectedRoom?.id}
                onRoomSelect={handleRoomSelect}
                onFilterOpen={openFilterDrawer}
                filterCount={filterCount}
            />

            {/* ── Main content ── */}
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
                {/* Floating filter button always visible */}
                {false && (
                    <IconButton
                        size="large"
                        onClick={() => setFilterDrawerOpen(true)}
                        sx={{
                            position: 'fixed',
                            top: 130,
                            right: filterDrawerOpen ? 420 + 24 : 40,
                            zIndex: 1202,
                            bgcolor: filterDrawerOpen || activeFilter ? 'rgba(76,78,255,0.12)' : '#fff',
                            color: filterDrawerOpen || activeFilter ? '#4C4EFF' : '#222',
                            border: '1.5px solid #e0e0e0',
                            boxShadow: 2,
                            borderRadius: 2.5,
                            width: 48,
                            height: 48,
                            transition: 'all 0.18s',
                            '&:hover': { bgcolor: 'rgba(76,78,255,0.18)' },
                        }}
                        aria-label="Open filters"
                    >
                        <Iconify icon="solar:filter-bold" width={24} />
                        {activeFilter && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    width: 9,
                                    height: 9,
                                    borderRadius: '50%',
                                    bgcolor: '#4C4EFF',
                                }}
                            />
                        )}
                    </IconButton>
                )}

                {selectedRoomState ? (
                    /* ── Room detail view ── */
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            mr: contentRightOffset ? { md: `${contentRightOffset}px` } : 0,
                            transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
                        }}
                    >
                        {/* Shared container for header and posts, matches HomeView */}
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0,
                                minHeight: 0,
                                flex: 1,
                            }}
                        >
                            {/* Header */}
                            <ExploreRoomHeader
                                room={selectedRoomState}
                                isFollowing={selectedRoomState.isFollowing}
                                isPending={selectedRoomState.isPending}
                                onFollowToggle={() => { }}
                            />

                            {/* Scrollable posts */}
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
                                {MOCK_POSTS.map((item, index) =>
                                    item.type === 'date' ? (
                                        <OldMessagesLabel key={index} label={item.label} />
                                    ) : (
                                        <ExplorePostCard
                                            key={item.id}
                                            post={item}
                                            onCommentClick={() => openCommentDrawer(item)}
                                        />
                                    )
                                )}
                                <div ref={postsEndRef} />
                            </Box>
                        </Box>

                        {/* Disabled input — join to participate */}
                        <Box
                            sx={{
                                flexShrink: 0,
                                mt: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: '#f4f5f9',
                                border: '1px solid #e8e8e8',
                                borderRadius: 3,
                                px: 1.5,
                                py: 0.75,
                            }}
                        >
                            <Iconify icon="solar:lock-bold" width={18} style={{ color: '#bdbdbd', flexShrink: 0 }} />
                            <Typography fontSize={13} color="text.disabled" sx={{ flex: 1 }}>
                                {selectedRoomState.isFollowing
                                    ? 'You are now following this room — switch to Home to post'
                                    : 'Follow this room to join the conversation'}
                            </Typography>
                            <IconButton
                                disabled
                                size="small"
                                sx={{
                                    flexShrink: 0,
                                    bgcolor: '#c5c6ff',
                                    color: '#fff',
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
                                }}
                            >
                                <Iconify icon="mingcute:send-line" width={18} />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    /* ── Empty state ── */
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mr: contentRightOffset ? { md: `${contentRightOffset}px` } : 0,
                            transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
                        }}
                    >
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

                {/* Comment drawer */}
                <CommentDrawer
                    open={commentDrawerOpen}
                    onClose={closeCommentDrawer}
                    selectedPost={selectedPost}
                    commentsData={commentsData}
                />

                {/* Filter drawer (right) */}
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
                    <DrawerHeader title="Filter" onBack={closeFilterDrawer} showEdit={false} showShare={false} />
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
