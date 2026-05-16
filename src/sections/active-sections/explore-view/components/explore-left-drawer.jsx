import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { useCancelRoomRequestMutation, useToggleRoomFollowMutation } from 'src/store/Reducer/rooms-api';
import { useLazyGetExploreRoomListQuery } from 'src/store/Reducer/explore-api';
import RoomAvatar from 'src/components/room-avatar';
import { useTranslate } from 'src/locales';
import { toast } from 'src/components/snackbar';

const PAGE_SIZE = 10;

const TABS = [
    { value: 'all', labelKey: 'explore_drawer.tab_all' },
    { value: 'popular', labelKey: 'explore_drawer.tab_popular' },
    { value: 'new', labelKey: 'explore_drawer.tab_new' },
    { value: 'friends', labelKey: 'explore_drawer.tab_friends' },
];


function RoomRowSkeleton() {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.2 }}>
            <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="65%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.10)' }} />
            </Box>
            <Skeleton variant="rounded" width={90} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.10)', borderRadius: 2 }} />
        </Stack>
    );
}

export default function ExploreLeftDrawer({ activeRoomId, onRoomSelect, onFilterOpen, filterCount = 0, filters = {} }) {
    const [tab, setTab] = useState('all');
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingIds, setLoadingIds] = useState(() => new Set());
    const { t } = useTranslate('common');

    const [fetchRooms] = useLazyGetExploreRoomListQuery();
    const [toggleRoomFollow] = useToggleRoomFollowMutation();
    const [cancelRoomRequest] = useCancelRoomRequestMutation();
    const searchDebounceRef = useRef(null);

    const getRoomId = (room) => room?._id ?? room?.id;

    useEffect(() => {
        const onFollowUpdate = (e) => {
            const { roomId: updatedId, isFollowing, isPending } = e.detail ?? {};
            if (!updatedId) return;
            setRooms((prev) =>
                prev.map((r) =>
                    String(getRoomId(r)) === String(updatedId)
                        ? { ...r, isFollowing, ...(isPending !== undefined ? { isPending } : {}) }
                        : r
                )
            );
        };
        window.addEventListener('roomFollowUpdate', onFollowUpdate);
        return () => window.removeEventListener('roomFollowUpdate', onFollowUpdate);
    }, []);

    const load = React.useCallback(
        (type, extraFilters = {}) => {
            setIsLoading(true);
            fetchRooms({
                type,
                page: 1,
                limit: PAGE_SIZE,
                ...(extraFilters.search ? { search: extraFilters.search } : {}),
                ...(extraFilters.dateCreated ? { dateCreated: extraFilters.dateCreated } : {}),
                ...(extraFilters.memberCount ? { memberCount: extraFilters.memberCount } : {}),
                ...(extraFilters.contentFocus ? { contentFocus: extraFilters.contentFocus } : {}),
            })
                .unwrap()
                .then((data) => setRooms(data.rooms ?? []))
                .catch(() => setRooms([]))
                .finally(() => setIsLoading(false));
        },
        [fetchRooms]
    );

    const buildFilterParams = React.useCallback(
        (search) => ({
            search: search ?? filters.query ?? '',
            dateCreated: filters.date ?? '',
            memberCount: filters.memberCount ?? '',
            contentFocus: filters.contentType ?? '',
        }),
        [filters]
    );

    // Initial load
    useEffect(() => {
        load('all');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch when filters change; debounce the search field
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            load(tab, buildFilterParams());
        }, filters.query ? 400 : 0);
        return () => clearTimeout(searchDebounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.query, filters.date, filters.memberCount, filters.contentType]);

    const handleTabChange = (value) => {
        setTab(value);
        load(value, buildFilterParams());
    };

    const handleRoomClick = (room) => {
        onRoomSelect?.(room);
    };

    const handleCancelRequest = async (room) => {
        const roomId = getRoomId(room);
        if (!roomId || loadingIds.has(roomId)) return;

        setLoadingIds((prev) => { const next = new Set(prev); next.add(roomId); return next; });
        try {
            await cancelRoomRequest(roomId).unwrap();
            toast.success(t('room_channel_header.toast_request_cancelled'));
            setRooms((prev) =>
                prev.map((r) =>
                    getRoomId(r) === roomId ? { ...r, isPending: false, isFollowing: false } : r
                )
            );
            window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: false } }));
        } catch {
            toast.error(t('explore_drawer.toast_cancel_error'));
        } finally {
            setLoadingIds((prev) => { const next = new Set(prev); next.delete(roomId); return next; });
        }
    };

    const handleFollowToggle = async (room) => {
        const roomId = getRoomId(room);
        if (!roomId || loadingIds.has(roomId)) return;

        setLoadingIds((prev) => { const next = new Set(prev); next.add(roomId); return next; });
        try {
            const result = await toggleRoomFollow(roomId).unwrap();
            const msg = result?.message ?? '';
            const isRequestSent = msg.toLowerCase().includes('request') || msg.toLowerCase().includes('sent');

            if (isRequestSent && !room.isFollowing) {
                // Pending request — not yet following
                toast.info(t('room_channel_header.toast_request_sent'));
                setRooms((prev) =>
                    prev.map((r) =>
                        getRoomId(r) === roomId ? { ...r, isFollowing: false, isPending: true } : r
                    )
                );
                window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
            } else {
                // Actual follow/unfollow
                const nextFollowing = !room.isFollowing;
                toast.success(nextFollowing ? t('explore_drawer.toast_followed') : t('explore_drawer.toast_unfollowed'));
                setRooms((prev) =>
                    prev.map((r) =>
                        getRoomId(r) === roomId ? { ...r, isFollowing: nextFollowing, isPending: false } : r
                    )
                );
                window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: nextFollowing, isPending: false } }));
            }
        } catch (err) {
            const errMsg = err?.data?.message ?? err?.message ?? '';
            if (errMsg.toLowerCase().includes('already sent')) {
                setRooms((prev) =>
                    prev.map((r) =>
                        getRoomId(r) === roomId ? { ...r, isFollowing: false, isPending: true } : r
                    )
                );
                toast.info(t('room_channel_header.toast_request_sent'));
                window.dispatchEvent(new CustomEvent('roomFollowUpdate', { detail: { roomId, isFollowing: false, isPending: true } }));
            } else {
                toast.error(t('explore_drawer.toast_update_error'));
            }
        } finally {
            setLoadingIds((prev) => { const next = new Set(prev); next.delete(roomId); return next; });
        }
    };

    const drawerWidth = 420;

    return (
        <>
            {/* Floating filter button */}
            <IconButton
                onClick={onFilterOpen}
                sx={{
                    position: 'fixed',
                    top: 120,
                    left: 88 + drawerWidth - 24,
                    bgcolor: '#4C4EFF',
                    color: '#fff',
                    width: 35,
                    height: 35,
                    zIndex: 1300,
                    boxShadow: 2,
                    borderRadius: '50%',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: '#3739b7' },
                    display: { xs: 'none', md: 'flex' },
                }}
                aria-label={t('explore_drawer.open_filters')}
            >
                <Iconify icon="solar:filter-bold" width={20} />
                {filterCount > 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            minWidth: 17,
                            height: 17,
                            borderRadius: '50%',
                            bgcolor: '#FFD600',
                            color: '#1a1a1a',
                            fontSize: 10,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 0.4,
                            lineHeight: 1,
                            border: '1.5px solid #4C4EFF',
                        }}
                    >
                        {filterCount}
                    </Box>
                )}
            </IconButton>

            {/* Drawer */}
            <Box
                sx={{
                    width: drawerWidth,
                    minWidth: 420,
                    bgcolor: '#18181B',
                    color: '#fff',
                    height: 'calc(100vh - 105px)',
                    position: 'fixed',
                    top: 105,
                    left: 88,
                    zIndex: 1200,
                    boxShadow: '2px 0 16px 0 rgba(0,0,0,0.10)',
                    borderTopRightRadius: 32,
                    overflow: 'hidden',
                    display: { xs: 'none', md: 'block' },
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Fixed header */}
                    <Box sx={{ p: 3, pt: 4, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                            <Box component="span" sx={{ color: '#a5b4fc' }}>{t('explore_drawer.title')}</Box>
                            {' Rooms'}
                        </Typography>
                        <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
                            {t('explore_drawer.subtitle')}
                        </Typography>

                        {/* Tabs */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            {TABS.map((tabItem) => (
                                <Button
                                    key={tabItem.value}
                                    variant={tab === tabItem.value ? 'contained' : 'text'}
                                    size="small"
                                    onClick={() => handleTabChange(tabItem.value)}
                                    sx={{
                                        bgcolor: tab === tabItem.value ? '#4C4EFF' : 'transparent',
                                        color: '#fff',
                                        borderRadius: 2,
                                        fontWeight: tab === tabItem.value ? 700 : 500,
                                        fontSize: 13,
                                        px: 2,
                                        py: 0.5,
                                        minWidth: 0,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: tab === tabItem.value ? '#3b3bd6' : 'rgba(255,255,255,0.08)' },
                                    }}
                                >
                                    {t(tabItem.labelKey)}
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                    {/* Scrollable room list */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 3,
                            pb: 3,
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                            '&::-webkit-scrollbar': { width: '3px' },
                            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '10px' },
                            '&:hover::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                    >
                        {isLoading ? (
                            <Stack spacing={0.3}>
                                {Array.from({ length: 6 }).map((_, i) => <RoomRowSkeleton key={i} />)}
                            </Stack>
                        ) : rooms.length === 0 ? (
                            <EmptyContent
                                title={t('explore_drawer.no_rooms')}
                                description={t('explore_drawer.no_rooms_subtitle')}
                                sx={{
                                    py: 8,
                                    '& h6': { color: '#a5b4fc' },
                                    '& .MuiTypography-body2': { color: '#9e9e9e' },
                                }}
                            />
                        ) : (
                            <Stack spacing={0.3} sx={{ mb: 2 }}>
                                {rooms.map((room) => {
                                    const roomId = getRoomId(room);
                                    const isActive = activeRoomId === roomId;
                                    const isFollowing = room.isFollowing;
                                    const isPending = room.isPending;
                                    const isLoadingFollow = loadingIds.has(roomId);

                                    let btnLabel = t('explore_drawer.btn_follow');
                                    let btnBg = '#4C4EFF';
                                    let btnBorder = '#4C4EFF';
                                    let btnVariant = 'contained';
                                    if (isLoadingFollow) {
                                        btnLabel = null;
                                    } else if (isPending) {
                                        btnLabel = t('explore_drawer.btn_request_sent');
                                        btnBg = 'transparent';
                                        btnBorder = 'rgba(255,193,7,0.6)';
                                        btnVariant = 'outlined';
                                    } else if (isFollowing) {
                                        btnLabel = t('explore_drawer.btn_following');
                                        btnBg = 'transparent';
                                        btnBorder = 'rgba(255,255,255,0.25)';
                                        btnVariant = 'outlined';
                                    }

                                    return (
                                        <Stack
                                            key={roomId}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                            sx={{
                                                p: 1.2,
                                                cursor: 'pointer',
                                                borderRadius: 2,
                                                bgcolor: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                                                border: isActive ? '2px solid #4C4EFF' : '2px solid transparent',
                                                transition: 'all 0.18s',
                                                '&:hover': { bgcolor: isActive ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.08)' },
                                            }}
                                            onClick={() => handleRoomClick(room)}
                                        >
                                            <RoomAvatar image={room.image} name={room.name} size={36} />

                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontWeight={600} fontSize={14} noWrap>
                                                    {room.name}
                                                </Typography>
                                            </Box>

                                            <Button
                                                size="small"
                                                variant={btnVariant}
                                                disabled={isLoadingFollow}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPending) handleCancelRequest(room);
                                                    else handleFollowToggle(room);
                                                }}
                                                sx={{
                                                    height: 30,
                                                    minWidth: 100,
                                                    px: 1.5,
                                                    borderRadius: 2,
                                                    fontWeight: 700,
                                                    fontSize: isPending ? 11 : 13,
                                                    textTransform: 'none',
                                                    bgcolor: btnBg,
                                                    color: isPending ? '#FFC107' : '#fff',
                                                    borderColor: btnBorder,
                                                    '&:hover': {
                                                        bgcolor: isPending
                                                            ? 'rgba(255,193,7,0.08)'
                                                            : isFollowing ? 'rgba(255,255,255,0.08)' : '#3b3bd6',
                                                        borderColor: btnBorder,
                                                    },
                                                    '&.Mui-disabled': { opacity: 0.6 },
                                                }}
                                            >
                                                {isLoadingFollow
                                                    ? <CircularProgress size={14} sx={{ color: isPending ? '#FFC107' : '#fff' }} />
                                                    : btnLabel
                                                }
                                            </Button>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>

        </>
    );
}
