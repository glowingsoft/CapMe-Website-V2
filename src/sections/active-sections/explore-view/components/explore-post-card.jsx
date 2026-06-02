import RoomAvatar from 'src/components/room-avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import HashtagAction from 'src/components/hashtags/hashtag-action';
import FileMessage from 'src/sections/active-sections/home-view/components/file-message';
import ImagePreviewDialog from 'src/sections/active-sections/home-view/components/image-preview-dialog';
import { AutoLinkPreview } from 'src/sections/active-sections/home-view/components/message-link-preview';

function renderWithLinks(text) {
    const parts = text.split(/(https?:\/\/[^\s<>"{}|\\^`[\]]+|#[\p{L}\p{N}_]+)/u);
    return parts.map((part, i) =>
        part.startsWith('http') ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#4C4EFF', textDecoration: 'none', fontWeight: 500 }}
            >
                {part}
            </a>
        ) : part.startsWith('#') ? (
            <span key={i} style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer' }}>
                {part}
            </span>
        ) : (
            part
        )
    );
}

const VISIBILITY_CONFIG = {
    public: { icon: 'solar:global-bold', labelKey: 'search.visibility_public', color: '#43a047' },
    friends: { icon: 'solar:users-group-rounded-bold', labelKey: 'search.visibility_private_friends', color: '#4C4EFF' },
    private: { icon: 'solar:lock-bold', labelKey: 'search.visibility_private', color: '#9e9e9e' },
};

const MENU_ITEMS = [
    { label: 'Copy', icon: 'solar:copy-bold', action: 'copy' },
];

function PostCardSubheader({ time, visibility }) {
    const { t } = useTranslate('common');
    const cfg = visibility ? VISIBILITY_CONFIG[visibility] : null;
    return (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.2 }}>
            <Typography fontSize={12} color="text.secondary" lineHeight={1}>{time}</Typography>
            {cfg && (
                <>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#d0d0d0', flexShrink: 0 }} />
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                        <Iconify icon={cfg.icon} width={12} style={{ color: cfg.color, flexShrink: 0 }} />
                        <Typography fontSize={11} fontWeight={600} sx={{ color: cfg.color, lineHeight: 1 }}>
                            {t(cfg.labelKey)}
                        </Typography>
                    </Stack>
                </>
            )}
        </Stack>
    );
}

export default function PostCard({ post, onCommentClick, onMenuAction, canInteract }) {
    const navigate = useNavigate();
    const [anchor, setAnchor] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

    const openProfile = () => {
        window.dispatchEvent(new CustomEvent('openUserProfile', { detail: post.user }));
    };

    const handleCapme = () => {
        const query = `${post.content || ''} ${post.hashtags || ''}`.trim();
        if (!query) return;
        navigate(paths.dashboard.chatMe, { state: { query, createNewChat: true, source: 'post' } });
    };

    const handleLike = () => {
        setLiked((prev) => {
            setLikeCount((c) => (prev ? c - 1 : c + 1));
            return !prev;
        });
    };

    const handleOpen = (e) => {
        e.stopPropagation();
        setAnchor(e.currentTarget);
    };

    const handleClose = () => setAnchor(null);

    const handleAction = (action) => {
        if (action === 'copy' && post.content) {
            navigator.clipboard.writeText(post.content);
        }
        onMenuAction?.(action, post);
        handleClose();
    };

    return (
        <Card
            sx={{
                mb: 2.5,
                borderRadius: 4,
                boxShadow: '0px 2px 16px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                bgcolor: '#fff',
                border: '1px solid #f0f0f0',
            }}
        >
            {/* Header */}
            <CardHeader
                sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
                avatar={
                    <Box onClick={openProfile} sx={{ cursor: 'pointer', border: '2px solid #f0f0f0', borderRadius: '50%' }}>
                        <RoomAvatar image={post.user?.avatar} name={post.user?.name} size={44} />
                    </Box>
                }
                title={
                    <Typography
                        fontWeight={700}
                        fontSize={14}
                        lineHeight={1.3}
                        onClick={openProfile}
                        sx={{ cursor: 'pointer', '&:hover': { color: '#4C4EFF' }, transition: 'color 0.15s' }}
                    >
                        {post.user?.name}
                    </Typography>
                }
                subheader={<PostCardSubheader time={post.time} visibility={post.visibility} />}
                action={
                    <>
                        <IconButton
                            size="small"
                            onClick={handleOpen}
                            sx={{
                                mt: 1,
                                mr: 0.5,
                                border: '1.5px solid rgba(0,0,0,0.12)',
                                borderRadius: '50%',
                                width: 30,
                                height: 30,
                            }}
                        >
                            <Iconify icon="ph:dots-three-vertical-bold" width={16} style={{ color: '#555' }} />
                        </IconButton>

                        <Menu
                            anchorEl={anchor}
                            open={Boolean(anchor)}
                            onClose={handleClose}
                            disableScrollLock
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    elevation: 4,
                                    sx: {
                                        borderRadius: 3,
                                        minWidth: 170,
                                        maxWidth: 'calc(100vw - 32px)',
                                        mt: 0.5,
                                        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                                        border: '1px solid #f0f0f0',
                                        overflow: 'hidden',
                                    },
                                },
                            }}
                        >
                            {MENU_ITEMS.map(({ label, icon, action, danger }) => (
                                <MenuItem
                                    key={action}
                                    onClick={() => handleAction(action)}
                                    sx={{
                                        gap: 1.5,
                                        py: 1.2,
                                        px: 2,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: danger ? '#e53935' : 'text.primary',
                                        '&:hover': { bgcolor: danger ? '#fff5f5' : '#f5f6f8' },
                                    }}
                                >
                                    <Iconify icon={icon} width={18} style={{ color: danger ? '#e53935' : '#555', flexShrink: 0 }} />
                                    {label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                }
            />

            {/* Link / meta preview */}
            {(post.meta?.url || post.content) && (
                <AutoLinkPreview text={post.content} meta={post.meta} noAutoFetch />
            )}

            {/* Image — only when no meta preview is taking over */}
            {!post.meta?.url && post.image && (
                <CardMedia
                    component="img"
                    image={post.image}
                    alt="Post visual"
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => { e.stopPropagation(); setImagePreviewOpen(true); }}
                    sx={{
                        width: '100%',
                        height: 480,
                        borderRadius: 2,
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                        cursor: 'pointer',
                    }}
                />
            )}

            <ImagePreviewDialog
                open={imagePreviewOpen}
                src={post.image}
                alt="Post image preview"
                onClose={() => setImagePreviewOpen(false)}
            />

            {/* File attachment (uploaded via + menu) */}
            {post.file && (
                <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
                    <FileMessage file={post.file} />
                </Box>
            )}

            {/* Post text + hashtags */}
            {(post.content || post.hashtags) && (
                <CardContent sx={{ px: 2.5, pt: post.image ? 1.5 : 1, pb: '12px !important' }}>
                    {post.content && (() => {
                        const urlInContent = post.meta?.url
                            ? post.content.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/)?.[0] ?? post.meta.url
                            : null;
                        const displayContent = urlInContent ? post.content.replace(urlInContent, '').trim() : post.content;
                        return displayContent ? (
                            <Typography variant="body2" color="text.primary" lineHeight={1.7} sx={{ whiteSpace: 'pre-wrap' }}>
                                {renderWithLinks(displayContent)}
                            </Typography>
                        ) : null;
                    })()}
                    {post.hashtags && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#9e9e9e', fontSize: 13 }}>
                            {post.hashtags}
                        </Typography>
                    )}
                </CardContent>
            )}

            {canInteract && <Box sx={{ px: 2.5, pt: 0.5, pb: 1.5 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                    <Stack
                        direction="row" spacing={0.7} alignItems="center"
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={handleLike}
                    >
                        <Iconify
                            icon={liked ? 'ic:round-favorite' : 'ic:round-favorite-border'}
                            width={18}
                            style={{
                                color: liked ? '#e53935' : '#9e9e9e',
                                transition: 'color 0.15s, transform 0.15s',
                                transform: liked ? 'scale(1.2)' : 'scale(1)',
                            }}
                        />
                        <Typography variant="body2" fontWeight={600} color={liked ? '#e53935' : 'text.secondary'}>
                            {likeCount}
                        </Typography>
                    </Stack>
                    <Stack
                        direction="row" spacing={0.7} alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={onCommentClick}
                    >
                        <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {post.stats?.comments}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                        <Iconify icon="mdi-light:share" width={18} style={{ color: '#43a047' }} />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {post.stats?.shares}
                        </Typography>
                    </Stack>

                    <HashtagAction text={`${post.content || ''} ${post.hashtags || ''}`} />

                    {(post.content || post.hashtags) && (
                        <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                            sx={{ cursor: 'pointer' }}
                            onClick={handleCapme}
                        >
                            <Box
                                component="img"
                                src={`${import.meta.env.BASE_URL}logo/logo-single.svg`}
                                alt="Capme"
                                sx={{ width: 18, height: 18, objectFit: 'contain' }}
                            />
                        </Stack>
                    )}
                </Stack>
            </Box>}
        </Card>
    );
}
