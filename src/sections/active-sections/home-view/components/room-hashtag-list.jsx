import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { useGetRoomTagsQuery } from 'src/store/Reducer/rooms-api';

// Expects: open, onClose, roomId, onHashtagClick
export default function RoomHashtagList({ open, onClose, roomId, onHashtagClick }) {
    const { data: tags = [], isLoading } = useGetRoomTagsQuery(
        { roomId },
        { skip: !open || !roomId }
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Iconify icon="mdi:tag" width={20} style={{ color: '#4C4EFF', marginRight: 8, verticalAlign: 'middle' }} />
                Hashtags in Room
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Stack alignItems="center" py={2}>
                        <CircularProgress size={24} />
                    </Stack>
                ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {tags.length === 0 ? (
                            <span style={{ color: '#888' }}>No hashtags found.</span>
                        ) : (
                            tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{ bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={() => onHashtagClick?.(tag)}
                                />
                            ))
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
