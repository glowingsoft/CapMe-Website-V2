import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { useRef, useState, useEffect } from 'react';
import { closeOverlayDrawers } from 'src/utils/drawer-events';

import { Iconify } from 'src/components/iconify';

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
}) {
    const fileInputRef = useRef();
    const [itemStates, setItemStates] = useState({});

    // reset button states when modal reopens
    useEffect(() => {
        if (open) setItemStates({});
    }, [open]);

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

    const filtered = data.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
    );

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

                {/* List */}
                <Box
                    sx={{
                        px: 2,
                        pb: 3,
                        maxHeight: 420,
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#e0e0e0 transparent',
                    }}
                >
                    {filtered.length === 0 ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6, gap: 1 }}>
                            <Iconify icon="solar:inbox-line-duotone" width={44} sx={{ color: '#ccc' }} />
                            <Typography color="text.secondary" fontSize={14}>No results found.</Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={0.5}>
                            {filtered.map((item, i) => {
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
                                        key={i}
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
                        </Stack>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
