import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useGetMessagesByTagQuery } from 'src/store/Reducer/rooms-api';

import PostCard from './post-card';

// Expects: open, onClose, hashtag (without #), roomId, onMessageClick
export default function HashtagModal({ open, onClose, hashtag, roomId, onMessageClick }) {
    const tagKey = hashtag?.startsWith('#') ? hashtag.slice(1) : hashtag;

    const { data, isLoading } = useGetMessagesByTagQuery(
        { tag: tagKey, roomId },
        { skip: !open || !tagKey }
    );

    const messages = data?.messages ?? [];

    const handleMessageCardClick = (msg) => {
        onMessageClick?.(msg);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Messages with <span style={{ color: '#4C4EFF' }}>#{tagKey}</span>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Stack alignItems="center" py={3}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        {messages.length === 0 ? (
                            <Typography color="text.secondary">No messages found for this hashtag.</Typography>
                        ) : (
                            messages.map((msg) => (
                                <Box
                                    key={msg._id ?? msg.id}
                                    onClick={() => handleMessageCardClick(msg)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'opacity 0.18s ease',
                                        '&:hover': { opacity: 0.85 },
                                    }}
                                >
                                    <PostCard post={msg} onCommentClick={() => handleMessageCardClick(msg)} />
                                </Box>
                            ))
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
