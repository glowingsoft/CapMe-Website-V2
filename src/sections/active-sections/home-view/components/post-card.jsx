import Avatar from '@mui/material/Avatar';
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
import React, { memo, useCallback, useMemo, useState } from 'react';

import { Iconify } from 'src/components/iconify';
import HashtagAction from 'src/components/hashtags/hashtag-action';
import { toast } from 'src/components/snackbar';

import FileMessage from './file-message';
import ImagePreviewDialog from './image-preview-dialog';
import MessageDeleteModal from './message-delete-modal';
import MessageEditModal from './message-edit-modal';

function renderWithHashtags(text) {
    const parts = text.split(/(#[\p{L}\p{N}_]+)/u);
    return parts.map((part, i) =>
        part.startsWith('#') ? (
            <span key={i} style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer' }}>
                {part}
            </span>
        ) : (
            part
        )
    );
}

const VISIBILITY_CONFIG = {
    public: { icon: 'solar:global-bold', label: 'Public', color: '#43a047' },
    friends: { icon: 'solar:users-group-rounded-bold', label: 'Friends', color: '#4C4EFF' },
    private: { icon: 'solar:lock-bold', label: 'Private', color: '#9e9e9e' },
};

function PostCardSubheader({ time, visibility }) {
    const cfg = visibility ? VISIBILITY_CONFIG[visibility] : null;

    return (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.2 }}>
            <Typography fontSize={12} color="text.secondary" lineHeight={1}>
                {time}
            </Typography>
            {cfg && (
                <>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#d0d0d0', flexShrink: 0 }} />
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                        <Iconify icon={cfg.icon} width={12} style={{ color: cfg.color, flexShrink: 0 }} />
                        <Typography fontSize={11} fontWeight={600} sx={{ color: cfg.color, lineHeight: 1 }}>
                            {cfg.label}
                        </Typography>
                    </Stack>
                </>
            )}
        </Stack>
    );
}

function PostCard({ post, onCommentClick, onMenuAction }) {
    const [anchor, setAnchor] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const isPinned = Boolean(post.isPinned);

    const menuItems = useMemo(
        () => [
            { label: 'Copy', icon: 'solar:copy-bold', action: 'copy' },
            { label: 'Edit', icon: 'solar:pen-bold', action: 'edit' },
            { label: isPinned ? 'Unpin Message' : 'Pin Message', icon: 'solar:pin-bold', action: 'pin' },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold', action: 'delete', danger: true },
        ],
        [isPinned]
    );

    const openProfile = useCallback(() => {
        window.dispatchEvent(new CustomEvent('openUserProfile', { detail: post.user }));
    }, [post.user]);

    const handleLike = useCallback(() => {
        setLiked((prev) => {
            setLikeCount((c) => (prev ? c - 1 : c + 1));
            return !prev;
        });
    }, []);

    const handleComment = useCallback(() => {
        onCommentClick?.(post);
    }, [onCommentClick, post]);

    const handleOpen = useCallback((e) => {
        e.stopPropagation();
        setAnchor(e.currentTarget);
    }, []);

    const handleClose = useCallback(() => setAnchor(null), []);

    const handleAction = useCallback(
        (action) => {
            handleClose();

            switch (action) {
                case 'copy':
                    if (post.content) {
                        navigator.clipboard.writeText(post.content);
                        toast.success('Message copied to clipboard');
                    }
                    break;

                case 'edit':
                    setEditOpen(true);
                    break;

                case 'pin': {
                    const nextPinned = !isPinned;
                    window.dispatchEvent(
                        new CustomEvent('pinMessage', {
                            detail: {
                                messageId: post.id,
                                isPinned: nextPinned,
                                message: post,
                            },
                        })
                    );
                    toast.success(nextPinned ? 'Message pinned' : 'Message unpinned');
                    break;
                }

                case 'delete':
                    setDeleteConfirmOpen(true);
                    break;

                default:
                    break;
            }

            onMenuAction?.(action, post);
        },
        [handleClose, isPinned, onMenuAction, post]
    );

    const handleConfirmDelete = useCallback(() => {
        setDeleteConfirmOpen(false);
        window.dispatchEvent(new CustomEvent('deleteMessage', { detail: { messageId: post.id } }));
        toast.success('Message deleted');
    }, [post.id]);

    const handleSaveEdit = useCallback(
        (newContent) => {
            setEditOpen(false);
            window.dispatchEvent(new CustomEvent('editMessage', { detail: { messageId: post.id, content: newContent } }));
            toast.success('Message updated');
        },
        [post.id]
    );

    const openImagePreview = useCallback((e) => {
        e.stopPropagation();
        setImagePreviewOpen(true);
    }, []);

    return (
        <>
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
                <CardHeader
                    sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
                    avatar={
                        <Avatar
                            src={post.user?.avatar || undefined}
                            onClick={openProfile}
                            sx={{
                                width: 44,
                                height: 44,
                                border: '2px solid #f0f0f0',
                                bgcolor: '#4C4EFF',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {post.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
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
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                slotProps={{
                                    paper: {
                                        elevation: 4,
                                        sx: {
                                            borderRadius: 3,
                                            minWidth: 170,
                                            mt: 0.5,
                                            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                                            border: '1px solid #f0f0f0',
                                            overflow: 'hidden',
                                        },
                                    },
                                }}
                            >
                                {menuItems.map(({ label, icon, action, danger }) => (
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

                {post.image && (
                    <CardMedia
                        component="img"
                        image={post.image}
                        alt="Post visual"
                        loading="lazy"
                        decoding="async"
                        onClick={openImagePreview}
                        sx={{
                            width: '100%',
                            height: 480,
                            borderRadius: 2,
                            objectFit: 'cover',
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

                {post.file && (
                    <Box
                        sx={{
                            px: post.file?.type?.startsWith('image/') ? 0 : 2.5,
                            pt: 1.5,
                            pb: post.file?.type?.startsWith('image/') ? 0 : 0.5,
                        }}
                    >
                        <FileMessage file={post.file} />
                    </Box>
                )}

                {(post.content || post.hashtags) && (
                    <CardContent sx={{ px: 2.5, pt: post.image ? 1.5 : 1, pb: '12px !important' }}>
                        {post.content && (
                            <Typography variant="body2" color="text.primary" lineHeight={1.7} sx={{ whiteSpace: 'pre-wrap' }}>
                                {renderWithHashtags(post.content)}
                            </Typography>
                        )}
                        {post.hashtags && (
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                {renderWithHashtags(post.hashtags)}
                            </Typography>
                        )}
                    </CardContent>
                )}

                <Box sx={{ px: 2.5, pt: 0.5, pb: 1.5 }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
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

                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ cursor: 'pointer' }} onClick={handleComment}>
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

                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ cursor: 'pointer' }}>
                            <Box component="img" src="/logo/logo-single.svg" alt="Capme" sx={{ width: 18, height: 18, objectFit: 'contain' }} />
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {post.stats?.capme ?? 0}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Card>

            <MessageDeleteModal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
            />

            <MessageEditModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onConfirm={handleSaveEdit}
                initialContent={post.content || ''}
            />
        </>
    );
}

export default memo(PostCard);
