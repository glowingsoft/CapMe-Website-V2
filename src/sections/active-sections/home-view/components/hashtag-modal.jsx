import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMessagesByTagQuery } from 'src/store/Reducer/rooms-api';

import PostCard from './post-card';

// Expects: open, onClose, hashtag (without #), roomId
export default function HashtagModal({ open, onClose, hashtag, roomId }) {
    const tagKey = hashtag?.startsWith('#') ? hashtag.slice(1) : hashtag;
    const navigate = useNavigate();
    const location = useLocation();

    const { data, isLoading } = useGetMessagesByTagQuery(
        { tag: tagKey, roomId },
        { skip: !open || !tagKey }
    );

    const messages = data?.messages ?? [];

    const handleMessageCardClick = (msg) => {
        const msgRoomId = msg.roomId ?? roomId;
        const msgRoomName = msg.roomname ?? '';
        if (!msgRoomId) return;

        onClose();

        const room = { id: msgRoomId, _id: msgRoomId, name: msgRoomName };
        const messageId = msg.id ?? msg._id;

        if (location.pathname?.startsWith('/home')) {
            window.dispatchEvent(new CustomEvent('openRoomMessage', { detail: { room, message: { ...msg, _id: messageId, id: messageId } } }));
        } else {
            navigate('/home', { state: { pendingRoom: room, pendingMessageId: messageId } });
        }
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
                                    <PostCard post={msg} onCommentClick={() => handleMessageCardClick(msg)} noAutoFetch hideRoomName />
                                </Box>
                            ))
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
