import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';
import { extractHashtags } from 'src/components/hashtags/hashtag-utils';

// Expects: open, onClose, messages, onHashtagClick
export default function RoomHashtagList({ open, onClose, messages = [], onHashtagClick }) {
    // Collect all unique hashtags from all messages
    const allTags = React.useMemo(() => {
        const tags = new Set();
        messages.forEach(msg => {
            extractHashtags(msg.content || '').forEach(t => tags.add(t));
            if (msg.hashtags) {
                msg.hashtags.split(/\s+/).forEach(t => {
                    if (t.startsWith('#')) tags.add(t);
                });
            }
        });
        return Array.from(tags);
    }, [messages]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Iconify icon="mdi:tag" width={20} style={{ color: '#4C4EFF', marginRight: 8, verticalAlign: 'middle' }} />
                Hashtags in Room
            </DialogTitle>
            <DialogContent dividers>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {allTags.length === 0 ? (
                        <span style={{ color: '#888' }}>No hashtags found.</span>
                    ) : (
                        allTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{ bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                onClick={() => onHashtagClick?.(tag)}
                            />
                        ))
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
