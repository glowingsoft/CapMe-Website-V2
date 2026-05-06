import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Expects: open, onClose, hashtag, messages
export default function HashtagModal({ open, onClose, hashtag, messages = [] }) {
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
                            <Box key={msg.id} sx={{ p: 2, bgcolor: '#f5f7ff', borderRadius: 2 }}>
                                <Typography fontWeight={700}>{msg.user?.name || msg.user}</Typography>
                                <Typography fontSize={13} sx={{ color: '#222', mt: 0.5 }}>{msg.content || msg.text}</Typography>
                                <Typography fontSize={12} sx={{ color: '#888', mt: 0.5 }}>{msg.time}</Typography>
                            </Box>
                        ))
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
