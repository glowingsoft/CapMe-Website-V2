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
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';

const MENU_ITEMS = [
  { label: 'Copy',         icon: 'solar:copy-bold',              action: 'copy'   },
  { label: 'Edit',         icon: 'solar:pen-bold',               action: 'edit'   },
  { label: 'Pin Message',  icon: 'solar:pin-bold',               action: 'pin'    },
  { label: 'Delete',       icon: 'solar:trash-bin-trash-bold',   action: 'delete', danger: true },
];

export default function PostCard({ post, onCommentClick, onMenuAction }) {
  const [anchor, setAnchor] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);

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
          <Avatar
            src={post.user?.avatar || undefined}
            sx={{
              width: 44,
              height: 44,
              border: '2px solid #f0f0f0',
              bgcolor: '#4C4EFF',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {post.user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography fontWeight={700} fontSize={14} lineHeight={1.3}>
            {post.user?.name}
          </Typography>
        }
        subheader={
          <Typography fontSize={12} color="text.secondary" lineHeight={1.4}>
            {post.user?.username}
          </Typography>
        }
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

      {/* Image */}
      {post.image && (
        <CardMedia
          component="img"
          image={post.image}
          alt="Post visual"
          sx={{
            width: '100%',
            height: 480,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Post text + hashtags */}
      {(post.content || post.hashtags) && (
        <CardContent sx={{ px: 2.5, pt: post.image ? 1.5 : 1, pb: '12px !important' }}>
          {post.content && (
            <Typography variant="body2" color="text.primary" lineHeight={1.7}>
              <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
                {post.user?.name}{' '}
              </Typography>
              {post.content}
            </Typography>
          )}
          {post.hashtags && (
            <Typography variant="body2" sx={{ mt: 0.5, color: '#9e9e9e', fontSize: 13 }}>
              {post.hashtags}
            </Typography>
          )}
        </CardContent>
      )}

      {/* Stats row — below message */}
      <Box sx={{ px: 2.5, pt: 0.5, pb: 1.5 }}>
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

          {/* Capme action — functional later */}
          <Stack direction="row" spacing={0.7} alignItems="center" sx={{ cursor: 'pointer' }}>
            <Box component="img" src="/logo/logo-single.svg" alt="Capme" sx={{ width: 18, height: 18, objectFit: 'contain' }} />
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {post.stats?.capme ?? 0}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}