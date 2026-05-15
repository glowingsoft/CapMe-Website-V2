import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import { Iconify } from 'src/components/iconify';

function AttachmentPreview({ attachments = [] }) {
    if (!attachments.length) return null;
    const first = attachments[0];
    const type = (first.type ?? '').toLowerCase();
    const url = first.url ?? '';
    const name = first.name ?? 'Attachment';

    if (type.startsWith('image/') || type === 'image') {
        return (
            <Box
                component="img"
                src={url}
                alt={name}
                sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }}
            />
        );
    }
    if (type.startsWith('video/') || type === 'video') {
        return (
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon="solar:video-frame-play-bold" width={20} style={{ color: '#fff' }} />
            </Box>
        );
    }
    if (type.startsWith('audio/') || type === 'audio' || type === 'voice') {
        return (
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(76,78,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon="solar:microphone-bold" width={20} style={{ color: '#4C4EFF' }} />
            </Box>
        );
    }
    return (
        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Iconify icon="solar:file-bold" width={20} style={{ color: '#555' }} />
        </Box>
    );
}

function PinnedMessageSkeleton() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, bgcolor: '#fff', border: '1px solid rgba(76,78,255,0.10)', borderRadius: 2, p: 1 }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="40%" height={14} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="75%" height={12} />
            </Box>
            <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1, flexShrink: 0 }} />
        </Box>
    );
}

export default function PinnedMessagesDisplay({ pinnedMessages = [], isFetching = false, onUnpin, onMessageClick }) {
    const [expanded, setExpanded] = useState(false);
    const count = pinnedMessages.length;

    if (!isFetching && count === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: 'rgba(76,78,255,0.06)',
                borderBottom: '2px solid #4C4EFF',
                borderRadius: 4,
                px: 1.75,
                pt: expanded ? 1 : 1,
                pb: expanded ? 1.4 : 0.35,
                mb: 1.25,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 1.15 : 0 }}>
                <Typography fontSize={12.5} fontWeight={700} color="#4C4EFF" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="solar:pin-bold" width={16} sx={{ mr: 0.8, verticalAlign: 'middle' }} />
                    Pinned Messages {isFetching ? <Skeleton variant="text" width={20} height={16} sx={{ ml: 0.5, display: 'inline-block' }} /> : `(${count})`}
                </Typography>

                <IconButton
                    size="small"
                    onClick={() => setExpanded((prev) => !prev)}
                    sx={{
                        border: '1.5px solid rgba(0,0,0,0.12)',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        color: '#555',
                        bgcolor: 'rgba(76,78,255,0.08)',
                        flexShrink: 0,
                        '&:hover': { bgcolor: 'rgba(76,78,255,0.16)' },
                    }}
                    aria-label={expanded ? 'Collapse pinned messages' : 'Expand pinned messages'}
                >
                    <Iconify icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} />
                </IconButton>
            </Box>

            {expanded && (
                <Stack spacing={1.15}>
                    {isFetching ? (
                        Array.from({ length: count || 2 }).map((_, i) => <PinnedMessageSkeleton key={i} />)
                    ) : pinnedMessages.map((msg) => {
                        const messageId = msg.id ?? msg._id;
                        const user = msg.user ?? msg.sender ?? {};
                        const userName = user.name ?? msg.sendername ?? 'Unknown';
                        const userAvatar = user.avatar ?? user.image ?? msg.senderImage ?? '';
                        const content = msg.content ?? msg.text ?? '';
                        const attachments = msg.attachments ?? [];
                        const hasAttachment = attachments.length > 0;

                        return (
                        <Box
                            key={messageId}
                            onClick={() => onMessageClick?.(msg)}
                            sx={{
                                bgcolor: '#fff',
                                border: '1px solid rgba(76,78,255,0.18)',
                                borderRadius: 2,
                                p: 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.2,
                                '&:hover': {
                                    bgcolor: 'rgba(76,78,255,0.04)',
                                    borderColor: '#4C4EFF',
                                },
                            }}
                        >
                            <Avatar
                                src={userAvatar || undefined}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: '#4C4EFF',
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {userName?.charAt(0).toUpperCase()}
                            </Avatar>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography fontSize={12} fontWeight={600}>
                                    {userName}
                                </Typography>
                                {content ? (
                                    <Typography
                                        fontSize={12}
                                        sx={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {content}
                                    </Typography>
                                ) : hasAttachment && (
                                    <Typography fontSize={12} sx={{ color: '#888', fontStyle: 'italic' }}>
                                        {attachments[0].name || 'Attachment'}
                                    </Typography>
                                )}
                            </Box>

                            {hasAttachment && (
                                <AttachmentPreview attachments={attachments} />
                            )}

                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUnpin?.(messageId);
                                }}
                                sx={{
                                    color: '#4C4EFF',
                                    '&:hover': { bgcolor: 'rgba(76,78,255,0.10)' },
                                }}
                            >
                                <Iconify icon="solar:pin-bold" width={16} />
                            </IconButton>
                        </Box>
                    );
                    })}
                </Stack>
            )}
        </Box>
    );
}
