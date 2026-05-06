import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
const RoomHashtagList = React.lazy(() => import('./room-hashtag-list'));

// ── Single message bubble ──────────────────────────────────────────
function MessageItem({ message, onMessageClick }) {
    return (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
            <Avatar src={message.user.avatar} sx={{ width: 36, height: 36, mt: 0.3 }} />
            <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }}>
                    <Typography fontSize={13} fontWeight={700} color="text.primary">
                        {message.user.name}
                    </Typography>
                    <Typography fontSize={11} color="text.disabled">
                        {message.time}
                    </Typography>
                </Stack>

                {message.image && (
                    <CardMedia
                        component="img"
                        image={message.image}
                        alt="post"
                        sx={{ borderRadius: 2, width: '100%', maxHeight: 320, objectFit: 'cover', mb: 1 }}
                    />
                )}

                {message.content && (
                    <Typography fontSize={13} color="text.primary" lineHeight={1.6}>
                        {String(message.content).split(/(#[\p{L}\p{N}_]+)/gu).map((part, idx) =>
                            part.startsWith && part.startsWith('#') ? (
                                <span
                                    key={part + idx}
                                    style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer', marginRight: 6 }}
                                >
                                    {part}
                                </span>
                            ) : (
                                part
                            )
                        )}
                    </Typography>
                )}

                {message.hashtags && (
                    <Typography fontSize={12} sx={{ mt: 0.3, color: '#222' }}>
                        {message.hashtags.split(/\s+/).map((tag, idx) =>
                            tag.startsWith('#') ? (
                                <span
                                    key={tag + idx}
                                    style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer', marginRight: 6 }}
                                >
                                    {tag}
                                </span>
                            ) : (
                                tag + ' '
                            )
                        )}
                    </Typography>
                )}

                {message.stats && (
                    <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Iconify icon="ic:round-favorite" width={15} style={{ color: '#e53935' }} />
                            <Typography variant="caption" color="text.secondary">
                                {message.stats.likes}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row" spacing={0.5} alignItems="center"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => onMessageClick?.(message)}
                        >
                            <Iconify icon="mingcute:chat-3-line" width={15} style={{ color: '#9e9e9e' }} />
                            <Typography variant="caption" color="text.secondary">
                                {message.stats.comments}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Iconify icon="mdi-light:share" width={15} style={{ color: '#43a047' }} />
                            <Typography variant="caption" color="text.secondary">
                                {message.stats.shares}
                            </Typography>
                        </Stack>
                    </Stack>
                )}
            </Box>

            <IconButton size="small" sx={{ alignSelf: 'flex-start', mt: 0.3 }}>
                <Iconify icon="ph:dots-three-vertical-bold" width={18} style={{ color: '#bbb' }} />
            </IconButton>
        </Box>
    );
}

// ── Main channel view ──────────────────────────────────────────────
export default function RoomChannel({
    room = {},
    messages = [],
    currentUser = { name: 'Alexa' },
    onMessageClick,
}) {
    const bottomRef = useRef(null);
    // Hashtag list/modal logic removed; now handled in header only

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 120px)',
                bgcolor: '#fff',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0px 2px 12px rgba(0,0,0,0.07)',
            }}
        >
            {/* Scrollable feed */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 3,
                    py: 2,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(0,0,0,0.12)',
                        borderRadius: '4px',
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(0,0,0,0.25)',
                    },
                }}
            >
                {messages.map((item, index) =>
                    item.type === 'date' ? (
                        <OldMessagesLabel key={index} label={item.label} />
                    ) : (
                        <MessageItem key={item.id} message={item} onMessageClick={onMessageClick} />
                    )
                )}
                <div ref={bottomRef} />
            </Box>

            {/* Pinned input */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: '#fff',
                }}
            >
                <IconButton size="small" sx={{ color: 'text.disabled' }}>
                    <Iconify icon="mingcute:add-circle-line" width={22} />
                </IconButton>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        bgcolor: '#f5f5f5',
                        borderRadius: 5,
                        px: 2,
                        py: 0.8,
                        gap: 1,
                    }}
                >
                    <input
                        type="text"
                        placeholder={`Hi, I am from ${currentUser?.name ?? 'Alexa'}`}
                        style={{
                            flexGrow: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: 14,
                            background: 'transparent',
                            color: 'inherit',
                        }}
                    />
                    <IconButton size="small" sx={{ p: 0, color: '#6c63ff' }}>
                        <Iconify icon="ion:send" width={18} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}