import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import { Iconify } from 'src/components/iconify';

export default function PinnedMessagesDisplay({ pinnedMessages = [], onUnpin, onMessageClick }) {
    const [expanded, setExpanded] = useState(false);

    if (!pinnedMessages || pinnedMessages.length === 0) {
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
                    Pinned Messages ({pinnedMessages.length})
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
                    {pinnedMessages.map((msg) => (
                        <Box
                            key={msg.id}
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
                                src={msg.user?.avatar}
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
                                {msg.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography fontSize={12} fontWeight={600}>
                                    {msg.user?.name}
                                </Typography>
                                <Typography
                                    fontSize={12}
                                    sx={{
                                        color: '#555',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {msg.content}
                                </Typography>
                            </Box>

                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUnpin?.(msg.id);
                                }}
                                sx={{
                                    color: '#4C4EFF',
                                    '&:hover': { bgcolor: 'rgba(76,78,255,0.10)' },
                                }}
                            >
                                <Iconify icon="solar:pin-bold" width={16} />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
