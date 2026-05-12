import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import { useRef, useState, useEffect, useCallback } from 'react';
import { closeOverlayDrawers } from 'src/utils/drawer-events';

import { Iconify } from 'src/components/iconify';

const PAGE_SIZE = 8;

// type: 'rooms' | 'friends' | 'following'
const LABELS = {
    rooms: { default: 'Follow', requested: 'Cancel request', active: 'Following' },
    following: { default: 'Follow', requested: 'Cancel request', active: 'Following' },
    friends: { default: 'Add', requested: 'Cancel request', active: 'Friends' },
};

export default function ViewAllModal({
    open,
    onClose,
    title,
    type = 'rooms',
    data = [],
    onImport,
    onExport,
    search = '',
    setSearch,
    showImportExport = false,
    renderItem,
    hasMore = false,
    isLoading = false,
    onLoadMore,
}) {
    const fileInputRef = useRef();
    const listRef = useRef(null);
    const [itemStates, setItemStates] = useState({});
    const [page, setPage] = useState(1);

    // Stable refs so the scroll handler never goes stale
    const stateRef = useRef({});
    const onLoadMoreRef = useRef(onLoadMore);
    useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);

    useEffect(() => {
        if (open) {
            setPage(1);
            setItemStates({});
            // Scroll list back to top when reopened
            if (listRef.current) listRef.current.scrollTop = 0;
        }
    }, [open]);

    // Reset to first batch when search changes
    useEffect(() => {
        setPage(1);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [search]);

    const filtered = data.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
    );

    stateRef.current = { page, hasMore, isLoading, filteredLength: filtered.length };

    const displayItems = filtered.slice(0, page * PAGE_SIZE);

    // Stable scroll handler — reads latest values via ref
    const handleScroll = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight > 60) return;

        const { page: p, hasMore: hm, isLoading: loading, filteredLength } = stateRef.current;
        if (p * PAGE_SIZE < filteredLength) {
            setPage((prev) => prev + 1);
        } else if (hm && !loading) {
            onLoadMoreRef.current?.();
        }
    }, []);

    const cycleItem = (key) =>
        setItemStates((prev) => {
            const cur = prev[key];
            const next = cur === undefined ? 'requested' : cur === 'requested' ? 'active' : undefined;
            return { ...prev, [key]: next };
        });

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'data'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        if (onExport) onExport();
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (onImport) onImport(imported);
            } catch {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const labels = LABELS[type] || LABELS.rooms;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #f0f0f0' }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4C4EFF' }} />
                        <Typography variant="h6" fontWeight={800} fontSize={18}>
                            {title}
                        </Typography>
                        <Box sx={{ ml: 0.5, px: 1.2, py: 0.2, borderRadius: 10, bgcolor: 'rgba(76,78,255,0.08)' }}>
                            <Typography fontSize={12} fontWeight={700} color="#4C4EFF">
                                {filtered.length}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#ebebeb' } }}>
                        <Iconify icon="mingcute:close-line" width={18} />
                    </IconButton>
                </Stack>

                {/* Search */}
                <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                    <InputBase
                        fullWidth
                        placeholder={`Search ${title?.toLowerCase() || 'items'}…`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            bgcolor: '#f7f8fa',
                            borderRadius: 3,
                            px: 2,
                            py: 1,
                            fontSize: 14,
                            border: '1.5px solid #ebebeb',
                            '&:focus-within': { borderColor: '#4C4EFF', bgcolor: '#fff' },
                            transition: 'all 0.15s',
                        }}
                        startAdornment={
                            <Iconify icon="eva:search-fill" width={18} sx={{ color: '#aaa', mr: 1.2, flexShrink: 0 }} />
                        }
                        endAdornment={
                            search ? (
                                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.3 }}>
                                    <Iconify icon="mingcute:close-line" width={14} sx={{ color: '#aaa' }} />
                                </IconButton>
                            ) : null
                        }
                    />
                </Box>

                {/* Import / Export (optional) */}
                {showImportExport && (
                    <Stack direction="row" spacing={1.5} sx={{ px: 3, pb: 1.5 }}>
                        <Button variant="outlined" size="small" onClick={handleImportClick}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#ddd' }}>
                            Import
                        </Button>
                        <Button variant="outlined" size="small" onClick={handleExport}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#ddd' }}>
                            Export
                        </Button>
                        <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
                    </Stack>
                )}

                {/* Scrollable list */}
                <Box
                    ref={listRef}
                    onScroll={handleScroll}
                    sx={{
                        px: 2,
                        pb: 2,
                        maxHeight: 420,
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#e0e0e0 transparent',
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: '10px' },
                    }}
                >
                    {filtered.length === 0 ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6, gap: 1 }}>
                            <Iconify icon="solar:inbox-line-duotone" width={44} sx={{ color: '#ccc' }} />
                            <Typography color="text.secondary" fontSize={14}>No results found.</Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={0.5}>
                            {displayItems.map((item, i) => {
                                if (renderItem) return renderItem(item, i);

                                const key = `item-${i}`;
                                const state = itemStates[key];
                                const btnLabel = state === 'active' ? labels.active : state === 'requested' ? labels.requested : labels.default;
                                const isActive = state === 'active';
                                const isRequested = state === 'requested';

                                const handleClick = () => {
                                    if (type === 'friends') {
                                        window.dispatchEvent(new CustomEvent('openUserProfile', { detail: { name: item.name, avatar: item.icon || item.avatar } }));
                                        onClose();
                                    } else {
                                        window.dispatchEvent(new CustomEvent('openRoom', { detail: item }));
                                        closeOverlayDrawers();
                                        onClose();
                                    }
                                };

                                return (
                                    <Stack
                                        key={key}
                                        direction="row"
                                        spacing={1.5}
                                        alignItems="center"
                                        onClick={handleClick}
                                        sx={{
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 2.5,
                                            cursor: 'pointer',
                                            transition: 'background 0.12s',
                                            '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' },
                                            '&:hover .item-name': { color: '#4C4EFF' },
                                        }}
                                    >
                                        <Avatar
                                            src={item.icon || item.avatar || undefined}
                                            sx={{ width: 42, height: 42, bgcolor: '#4C4EFF', flexShrink: 0, fontSize: 15, fontWeight: 700 }}
                                        >
                                            {item.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                                            <Typography className="item-name" fontWeight={600} fontSize={14} noWrap sx={{ transition: 'color 0.15s' }}>{item.name}</Typography>
                                            {item.desc && (
                                                <Typography fontSize={12} color="text.secondary" noWrap>{item.desc}</Typography>
                                            )}
                                        </Stack>
                                        <Button
                                            size="small"
                                            variant={state ? 'outlined' : 'contained'}
                                            onClick={(e) => { e.stopPropagation(); cycleItem(key); }}
                                            sx={{
                                                minWidth: 100,
                                                height: 30,
                                                borderRadius: 2,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                flexShrink: 0,
                                                boxShadow: 'none',
                                                ...(isActive
                                                    ? { borderColor: '#4C4EFF', color: '#4C4EFF', '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' } }
                                                    : isRequested
                                                        ? { bgcolor: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#999' } }
                                                        : { bgcolor: '#4C4EFF', color: '#fff', border: '1px solid #4C4EFF', '&:hover': { bgcolor: '#3739b7' } }),
                                            }}
                                        >
                                            {btnLabel}
                                        </Button>
                                    </Stack>
                                );
                            })}

                            {/* Bottom loader — shown while fetching next API page */}
                            {isLoading && (
                                <Stack alignItems="center" sx={{ py: 1.5 }}>
                                    <CircularProgress size={22} sx={{ color: '#4C4EFF' }} />
                                </Stack>
                            )}
                        </Stack>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
