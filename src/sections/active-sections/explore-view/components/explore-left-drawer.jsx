import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';

export default function ExploreLeftDrawer({ roomsData, activeRoomId, onRoomSelect, onFilterOpen, filterCount = 0 }) {
    const [tab, setTab] = useState('all');

    const TABS = useMemo(
        () => [
            { value: 'all', label: 'All' },
            { value: 'popular', label: 'Popular' },
            { value: 'new', label: 'New' },
            { value: 'friends', label: 'Friends' },
        ],
        []
    );

    const getRoomId = (room) => room?._id ?? room?.id;

    const allRooms = useMemo(() => {
        const inputLists = [
            roomsData?.favourite ?? [],
            roomsData?.other ?? [],
            roomsData?.myRooms ?? [],
            roomsData?.following ?? [],
        ];

        const map = new Map();
        inputLists.flat().forEach((r) => {
            const id = getRoomId(r);
            if (!id) return;
            if (!map.has(id)) map.set(id, r);
        });

        return Array.from(map.values());
    }, [roomsData]);

    const initialFollowingIds = useMemo(() => {
        const ids = new Set();
        (roomsData?.following ?? []).forEach((r) => {
            const id = getRoomId(r);
            if (id) ids.add(id);
        });
        return ids;
    }, [roomsData]);

    const [followingIds, setFollowingIds] = useState(initialFollowingIds);
    const [requestedIds, setRequestedIds] = useState(() => new Set());

    const handleRoomClick = (room) => {
        if (onRoomSelect) onRoomSelect(room);
    };

    const drawerWidth = 420;

    const visibleRooms = useMemo(() => {

        if (tab === 'all') return allRooms;
        if (tab === 'popular') return allRooms;
        if (tab === 'new') return allRooms;
        if (tab === 'friends') return allRooms;
        return allRooms;
    }, [allRooms, tab]);

    return (
        <>
            {/* Floating filter button (same spot as old toggle) */}
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
                aria-label="Open filters"
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
                            <Box component="span" sx={{ color: '#a5b4fc' }}>Explore</Box>
                            {' Rooms'}
                        </Typography>
                        <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
                            Discover and manage your rooms.
                        </Typography>
                        {/* Tabs */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            {TABS.map((t) => (
                                <Button
                                    key={t.value}
                                    variant={tab === t.value ? 'contained' : 'text'}
                                    size="small"
                                    onClick={() => setTab(t.value)}
                                    sx={{
                                        bgcolor: tab === t.value ? '#4C4EFF' : 'transparent',
                                        color: '#fff',
                                        borderRadius: 2,
                                        fontWeight: tab === t.value ? 700 : 500,
                                        fontSize: 13,
                                        px: 2,
                                        py: 0.5,
                                        minWidth: 0,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: tab === t.value ? '#3b3bd6' : 'rgba(255,255,255,0.08)' },
                                    }}
                                >
                                    {t.label}
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
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: 'rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                            },
                            '&:hover::-webkit-scrollbar-thumb': {
                                bgcolor: 'rgba(255,255,255,0.25)',
                            },
                        }}
                    >
                        {visibleRooms.length === 0 ? (
                            <EmptyContent
                                title="No rooms found"
                                description="Try a different tab or adjust your filters."
                                sx={
                                    {
                                        py: 8,
                                        '& h6': { color: '#a5b4fc' },
                                        '& .MuiTypography-body2': { color: '#9e9e9e' },
                                    }
                                }
                            />
                        ) : (
                            <Stack spacing={0.3} sx={{ mb: 2 }}>
                                {visibleRooms.map((room) => {
                                    const roomId = getRoomId(room);
                                    const isActive = activeRoomId === roomId;
                                    const isFollowing = followingIds.has(roomId);
                                    const isRequested = requestedIds.has(roomId);

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
                                            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#4C4EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>
                                                {room.name?.charAt(0).toUpperCase()}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontWeight={600} fontSize={14} noWrap>
                                                    {room.name}
                                                </Typography>
                                            </Box>
                                            <Button
                                                size="small"
                                                variant={isFollowing || isRequested ? 'outlined' : 'contained'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isFollowing) return;
                                                    if (isRequested) {
                                                        setRequestedIds((prev) => {
                                                            const next = new Set(prev);
                                                            next.delete(roomId);
                                                            return next;
                                                        });
                                                        return;
                                                    }
                                                    setRequestedIds((prev) => {
                                                        const next = new Set(prev);
                                                        next.add(roomId);
                                                        return next;
                                                    });
                                                }}
                                                sx={{
                                                    height: 30,
                                                    minWidth: 120,
                                                    px: 1.5,
                                                    borderRadius: 2,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    bgcolor: isFollowing || isRequested ? 'transparent' : '#4C4EFF',
                                                    color: '#fff',
                                                    borderColor: isFollowing || isRequested ? 'rgba(255,255,255,0.25)' : '#4C4EFF',
                                                    '&:hover': {
                                                        bgcolor: isFollowing || isRequested ? 'rgba(255,255,255,0.08)' : '#3b3bd6',
                                                        borderColor: isFollowing || isRequested ? 'rgba(255,255,255,0.35)' : '#3b3bd6',
                                                    },
                                                }}
                                            >
                                                {isFollowing ? 'Following' : isRequested ? 'Cancel request' : 'Follow'}
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
