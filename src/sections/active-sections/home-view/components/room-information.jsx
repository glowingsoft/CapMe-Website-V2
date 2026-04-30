import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmModal } from 'src/components/custom-dialog';
import { MOCK_FOLLOWERS } from '../mock';
import DrawerHeader from './drawer-header';

export default function RoomInformation({
    open,
    onClose,
    room,
    followers = MOCK_FOLLOWERS,
    onEdit,
    onShare,
    onDownloadMedia,
    onDeleteRoom,
    onRemoveFollower,
}) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [removingFollower, setRemovingFollower] = useState(null);

    const roomName = room?.name || 'Creative Rooms';
    const roomDescription = room?.description || 'This is new room';
    const visibility = room?.visibility || 'Friends';
    const createdAt = room?.createdAt || 'July 3rd, 2025';

    const roomInitial = roomName?.charAt(0)?.toUpperCase() || 'R';

    const handleDeleteRoom = () => {
        setDeleteModalOpen(true);
    };

    const handleRemoveFollower = (follower) => {
        setRemovingFollower(follower);
        setRemoveModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModalOpen(false);
        onDeleteRoom?.();
    };

    const handleConfirmRemove = () => {
        setRemoveModalOpen(false);

        if (removingFollower) {
            onRemoveFollower?.(removingFollower);
        }

        setRemovingFollower(null);
    };

    return (
        <>
            <Drawer
                open={open}
                onClose={onClose}
                anchor="right"
                hideBackdrop
                disableEnforceFocus
                disableAutoFocus
                disableScrollLock
                ModalProps={{ sx: { pointerEvents: 'none' } }}
                PaperProps={{
                    sx: {
                        width: 420,
                        maxWidth: '100%',
                        borderTopLeftRadius: 20,
                        overflow: 'hidden',
                        bgcolor: '#fff',
                        mt: '105px',
                        height: 'calc(100vh - 105px)',
                        pointerEvents: 'auto',
                    },
                }}
            >
                {/* Header */}
                <DrawerHeader
                    title={roomName}
                    onBack={onClose}
                    onEdit={onEdit}
                    onShare={onShare}
                />

                <Scrollbar>
                    {/* Avatar + Basic Info */}
                    <Stack alignItems="center" sx={{ pt: 4, pb: 2, px: 2 }}>
                        {room?.image ? (
                            <Box
                                component="img"
                                src={room.image}
                                alt={roomName}
                                sx={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 4,
                                    bgcolor: '#4C4EFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography sx={{ fontSize: 72, fontWeight: 700, color: '#fff' }}>
                                    {roomInitial}
                                </Typography>
                            </Box>
                        )}

                        <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                            {roomName}
                        </Typography>

                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1 }}>
                            <Iconify icon="solar:calendar-bold" width={18} sx={{ color: 'text.primary' }} />

                            <Typography variant="body2" color="text.secondary">
                                Created on&nbsp; {createdAt}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Description */}
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Typography fontWeight={700} fontSize={16} sx={{ mb: 1 }}>
                            Description
                        </Typography>

                        <Box
                            sx={{
                                minHeight: 120,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                bgcolor: '#fff',
                                px: 2,
                                py: 1.5,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 15 }}>
                                {roomDescription}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Visibility */}
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Typography fontWeight={700} fontSize={16} sx={{ mb: 1 }}>
                            Visibility
                        </Typography>

                        <Box
                            sx={{
                                height: 56,
                                bgcolor: '#fff',
                                borderRadius: 2,
                                px: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                            }}
                        >
                            <Typography color="text.secondary" fontSize={15}>
                                {visibility}
                            </Typography>

                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: '#4C4EFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Iconify icon="mingcute:check-fill" width={18} sx={{ color: '#fff' }} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Stack spacing={2} sx={{ px: 2, pb: 3 }}>
                        <Box
                            onClick={onDownloadMedia}
                            sx={{
                                height: 64,
                                bgcolor: '#fff',
                                borderRadius: 2,
                                px: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                '&:hover': {
                                    bgcolor: '#f7f7f7',
                                },
                            }}
                        >
                            <Iconify icon="solar:download-minimalistic-bold" width={24} sx={{ color: '#000' }} />

                            <Typography fontSize={16} fontWeight={700}>
                                Downloaded Media
                            </Typography>
                        </Box>

                        <Box
                            onClick={handleDeleteRoom}
                            sx={{
                                height: 64,
                                bgcolor: '#fff',
                                borderRadius: 2,
                                px: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                '&:hover': {
                                    bgcolor: '#f7f7f7',
                                },
                            }}
                        >
                            <Iconify icon="solar:trash-bin-trash-bold" width={24} sx={{ color: '#000' }} />

                            <Typography fontSize={16} fontWeight={700}>
                                Delete Room
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Followers */}
                    <Box sx={{ px: 2, pb: 3 }}>
                        <Typography fontWeight={700} fontSize={16} sx={{ mb: 2 }}>
                            Followers
                        </Typography>

                        <Stack spacing={2}>
                            {followers.map((follower) => (
                                <Box
                                    key={follower.id}
                                    sx={{
                                        minHeight: 70,
                                        bgcolor: '#fff',
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                        <Avatar
                                            src={follower.avatar}
                                            sx={{
                                                width: 46,
                                                height: 46,
                                                flexShrink: 0,
                                            }}
                                        />

                                        <Typography
                                            fontSize={15}
                                            fontWeight={700}
                                            sx={{
                                                color: '#111',
                                                lineHeight: 1.3,
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {follower.name}
                                        </Typography>
                                    </Stack>

                                    <Button
                                        onClick={() => handleRemoveFollower(follower)}
                                        sx={{
                                            minWidth: 84,
                                            height: 40,
                                            borderRadius: 2,
                                            bgcolor: '#B90000',
                                            color: '#fff',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            ml: 1,
                                            '&:hover': {
                                                bgcolor: '#A00000',
                                            },
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Scrollbar>
            </Drawer>

            {/* Delete Room Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Room"
                description={`Are you sure you want to delete "${roomName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                confirmColor="#C40000"
                icon="solar:trash-bin-trash-bold"
                iconColor="#C40000"
            />

            {/* Remove Follower Modal */}
            <ConfirmModal
                open={removeModalOpen}
                onClose={() => setRemoveModalOpen(false)}
                onConfirm={handleConfirmRemove}
                title="Remove Follower"
                description={removingFollower ? `Are you sure you want to remove "${removingFollower.name}" from this room?` : ''}
                confirmLabel="Remove"
                confirmColor="#B90000"
                icon="solar:user-remove-bold"
                iconColor="#B90000"
            />
        </>
    );
}