import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import PostCard from './post-card';

// Expects: open, onClose, hashtag, messages, onMessageClick
export default function HashtagModal({ open, onClose, hashtag, messages = [], onMessageClick }) {
    const handleMessageCardClick = (msg) => {
        onMessageClick?.(msg);
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Messages with <span style={{ color: '#4C4EFF' }}>{hashtag}</span>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {messages.length === 0 ? (
                        <Typography color="text.secondary">No messages found for this hashtag.</Typography>
                    ) : (
                        messages.map((msg) => (
                            <Box
                                key={msg.id}
                                onClick={() => handleMessageCardClick(msg)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'opacity 0.18s ease',
                                    '&:hover': {
                                        opacity: 0.85,
                                    },
                                }}
                            >
                                <PostCard post={msg} onCommentClick={() => handleMessageCardClick(msg)} />
                            </Box>
                        ))
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
